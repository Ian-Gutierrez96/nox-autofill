"use strict";

// ============================================================================
// Main
// ============================================================================

autofillEbay();

// ============================================================================
// Functions
// ============================================================================

async function autofillEbay() {
  const {
    profiles,
    scripts: { ebay },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (ebay.autocheckoutEnabled || ebay.autofillEnabled) &&
    Object.hasOwn(profiles, ebay.profileKey)
  ) {
    const profile = profiles[ebay.profileKey];

    switch (location.hostname) {
      case "www.ebay.com":
        switch (location.pathname) {
          case "/":
            if (notifications) {
              displayNotification(ebay);
            }
            break;
        }
        break;

      case "cart.ebay.com":
      case "cart.payments.ebay.com":
        cart(ebay);
        break;

      case "pay.ebay.com":
        shipping(ebay, profile);
        payment(ebay, profile);
        confirmAndPay(ebay);
        break;
    }
  }
}

function displayNotification(ebay) {
  const { autocheckoutEnabled } = ebay;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Ebay. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Ebay.",
  });
}

async function cart(ebay) {
  const { autocheckoutEnabled } = ebay;

  if (autocheckoutEnabled) {
    waitForSelector("#gxo-btn", { visible: true }).then((gxoBtn) =>
      gxoBtn.click()
    );

    const goToCheckoutButton = await waitForXPath(
      "//button[text()[contains(., 'Go to checkout')]]"
    );
    goToCheckoutButton.click();
  }
}

async function shipping(ebay, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = ebay;
  const { contact, shipping } = profile;
  const fields = {
    shippingCountry: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] select#country",
      value: shipping.country,
    },
    shippingFirstName: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#firstName",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#lastName",
      value: shipping.familyName,
    },
    shippingAddressLine1: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#addressLine1",
      value: shipping.addressLine1,
    },
    shippingAddressLine2: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#addressLine2",
      value: shipping.addressLine2,
    },
    shippingCity: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#city",
      value: shipping.addressLevel2,
    },
    shippingStateOrProvinceInput: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#stateOrProvince",
      value: firstAdministrativeLevels.has(shipping.country)
        ? firstAdministrativeLevels
            .get(shipping.country)
            .get(shipping.addressLevel1)
        : shipping.addressLevel1,
    },
    shippingStateOrProvinceSelect: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] select#stateOrProvince",
      value: shipping.addressLevel1,
    },
    shippingPostalCode: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#postalCode",
      value: shipping.postalCode,
    },
    shippingEmail: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#email",
      value: contact.email,
    },
    shippingEmailConfirm: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#emailConfirm",
      value: contact.email,
    },
    shippingPhoneNumber: {
      selector: "[data-test-id='SHIPPING_ADDRESS_FORM'] input#phoneNumber",
      value: contact.tel,
    },
  };

  if (autocheckoutEnabled) {
    waitForSelector(
      "[data-test-id='SHIPPING_ADDRESS_RECOMMENDATION_SUBMIT'] > button"
    ).then((useThisAddress) => useThisAddress.click());

    await fillEbayCountry(
      "[data-test-id='SHIPPING_ADDRESS_FORM'] .address-fields",
      fields.shippingCountry
    );

    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddressLine1,
      fields.shippingAddressLine2,
      fields.shippingPostalCode,
      fields.shippingPhoneNumber,
    ];

    switch (shipping.country) {
      case "SG":
        break;

      default:
        shippingFields.push(fields.shippingCity);
        break;
    }

    switch (shipping.country) {
      case "AT":
      case "BE":
      case "DE":
      case "NL":
      case "SG":
      case "CH":
        break;

      case "AU":
      case "CA":
      case "CN":
      case "FR":
      case "IN":
      case "IE":
      case "IT":
      case "PL":
      case "ES":
      case "GB":
      case "US":
        shippingFields.push(fields.shippingStateOrProvinceSelect);
        break;

      default:
        shippingFields.push(fields.shippingStateOrProvinceInput);
        break;
    }

    if (document.querySelector(fields.shippingEmail.selector)) {
      shippingFields.push(fields.shippingEmail, fields.shippingEmailConfirm);
    }

    for (const { selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode);
    }

    const addressSubmit = await waitForSelector(
      "button[data-test-id='ADD_ADDRESS_SUBMIT'], button[data-test-id='EDIT_ADDRESS_SUBMIT']"
    );
    addressSubmit.click();
  } else if (autofillEnabled) {
    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddressLine1,
      fields.shippingAddressLine2,
      fields.shippingCity,
      fields.shippingStateOrProvinceSelect,
      fields.shippingStateOrProvinceInput,
      fields.shippingPostalCode,
      fields.shippingEmail,
      fields.shippingEmailConfirm,
      fields.shippingPhoneNumber,
    ];

    await fillEbayCountry(
      "[data-test-id='SHIPPING_ADDRESS_FORM'] .address-fields",
      fields.shippingCountry
    );

    await Promise.all(
      shippingFields.map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }
}

