"use strict";

// ============================================================================
// Main
// ============================================================================

autofillDicksSportingGoods();

// ============================================================================
// Functions
// ============================================================================

async function autofillDicksSportingGoods() {
  const {
    profiles,
    scripts: { dicksSportingGoods },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (dicksSportingGoods.autocheckoutEnabled ||
      dicksSportingGoods.autofillEnabled) &&
    Object.hasOwn(profiles, dicksSportingGoods.profileKey)
  ) {
    const profile = profiles[dicksSportingGoods.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) {
          displayNotification(dicksSportingGoods);
        }
        break;

      case "/OrderItemDisplay":
        cart(dicksSportingGoods);
        break;

      case "/DSGBillingAddressView":
        checkout(dicksSportingGoods, profile);
        break;

      case "/DSGPaymentViewCmd":
        encryptedPayment(dicksSportingGoods);
        payment(dicksSportingGoods, profile);
        break;

      case "/SinglePageCheckout":
        singlePageCheckoutContact(dicksSportingGoods, profile);
        singlePageCheckoutBilling(dicksSportingGoods, profile);
        singlePageCheckoutShipping(dicksSportingGoods, profile);
        singlePageCheckoutPlaceOrder(dicksSportingGoods);
        break;
    }
  }
}

function displayNotification(dicksSportingGoods) {
  const { autocheckoutEnabled } = dicksSportingGoods;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Dick's Sporting Goods. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Dick's Sporting Goods.",
  });
}

async function cart(dicksSportingGoods) {
  const { autocheckoutEnabled } = dicksSportingGoods;

  if (autocheckoutEnabled) {
    const checkoutButton = await waitForSelector(".checkout-button");
    checkoutButton.click();
  }
}

