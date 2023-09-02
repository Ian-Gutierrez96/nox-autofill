"use strict";

// ============================================================================
// Main
// ============================================================================

autofillCrocs();

// ============================================================================
// Functions
// ============================================================================

async function autofillCrocs() {
  const {
    profiles,
    scripts: { crocs },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (crocs.autocheckoutEnabled || crocs.autofillEnabled) &&
    Object.hasOwn(profiles, crocs.profileKey)
  ) {
    const profile = profiles[crocs.profileKey];

    switch (location.pathname) {
      case "/":
      case "/on/demandware.store/Sites-crocs_us-Site/default/Home-Show":
        if (notifications) {
          displayNotification(crocs);
        }
        break;

      case "/on/demandware.store/Sites-crocs_us-Site/default/Cart-Show":
        cart(crocs);
        break;

      case "/on/demandware.store/Sites-crocs_us-Site/default/COCheckout-Step":
        shipping(crocs, profile);
        payment(crocs, profile);
        break;
    }
  }
}

function displayNotification(crocs) {
  const { autocheckoutEnabled } = crocs;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Crocs. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Crocs.",
  });
}

async function cart(crocs) {
  const { autocheckoutEnabled } = crocs;

  if (autocheckoutEnabled) {
    const loginCheckout = await waitForSelector("#loginCheckout", {
      visible: true,
    });
    loginCheckout.click();
  }
}

async function shipping(crocs, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = crocs;
  const { contact, shipping } = profile;
  const fields = {
    shippingEmailAddress: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_singleshipping_shippingAddress_email_emailAddress",
      value: contact.email,
    },
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector:
        "#dwfrm_root_singleshipping_shippingAddress_addressFields_firstName",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector:
        "#dwfrm_root_singleshipping_shippingAddress_addressFields_lastName",
      value: shipping.familyName,
    },
    shippingAddress1: {
      options: { polling: { visible: true } },
      selector:
        "#dwfrm_root_singleshipping_shippingAddress_addressFields_address1",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector:
        "#dwfrm_root_singleshipping_shippingAddress_addressFields_address2",
      value: shipping.addressLine2,
    },
    shippingZip: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_singleshipping_shippingAddress_addressFields_zip",
      value: shipping.postalCode,
    },
    shippingCity: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_singleshipping_shippingAddress_addressFields_city",
      value: shipping.addressLevel2,
    },
    shippingState: {
      options: { polling: { visible: true } },
      selector:
        "#dwfrm_root_singleshipping_shippingAddress_addressFields_states_state",
      value: shipping.addressLevel1,
    },
    shippingPhone: {
      options: { polling: { visible: true } },
      selector:
        "#dwfrm_root_singleshipping_shippingAddress_addressFields_phone",
      value: contact.tel,
    },
  };

  waitForSelector("#shippingForm .js-add-address-line", {
    visible: true,
  }).then((addAddressLine) => addAddressLine.click());

  if (autocheckoutEnabled) {
    const shippingFields = [
      fields.shippingEmailAddress,
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddress1,
      fields.shippingAddress2,
      fields.shippingZip,
      fields.shippingCity,
      fields.shippingState,
      fields.shippingPhone,
    ];

    for (const { options, selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const checkoutStepContinue = await waitForSelector(
      "#shipping-body .js-checkout-step-continue:not(.disabled)",
      { visible: true }
    );
    checkoutStepContinue.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function payment(crocs, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = crocs;
  const { billing, contact, payment } = profile;
  const fields = {
    creditCardNumber: {
      options: { polling: { visible: true } },
      selector: "[id^='dwfrm_root_billing_paymentMethods_creditCard_number']",
      value: payment.ccNumber,
    },
    creditCardOwner: {
      options: { polling: { visible: true } },
      selector: "[id^='dwfrm_root_billing_paymentMethods_creditCard_owner']",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    creditCardCardexpire: {
      options: { polling: { visible: true } },
      selector:
        "[id^='dwfrm_root_billing_paymentMethods_creditCard_cardexpire']",
      value: payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
    },
    cvvmasked: {
      options: { polling: { visible: true } },
      selector: "[id^='cvvmasked']",
      value: payment.ccCSC,
    },
    creditCardCvn: {
      selector: "[id^='dwfrm_root_billing_paymentMethods_creditCard_cvn']",
      value: payment.ccCSC,
    },
    billingCountry: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_country",
      value: billing.country,
    },
    billingFirstName: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_firstName",
      value: billing.givenName,
    },
    billingLastName: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_lastName",
      value: billing.familyName,
    },
    billingAddress1: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_address1",
      value: billing.addressLine1,
    },
    billingAddress2: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_address2",
      value: billing.addressLine2,
    },
    billingZip: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_zip",
      value: billing.postalCode,
    },
    billingCity: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_city",
      value: billing.addressLevel2,
    },
    billingStateMock: {
      options: { polling: { visible: true } },
      selector: "#billingstatemockselectcheckout",
      value: billing.addressLevel1,
    },
    billingState: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_states_state",
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
    },
    billingPhone: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_root_billing_billingAddress_addressFields_phone",
      value: contact.tel,
    },
  };

  waitForSelector("#BillingIsTheSameAsShippingCheckbox", {
    visible: true,
  }).then((sameAsShippingCheckbox) => {
    if (sameAsShippingCheckbox instanceof HTMLInputElement) {
      if (sameAsShippingCheckbox.checked) {
        sameAsShippingCheckbox.click();
      }
    }
  });

  waitForSelector("#billingForm .js-add-address-line", {
    visible: true,
  }).then((addAddressLine) => addAddressLine.click());

  if (autocheckoutEnabled) {
    const paymentFields = [
      fields.creditCardNumber,
      fields.creditCardOwner,
      fields.creditCardCardexpire,
      fields.creditCardCvn,
      fields.cvvmasked,
      fields.billingCountry,
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingZip,
      fields.billingCity,
      fields.billingPhone,
    ];

    switch (billing.country) {
      case "US":
        paymentFields.push(fields.billingStateMock);
        break;

      default:
        paymentFields.push(fields.billingState);
        break;
    }

    for (const { options, selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const payButton = await waitForSelector(
      "#checkoutSummaryActions .js-pay-button:not(.disabled)",
      { visible: true }
    );
    payButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}
