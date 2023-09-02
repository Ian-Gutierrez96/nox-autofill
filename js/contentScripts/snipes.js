"use strict";

// ============================================================================
// Main
// ============================================================================

autofillSnipes();

// ============================================================================
// Functions
// ============================================================================

async function autofillSnipes() {
  const {
    profiles,
    scripts: { snipes },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (snipes.autocheckoutEnabled || snipes.autofillEnabled) &&
    Object.hasOwn(profiles, snipes.profileKey)
  ) {
    const profile = profiles[snipes.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) {
          displayNotification(snipes);
        }
        break;

      case "/cart":
        cart(snipes);
        break;

      case "/checkout":
        shipping(snipes, profile);
        payment(snipes, profile);
        placeOrder(snipes);
        break;
    }
  }
}

function displayNotification(snipes) {
  const { autocheckoutEnabled } = snipes;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Snipes. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Snipes.",
  });
}

async function cart(snipes) {
  const { autocheckoutEnabled } = snipes;

  if (autocheckoutEnabled) {
    const checkoutBtn = await waitForSelector("#checkout-form .checkout-btn");
    checkoutBtn.click();
  }
}

async function shipping(snipes, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = snipes;
  const { contact, shipping } = profile;
  const fields = {
    checkoutEmail: {
      options: { polling: { visible: true } },
      selector: ".checkout-email-form .email",
      value: contact.email,
    },
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
    shippingStateCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] select[name$='_stateCode']",
      value: shipping.addressLevel1,
    },
    shippingCity: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_city']",
      value: shipping.addressLevel2,
    },
    shippingPostalCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_postalCode']",
      value: shipping.postalCode,
    },
    shippingPhone: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_shipping'] input[name$='_phone']",
      value: contact.tel,
    },
  };

  if (autocheckoutEnabled) {
    const shippingFields = [
      fields.checkoutEmail,
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddress1,
      fields.shippingAddress2,
      fields.shippingStateCode,
      fields.shippingCity,
      fields.shippingPostalCode,
      fields.shippingPhone,
    ];

    for (const { options, selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForTimeout(1000);
    const submitShipping = await waitForSelector("button.submit-shipping", {
      visible: true,
    });
    submitShipping.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function payment(snipes, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = snipes;
  const { billing, contact, payment } = profile;
  const fields = {
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
    billingCountry: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='_country']",
      value: billing.country,
    },
    billingStateCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='_stateCode']",
      value: billing.addressLevel1,
    },
    billingCity: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_city']",
      value: billing.addressLevel2,
    },
    billingPostalCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_postalCode']",
      value: billing.postalCode,
    },
    billingPhone: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_phone']",
      value: contact.tel,
    },
    cardName: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_cardOwner']",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    cardNumber: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_cardNumber']",
      value: payment.ccNumber,
    },
    securityCode: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] input[name$='_securityCode']",
      value: payment.ccCSC,
    },
    expirationMonth: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='_expirationMonth']",
      value: payment.ccExpMonth,
    },
    expirationYear: {
      options: { polling: { visible: true } },
      selector: "form[name='dwfrm_billing'] select[name$='_expirationYear']",
      value: "20" + payment.ccExpYear,
    },
  };

  waitForSelector(".billing-edit-button", { visible: true }).then(
    (billingEditButton) => billingEditButton.click()
  );

  if (autocheckoutEnabled) {
    const paymentFields = [
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCountry,
      fields.billingCity,
      fields.billingPostalCode,
      fields.billingPhone,
      fields.cardName,
      fields.cardNumber,
      fields.securityCode,
      fields.expirationMonth,
      fields.expirationYear,
    ];

    switch (billing.country) {
      case "US":
        paymentFields.push(fields.billingStateCode);
        break;
    }

    for (const { options, selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForTimeout(1000);
    const submitPayment = await waitForSelector("button.submit-payment", {
      visible: true,
    });
    submitPayment.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function placeOrder(snipes) {
  const { autocheckoutEnabled } = snipes;

  if (autocheckoutEnabled) {
    await waitForTimeout(1000);
    const placeOrder = await waitForSelector(".place-order", {
      visible: true,
    });
    placeOrder.click();
  }
}
