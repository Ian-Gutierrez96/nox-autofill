"use strict";

// ============================================================================
// Main
// ============================================================================

autofillHibbett();

// ============================================================================
// Functions
// ============================================================================

async function autofillHibbett() {
  const {
    profiles,
    scripts: { hibbett },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (hibbett.autocheckoutEnabled || hibbett.autofillEnabled) &&
    Object.hasOwn(profiles, hibbett.profileKey)
  ) {
    const profile = profiles[hibbett.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) {
          displayNotification(hibbett);
        }
        break;

      case "/cart":
        cart(hibbett);
        break;

      case "/checkout":
        checkout(hibbett);
        break;

      case "/shipping":
        shipping(hibbett, profile);
        break;

      case "/checkout-billing":
      case "/billing":
        billing(hibbett, profile);
        break;

      case "/order-confirmation":
      case "/review":
        review(hibbett);
        break;
    }
  }
}

function displayNotification(hibbett) {
  const { autocheckoutEnabled } = hibbett;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Hibbett. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Hibbett.",
  });
}

async function cart(hibbett) {
  const { autocheckoutEnabled } = hibbett;

  if (autocheckoutEnabled) {
    const checkoutCart = await waitForSelector(
      "button[name='dwfrm_cart_checkoutCart']"
    );
    checkoutCart.click();
  }
}

async function checkout(hibbett) {
  const { autocheckoutEnabled } = hibbett;

  if (autocheckoutEnabled) {
    const loginUnregistered = await waitForSelector(
      "button[name='dwfrm_login_unregistered']"
    );
    loginUnregistered.click();
  }
}

async function shipping(hibbett, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = hibbett;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: ".address input[name$='_addressFields_firstName']",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: ".address input[name$='_addressFields_lastName']",
      value: shipping.familyName,
    },
    shippingAddress1: {
      options: { polling: { visible: true } },
      selector: ".address input[name$='_address1']",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: ".address input[name$='_address2']",
      value: shipping.addressLine2,
    },
    shippingCity: {
      options: { polling: { visible: true } },
      selector: ".address input[name$='_city']",
      value: shipping.addressLevel2,
    },
    shippingState: {
      options: { polling: { visible: true } },
      selector: ".address select[name$='_addressFields_states_state']",
      value: shipping.addressLevel1,
    },
    shippingPostal: {
      options: { polling: { visible: true } },
      selector: ".address input[name$='_addressFields_postal']",
      value: shipping.postalCode,
    },
    shippingPhone: {
      options: { polling: { visible: true } },
      selector:
        "input[name^='dwfrm_singleshipping_shippingAddress_addressFields_phone']",
      value: contact.tel,
    },
    shippingEmailAddress: {
      options: { polling: { visible: true } },
      selector:
        "input[name^='dwfrm_singleshipping_shippingAddress_email_emailAddress']",
      value: contact.email,
    },
  };

  waitForSelector(
    "input[name='dwfrm_singleshipping_shippingAddress_useAsBillingAddress']"
  ).then((useAsBillingAddress) => {
    if (useAsBillingAddress instanceof HTMLInputElement) {
      if (useAsBillingAddress.checked) {
        useAsBillingAddress.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const shippingAddressForm = await waitForSelector(
      "#dwfrm_singleshipping_shippingAddress"
    );

    if (
      shippingAddressForm.querySelector("#sthShipmentSection .shipping-address")
    ) {
      const shippingFields = [
        fields.shippingFirstName,
        fields.shippingLastName,
        fields.shippingAddress1,
        fields.shippingAddress2,
        fields.shippingCity,
        fields.shippingState,
        fields.shippingPostal,
        fields.shippingPhone,
        fields.shippingEmailAddress,
      ];

      for (const { options, selector, value } of shippingFields) {
        await autofillSelector(selector, value, mode, options);
      }
    }

    const continueToBillingButton = await waitForSelector(
      "button[name='dwfrm_singleshipping_shippingAddress_save']:not(:disabled)"
    );
    continueToBillingButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function billing(hibbett, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = hibbett;
  const { billing, contact, payment } = profile;
  const fields = {
    billingFirstName: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_billing [id$=billingAddress_addressFields_firstName]",
      value: billing.givenName,
    },
    billingLastName: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_billing [id$=billingAddress_addressFields_lastName]",
      value: billing.familyName,
    },
    billingAddress1: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_billing [id$=billingAddress_addressFields_address1]",
      value: billing.addressLine1,
    },
    billingAddress2: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_billing [id$=billingAddress_addressFields_address2]",
      value: billing.addressLine2,
    },
    billingCity: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_billing [id$=billingAddress_addressFields_city]",
      value: billing.addressLevel2,
    },
    billingState: {
      options: { polling: { visible: true } },
      selector:
        "#dwfrm_billing [id$=billingAddress_addressFields_states_state]",
      value: billing.addressLevel1,
    },
    billingPostal: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_billing [id$=billingAddress_addressFields_postal]",
      value: billing.postalCode,
    },
    billingPhone: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_billing [id$=billingAddress_addressFields_phone]",
      value: contact.tel,
    },
    billingEmailAddress: {
      options: { polling: { visible: true } },
      selector: "#dwfrm_billing [id$=billingAddress_email_emailAddress]",
      value: contact.email,
    },
    creditCardOwner: {
      options: { polling: { visible: true } },
      selector: "[data-method='CREDIT_CARD'] input[name$='creditCard_owner']",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    creditCardNumber: {
      options: { polling: { visible: true }, type: { keys: true } },
      selector: "[data-method='CREDIT_CARD'] input[name*='_creditCard_number']",
      value: payment.ccNumber,
    },
    creditCardExpirationMonth: {
      options: { polling: { visible: true } },
      selector: "[data-method='CREDIT_CARD'] [name$='_month']",
      value: payment.ccExpMonth,
    },
    creditCardExpirationYear: {
      options: { polling: { visible: true } },
      selector: "[data-method='CREDIT_CARD'] [name$='_year']",
      value: "20" + payment.ccExpYear,
    },
    creditCardCvn: {
      options: { polling: { visible: true }, type: { keys: true } },
      selector: "[data-method='CREDIT_CARD'] input[name*='_creditCard_cvn']",
      value: payment.ccCSC,
    },
  };

  waitForSelector("#use-different-address").then((useDifferentAddress) => {
    if (useDifferentAddress instanceof HTMLInputElement) {
      if (!useDifferentAddress.checked) {
        useDifferentAddress.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const paymentField = [
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCity,
      fields.billingState,
      fields.billingPostal,
      fields.billingPhone,
      fields.creditCardOwner,
      fields.creditCardNumber,
      fields.creditCardExpirationMonth,
      fields.creditCardExpirationYear,
      fields.creditCardCvn,
    ];

    if (
      isElementVisible(
        document.querySelector(fields.billingEmailAddress.selector)
      )
    ) {
      paymentField.push(fields.billingEmailAddress);
    }

    for (const { options, selector, value } of paymentField) {
      await autofillSelector(selector, value, mode, options);
    }

    const continueToReviewButton = await waitForSelector(
      "button[name='dwfrm_billing_save']:not(:disabled)"
    );
    continueToReviewButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function review(hibbett) {
  const { autocheckoutEnabled } = hibbett;

  if (autocheckoutEnabled) {
    const submitOrder = await waitForSelector("button[name='submitOrder']");
    submitOrder.click();
  }
}