async function checkout(dicksSportingGoods, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = dicksSportingGoods;
  const { billing, contact, shipping } = profile;
  const fields = {
    billingFirstName: {
      options: { polling: { visible: true } },
      selector: "input#contact-first-name",
      value: billing.givenName,
    },
    billingLastName: {
      options: { polling: { visible: true } },
      selector: "input#contact-last-name",
      value: billing.familyName,
    },
    billingEmail: {
      options: { polling: { visible: true } },
      selector: "input#contact-email",
      value: contact.email,
    },
    billingPhone: {
      options: { polling: { visible: true } },
      selector: "input#contact-phone",
      value: contact.tel,
    },
    billingAddress: {
      options: { polling: { visible: true } },
      selector: "input.billingAddress[name='address']",
      value: billing.addressLine1,
    },
    billingAddress2: {
      options: { polling: { visible: true } },
      selector: "input.billingAddress[name='address2']",
      value: billing.addressLine2,
    },
    billingZipcode: {
      options: { polling: { visible: true } },
      selector: "input.billingZip[name='zipcode']",
      value: billing.postalCode,
    },
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: "input#shipFirstName[required]",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: "input#shipLastName[required]",
      value: shipping.familyName,
    },
    shippingAddress: {
      options: { polling: { visible: true } },
      selector: "input.shippingAddress[name='address']",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: "input.shippingAddress[name='address2']",
      value: shipping.addressLine2,
    },
    shippingZipcode: {
      options: { polling: { visible: true } },
      selector: "input.shippingZip[name='zipcode']",
      value: shipping.postalCode,
    },
  };

  if (autocheckoutEnabled) {
    const billingAddressForm = await waitForSelector("#billing-address-form");
    const shippingAddressCheckbox = document.evaluate(
      ".//span[text()[contains(., 'My Billing and Shipping are the same')]]/ancestor::mat-checkbox//input",
      billingAddressForm,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;

    const checkoutFields = [
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingEmail,
      fields.billingPhone,
      fields.billingAddress,
      fields.billingAddress2,
      fields.billingZipcode,
    ];

    if (shippingAddressCheckbox instanceof HTMLInputElement) {
      if (shippingAddressCheckbox.checked) {
        shippingAddressCheckbox.click();
      }

      checkoutFields.push(
        fields.shippingFirstName,
        fields.shippingLastName,
        fields.shippingAddress,
        fields.shippingAddress2,
        fields.shippingZipcode
      );
    }

    for (const { options, selector, value } of checkoutFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const continueToPayment = await waitForSelector(
      "button[form='billing-address-form'][type='submit']"
    );
    continueToPayment.click();
  } else if (autofillEnabled) {
    waitForXPath(
      ".//span[text()[contains(., 'My Billing and Shipping are the same')]]/ancestor::mat-checkbox//input"
    ).then((shippingAddressCheckbox) => {
      if (shippingAddressCheckbox instanceof HTMLInputElement) {
        if (shippingAddressCheckbox.checked) {
          shippingAddressCheckbox.click();
        }
      }
    });

    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function singlePageCheckoutContact(dicksSportingGoods, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = dicksSportingGoods;
  const { billing, contact } = profile;
  const fields = {
    contactFirstName: {
      options: { polling: { visible: true } },
      selector: "#contact-info-card-form #contact-first-name",
      value: billing.givenName,
    },
    contactLastName: {
      options: { polling: { visible: true } },
      selector: "#contact-info-card-form #contact-last-name",
      value: billing.familyName,
    },
    contactEmail: {
      options: { polling: { visible: true } },
      selector: "#contact-info-card-form #contact-email",
      value: contact.email,
    },
    contactPhone: {
      options: { polling: { visible: true } },
      selector: "#contact-info-card-form #contact-phone",
      value: contact.tel,
    },
  };

  if (autocheckoutEnabled) {
    const contactFields = [
      fields.contactFirstName,
      fields.contactLastName,
      fields.contactEmail,
      fields.contactPhone,
    ];

    for (const { options, selector, value } of contactFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const continueButton = await waitForSelector(
      "button[type='submit'][form='contact-info-card-form']",
      { visible: true }
    );
    continueButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function singlePageCheckoutBilling(dicksSportingGoods, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = dicksSportingGoods;
  const { billing } = profile;
  const fields = {
    billingAddress: {
      options: { polling: { visible: true } },
      selector: "#billing-address-card-form #address",
      value: billing.addressLine1,
    },
    billingAddress2: {
      options: { polling: { visible: true } },
      selector: "#billing-address-card-form #address2",
      value: billing.addressLine2,
    },
    billingZipcode: {
      options: { polling: { visible: true } },
      selector: "#billing-address-card-form #zipcode",
      value: billing.postalCode,
    },
  };

  waitForXPath(
    ".//span[text()[contains(., 'My Billing and Shipping are the same')]]/ancestor::mat-checkbox//input"
  ).then((shippingAddressCheckbox) => {
    if (shippingAddressCheckbox instanceof HTMLInputElement) {
      if (shippingAddressCheckbox.checked) {
        shippingAddressCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const billingFields = [
      fields.billingAddress,
      fields.billingAddress2,
      fields.billingZipcode,
    ];

    for (const { options, selector, value } of billingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const continueButton = await waitForSelector(
      "button[type='submit'][form='billing-address-card-form']",
      { visible: true }
    );
    continueButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function singlePageCheckoutShipping(dicksSportingGoods, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = dicksSportingGoods;
  const { shipping } = profile;
  const fields = {
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: "#shipping-address-card-form #shipFirstName",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: "#shipping-address-card-form #shipLastName",
      value: shipping.familyName,
    },
    shippingAddress: {
      options: { polling: { visible: true } },
      selector: "#shipping-address-card-form #address",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: "#shipping-address-card-form #address2",
      value: shipping.addressLine2,
    },
    shippingZipcode: {
      options: { polling: { visible: true } },
      selector: "#shipping-address-card-form #zipcode",
      value: shipping.postalCode,
    },
  };

  waitForXPath(
    ".//span[text()[contains(., 'My Billing and Shipping are the same')]]/ancestor::mat-checkbox//input"
  ).then((shippingAddressCheckbox) => {
    if (shippingAddressCheckbox instanceof HTMLInputElement) {
      if (shippingAddressCheckbox.checked) {
        shippingAddressCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddress,
      fields.shippingAddress2,
      fields.shippingZipcode,
    ];

    for (const { options, selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const continueButton = await waitForSelector(
      "button[type='submit'][form='shipping-address-card-form']",
      { visible: true }
    );
    continueButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function singlePageCheckoutPlaceOrder(dicksSportingGoods) {
  const { autocheckoutEnabled } = dicksSportingGoods;

  if (autocheckoutEnabled) {
    const checkoutButton = await waitForXPath(
      "//button[text()[contains(., 'Place Order')]][not(@disabled)]"
    );
    await waitForTimeout(2000);
    checkoutButton.click();
  }
}

async function payment(dicksSportingGoods, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = dicksSportingGoods;
  const { payment } = profile;
  const fields = {
    ccNumber: {
      selector: "#cc-number",
      value: payment.ccNumber,
    },
    ccExpDate: {
      selector: "#cc-exp-date",
      value: payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
    },
    ccCvc: {
      selector: "#cc-cvc",
      value: payment.ccCSC,
    },
  };

  if (autocheckoutEnabled) {
    const paymentFields = [fields.ccNumber, fields.ccExpDate, fields.ccCvc];

    for (const { selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode);
    }

    const placeOrder = await waitForSelector("#placeOrder");
    placeOrder.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }
}

async function encryptedPayment(dicksSportingGoods) {
  const { autocheckoutEnabled } = dicksSportingGoods;

  if (autocheckoutEnabled) {
    await Promise.all(
      [
        "#encryptedCardNumberInput > iframe",
        "#encryptedExpiryDateInput > iframe",
        "#encryptedSecurityCodeInput > iframe",
      ].map((selector) => waitForSelector(selector))
    );

    await waitForTimeout(2000);
    const placeOrder = await waitForSelector("button#placeOrder");
    placeOrder.click();
  }
}
