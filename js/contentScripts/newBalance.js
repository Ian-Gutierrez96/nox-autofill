"use strict";

// ============================================================================
// Main
// ============================================================================

autofillNewBalance();

// ============================================================================
// Functions
// ============================================================================

async function autofillNewBalance() {
  const {
    profiles,
    scripts: { newBalance },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (newBalance.autocheckoutEnabled || newBalance.autofillEnabled) &&
    Object.hasOwn(profiles, newBalance.profileKey)
  ) {
    const profile = profiles[newBalance.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) {
          displayNotification(newBalance);
        }
        break;

      case "/cart/":
        cart(newBalance);
        break;

      case "/checkout-begin/":
        shipping(newBalance, profile);
        payment(newBalance, profile);
        orderSummary(newBalance);
        break;
    }
  }
}

function displayNotification(newBalance) {
  const { autocheckoutEnabled } = newBalance;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for New Balance. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for New Balance.",
  });
}

async function cart(newBalance) {
  const { autocheckoutEnabled } = newBalance;

  if (autocheckoutEnabled) {
    const checkoutBtn = await waitForSelector(
      "a[href='https://www.newbalance.com/checkout-begin/']"
    );
    checkoutBtn.click();
  }
}

async function shipping(newBalance, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = newBalance;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_firstName']",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_lastName']",
      value: shipping.familyName,
    },
    shippingAddress1: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_address1']",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_address2']",
      value: shipping.addressLine2,
    },
    shippingCity: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_city']",
      value: shipping.addressLevel2,
    },
    shippingStateCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] select[name$='_stateCode']",
      value: shipping.addressLevel1,
    },
    shippingPostalCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_postalCode']",
      value: shipping.postalCode,
    },
    shippingPhone: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_phone']",
      typeOptions: { keys: true },
      value: contact.tel,
    },
    shippingEmail: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_email']",
      value: contact.email,
    },
  };

  if (autocheckoutEnabled) {
    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddress1,
      fields.shippingAddress2,
      fields.shippingCity,
      fields.shippingStateCode,
      fields.shippingPostalCode,
      fields.shippingPhone,
      fields.shippingEmail,
    ];

    for (const { options, selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForTimeout(1000);
    const submitShippingBtn = await waitForSelector(".submit-shipping", {
      visible: true,
    });
    submitShippingBtn.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function payment(newBalance, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = newBalance;
  const { billing, contact, payment } = profile;
  const fields = {
    cardNumber: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='cardNumber']",
      value: payment.ccNumber,
    },
    expirationMonth: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='expirationMonth']",
      value: payment.ccExpMonth,
    },
    expirationYear: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='expirationYear']",
      value: "20" + payment.ccExpYear,
    },
    expMonthYear: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='expMonthYear']",
      value: payment.ccExpMonth.padStart(2, "0") + "/20" + payment.ccExpYear,
    },
    securityCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='securityCode']",
      value: payment.ccCSC,
    },
    savedPaymentSecurityCode: {
      options: { polling: { visible: true } },
      selector: ".saved-payment-instrument .saved-payment-security-code",
      value: payment.ccCSC,
    },
    billingCountry: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='_country']",
      value: billing.country,
    },
    billingFirstName: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_firstName']",
      value: billing.givenName,
    },
    billingLastName: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_lastName']",
      value: billing.familyName,
    },
    billingAddress1: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_address1']",
      value: billing.addressLine1,
    },
    billingAddress2: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_address2']",
      value: billing.addressLine2,
    },
    billingCityInput: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_city']",
      value: billing.addressLevel2,
    },
    billingCitySelect: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='_city']",
      value: billing.addressLevel2,
    },
    billingStateCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='_stateCode']",
      value: billing.addressLevel1,
    },
    billingPostalCodeInput: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_postalCode']",
      value: billing.postalCode,
    },
    billingPostalCodeSelect: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='_postalCode']",
      value: billing.postalCode,
    },
    billingEmail: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_email']",
      value: contact.email,
    },
    billingPhone: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_phone']",
      value: contact.tel,
    },
  };

  if (autocheckoutEnabled) {
    const paymentFields = [
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingPhone,
    ];

    const shippingAddressCheckbox = await waitForSelector(
      "form[name='dwfrm_billing'] input[name$='_shippingAddressUseAsBillingAddress']",
      { visible: true }
    );

    await waitForTimeout(500);
    if (shippingAddressCheckbox instanceof HTMLInputElement) {
      if (shippingAddressCheckbox.checked) {
        shippingAddressCheckbox.click();
      }
    }

    switch (billing.country) {
      case "AU":
      case "CA":
      case "JP":
      case "MY":
        paymentFields.push(
          fields.billingStateCode,
          fields.billingCityInput,
          fields.billingPostalCodeInput
        );
        break;

      case "AT":
      case "BE":
      case "HR":
      case "CZ":
      case "DK":
      case "EE":
      case "FI":
      case "FR":
      case "DE":
      case "HU":
      case "IE":
      case "IT":
      case "LV":
      case "LT":
      case "LU":
      case "NL":
      case "NZ":
      case "PL":
      case "PT":
      case "RO":
      case "SG":
      case "SK":
      case "SI":
      case "ES":
      case "SE":
      case "GB":
        paymentFields.push(
          fields.billingCityInput,
          fields.billingPostalCodeInput
        );
        break;

      case "HK":
        paymentFields.push(fields.billingStateCode, fields.billingCitySelect);
        break;

      case "TW":
        paymentFields.push(
          fields.billingStateCode,
          fields.billingCitySelect,
          fields.billingPostalCodeSelect
        );
        break;

      default:
        paymentFields.push(
          fields.billingStateCode,
          fields.billingCityInput,
          fields.billingPostalCodeInput,
          fields.billingEmail
        );
        break;
    }

    await selectFormCountry(
      ".billing-address .dynamic-address-container",
      fields.billingCountry
    );

    for (const { options, selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForTimeout(2500);
    const submitPaymentButton = await waitForSelector("button.submit-payment", {
      visible: true,
    });
    submitPaymentButton.click();
  } else if (autofillEnabled) {
    const billingFields = [
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCityInput,
      fields.billingCitySelect,
      fields.billingPostalCodeInput,
      fields.billingPostalCodeSelect,
      fields.billingPhone,
      fields.billingStateCode,
      fields.billingEmail,
    ];

    await Promise.all([
      waitForSelector(
        "form[name='dwfrm_billing'] input[name$='_shippingAddressUseAsBillingAddress']",
        { visible: true }
      ).then((shippingAddressCheckbox) =>
        waitForTimeout(500).then(() => {
          if (shippingAddressCheckbox instanceof HTMLInputElement) {
            if (shippingAddressCheckbox.checked) {
              shippingAddressCheckbox.click();
            }
          }
        })
      ),
      selectFormCountry(
        ".billing-address .dynamic-address-container",
        fields.billingCountry
      ).then(() =>
        Promise.all(
          billingFields.map(({ options, selector, value }) =>
            autofillSelector(selector, value, mode, options)
          )
        )
      ),
    ]);
  }
}

async function orderSummary(newBalance) {
  const { autocheckoutEnabled } = newBalance;

  if (autocheckoutEnabled) {
    const placeOrderBtn = await waitForSelector(".place-order", {
      visible: true,
    });
    placeOrderBtn.click();
  }
}

async function selectFormCountry(formSelector, countryField) {
  const addressForm = await waitForSelector(formSelector, { visible: true });

  await Promise.all([
    autofillSelector(countryField.selector, countryField.value, "fast"),
    waitForAddedNodes(addressForm),
  ]);
}