async function payment(ebay, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = ebay;
  const { billing, payment, contact } = profile;
  const fields = {
    cardNumber: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#cardNumber",
      value: payment.ccNumber,
    },
    cardExpiryDate: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#cardExpiryDate",
      value: payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
    },
    cardSecurityCode: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#securityCode",
      value: payment.ccCSC,
    },
    cardHolderFirstName: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#cardHolderFirstName",
      value: payment.ccGivenName,
    },
    cardHolderLastName: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#cardHolderLastName",
      value: payment.ccFamilyName,
    },
    billingCountry: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] select#country",
      value: billing.country,
    },
    billingAddrLine1: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#addrLine1",
      value: billing.addressLine1,
    },
    billingAddrLine2: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#addrLine2",
      value: billing.addressLine2,
    },
    billingCity: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#city",
      value: billing.addressLevel2,
    },
    billingState: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] select#state",
      value: billing.addressLevel1,
    },
    billingStateOrProvince: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#stateOrProvince",
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
    },
    billingPostalCode: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#postalCode",
      value: billing.postalCode,
    },
    billingPhoneNumber: {
      selector:
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] input#phoneNumber",
      value: contact.tel,
    },
  };

  if (autocheckoutEnabled) {
    const paymentMethodsSection = await waitForSelector(
      "section[data-test-id='PAYMENT_METHODS']:not(.disabled)"
    );
    const radioGroupPaymentMethod = paymentMethodsSection.querySelector(
      "input[name='radio-group-paymentMethod']"
    );

    if (radioGroupPaymentMethod instanceof HTMLInputElement) {
      if (radioGroupPaymentMethod.labels[0]?.textContent === "Add new card") {
        waitForSelector("a[data-test-id='EXPAND_BILLING_ADDRESS']").then(
          (expandBillingAddress) => expandBillingAddress.click()
        );
        radioGroupPaymentMethod.click();

        await fillEbayCountry(
          "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] .address-fields",
          fields.billingCountry
        );

        const paymentFields = [
          fields.cardNumber,
          fields.cardExpiryDate,
          fields.cardSecurityCode,
          fields.cardHolderFirstName,
          fields.cardHolderLastName,
          fields.billingAddrLine1,
          fields.billingAddrLine2,
          fields.billingPostalCode,
          fields.billingPhoneNumber,
        ];

        switch (billing.country) {
          case "SG":
            break;

          default:
            paymentFields.push(fields.billingCity);
            break;
        }

        switch (billing.country) {
          case "AT":
          case "BE":
          case "DE":
          case "NL":
          case "SG":
          case "CH":
            break;

          case "AU":
          case "CA":
          case "CN":
          case "FR":
          case "IN":
          case "IE":
          case "IT":
          case "PL":
          case "ES":
          case "GB":
          case "US":
            paymentFields.push(fields.billingState);
            break;

          default:
            paymentFields.push(fields.billingStateOrProvince);
            break;
        }

        for (const { selector, value } of paymentFields) {
          await autofillSelector(selector, value, mode);
        }

        const addCard = await waitForSelector(
          "button[data-test-id='ADD_CARD'], button[data-test-id='EDIT_CARD']"
        );
        addCard.click();
      }
    }
  } else if (autofillEnabled) {
    const cardFields = [
      fields.cardNumber,
      fields.cardExpiryDate,
      fields.cardSecurityCode,
      fields.cardHolderFirstName,
      fields.cardHolderLastName,
    ];
    const billingFields = [
      fields.billingAddrLine1,
      fields.billingAddrLine2,
      fields.billingCity,
      fields.billingState,
      fields.billingStateOrProvince,
      fields.billingPostalCode,
      fields.billingPhoneNumber,
    ];

    waitForSelector("a[data-test-id='EXPAND_BILLING_ADDRESS']").then(
      (expandBillingAddress) => expandBillingAddress.click()
    );

    await Promise.all([
      Promise.all(
        cardFields.map(({ selector, value }) =>
          autofillSelector(selector, value, mode)
        )
      ),
      fillEbayCountry(
        "form[data-test-id='PAYMENT_METHODS_CREDIT_CARD_DETAILS_FORM'] .address-fields",
        fields.billingCountry
      ).then(() =>
        Promise.all(
          billingFields.map(({ selector, value }) =>
            autofillSelector(selector, value, mode)
          )
        )
      ),
    ]);
  }
}

async function confirmAndPay(ebay) {
  const { autocheckoutEnabled } = ebay;

  if (autocheckoutEnabled) {
    await waitForTimeout(1000);
    const confirmAndPayButton = await waitForSelector(
      "button[data-test-id='CONFIRM_AND_PAY_BUTTON']:not([aria-disabled='true'])"
    );
    confirmAndPayButton.click();
  }
}

async function fillEbayCountry(formSelector, countryField) {
  const [addressForm, countrySelectElement] = await Promise.all(
    [formSelector, countryField.selector].map((selector) =>
      waitForSelector(selector)
    )
  );

  if (countrySelectElement instanceof HTMLSelectElement) {
    await Promise.all([
      autofillSelector(countryField.selector, countryField.value, "fast"),
      countrySelectElement.value !== countryField.value
        ? waitForAddedNodes(addressForm)
        : null,
    ]);
  }
}
