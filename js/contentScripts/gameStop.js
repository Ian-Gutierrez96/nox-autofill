"use strict";

// ============================================================================
// Main
// ============================================================================

autofillGameStop();

// ============================================================================
// Functions
// ============================================================================

async function autofillGameStop() {
  const {
    profiles,
    scripts: { gameStop },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (gameStop.autocheckoutEnabled || gameStop.autofillEnabled) &&
    Object.hasOwn(profiles, gameStop.profileKey)
  ) {
    const profile = profiles[gameStop.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) displayNotification(gameStop);
        break;

      case "/cart/":
        cart(gameStop);
        break;

      case "/checkout/login/":
        guest(gameStop);
        break;

      case "/spcheckout/":
        storePickup(gameStop, profile);
        shipping(gameStop, profile);
        payment(gameStop, profile);
        placeOrder(gameStop);
        break;
    }
  }
}

function displayNotification(gameStop) {
  const { autocheckoutEnabled } = gameStop;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for GameStop. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for GameStop.",
  });
}

async function cart(gameStop) {
  const { autocheckoutEnabled } = gameStop;

  if (autocheckoutEnabled) {
    const proceedToCheckout = await waitForSelector(
      "a[href='https://www.gamestop.com/checkout/login/']"
    );
    proceedToCheckout.click();
  }
}

async function guest(gameStop) {
  const { autocheckoutEnabled } = gameStop;

  if (autocheckoutEnabled) {
    const guestCheckout = await waitForSelector(
      "a[href='https://www.gamestop.com/spcheckout/']"
    );
    guestCheckout.click();
  }
}

async function storePickup(gameStop, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = gameStop;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: "#shipping-content-store-pickup input#shippingFirstName",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: "#shipping-content-store-pickup input#shippingLastName",
      value: shipping.familyName,
    },
    shippingEmail: {
      options: { polling: { visible: true } },
      selector: "#shipping-content-store-pickup input#shipping-email",
      value: contact.email,
    },
    shippingPhoneNumber: {
      options: { polling: { visible: true } },
      selector: "#shipping-content-store-pickup input#shippingPhoneNumber",
      value: contact.tel,
    },
  };

  if (autocheckoutEnabled) {
    const pickupFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingEmail,
      fields.shippingPhoneNumber,
    ];

    for (const { options, selector, value } of pickupFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const saveAndContinueButton = await waitForSelector(
      "#shipping-content-store-pickup button[name='submit-shipping']",
      { visible: true }
    );
    saveAndContinueButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function shipping(gameStop, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = gameStop;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: "#shipping-content input#shippingFirstName",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: "#shipping-content input#shippingLastName",
      value: shipping.familyName,
    },
    shippingAddressOne: {
      options: { polling: { visible: true } },
      selector: "#shipping-content input#shippingAddressOne",
      value: shipping.addressLine1,
    },
    shippingAddressTwo: {
      options: { polling: { visible: true } },
      selector: "#shipping-content input#shippingAddressTwo",
      value: shipping.addressLine2,
    },
    shippingZipCode: {
      options: { polling: { visible: true } },
      selector: "#shipping-content input#shippingZipCode",
      value: shipping.postalCode,
    },
    shippingAddressCity: {
      options: { polling: { visible: true } },
      selector: "#shipping-content input#shippingAddressCity",
      value: shipping.addressLevel2,
    },
    shippingState: {
      options: { polling: { visible: true } },
      selector: "#shipping-content select#shippingState",
      value: shipping.addressLevel1,
    },
    shippingEmail: {
      options: { polling: { visible: true } },
      selector: "#shipping-content input#shipping-email",
      value: contact.email,
    },
    shippingPhoneNumber: {
      options: { polling: { visible: true } },
      selector: "#shipping-content input#shippingPhoneNumber",
      value: contact.tel,
    },
  };

  waitForSelector(
    "#shipping-content input#shippingAddressUseAsBillingAddress-singleShip",
    { visible: true }
  ).then((useAsBillingAddress) => {
    if (useAsBillingAddress instanceof HTMLInputElement) {
      if (useAsBillingAddress.checked) {
        useAsBillingAddress.click();
      }
    }
  });

  waitForSelector("#shipping-content a#address-two-link", {
    visible: true,
  }).then((addressTwoLink) => addressTwoLink.click());

  if (autocheckoutEnabled) {
    waitForXPath("//button[text()[contains(., 'Use Proposed Address')]]", {
      visible: true,
    }).then((useProposedAddress) => useProposedAddress.click());

    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddressOne,
      fields.shippingAddressTwo,
      fields.shippingZipCode,
      fields.shippingAddressCity,
      fields.shippingState,
      fields.shippingPhoneNumber,
    ];

    if (
      isElementVisible(document.querySelector(fields.shippingEmail.selector))
    ) {
      shippingFields.push(fields.shippingEmail);
    }

    for (const { options, selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const saveAndContinueButton = await waitForSelector(
      "#shipping-content button[name='submit-shipping']",
      { visible: true }
    );
    saveAndContinueButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function payment(gameStop, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = gameStop;
  const { contact, billing, payment } = profile;
  const fields = {
    cardNumber: {
      options: { polling: { visible: true } },
      selector: "input#cardNumber",
      value: payment.ccNumber,
    },
    expirationMonthYear: {
      options: { polling: { visible: true } },
      selector: "input#expirationMonthYear",
      value: payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
    },
    securityCode: {
      options: { polling: { visible: true } },
      selector: "input#securityCode",
      value: payment.ccCSC,
    },
    savedPaymentSecurityCode: {
      options: { polling: { visible: true } },
      selector: "input#saved-payment-security-code",
      value: payment.ccCSC,
    },
    billingFirstName: {
      options: { polling: { visible: true } },
      selector: "input#billingFirstName",
      value: billing.givenName,
    },
    billingLastName: {
      options: { polling: { visible: true } },
      selector: "input#billingLastName",
      value: billing.familyName,
    },
    billingAddressOne: {
      options: { polling: { visible: true } },
      selector: "input#billingAddressOne",
      value: billing.addressLine1,
    },
    billingAddressTwo: {
      options: { polling: { visible: true } },
      selector: "input#billingAddressTwo",
      value: billing.addressLine2,
    },
    billingZipCode: {
      options: { polling: { visible: true } },
      selector: "input#billingZipCode",
      value: billing.postalCode,
    },
    billingAddressCity: {
      options: { polling: { visible: true } },
      selector: "input#billingAddressCity",
      value: billing.addressLevel2,
    },
    billingState: {
      options: { polling: { visible: true } },
      selector: "select#billingState",
      value: billing.addressLevel1,
    },
    phoneNumber: {
      options: { polling: { visible: true } },
      selector: "input#phoneNumber",
      value: contact.tel,
    },
  };

  waitForSelector("#billing-address-two-link", {
    visible: true,
  }).then((billingAddressTwoLink) => billingAddressTwoLink.click());

  if (autocheckoutEnabled) {
    const creditCardSection = await waitForSelector(
      "[data-method-id='CREDIT_CARD']",
      { visible: true }
    );

    if (creditCardSection.classList.contains("saved-payment-instrument")) {
      const savedPaymentFields = [fields.savedPaymentSecurityCode];

      for (const { options, selector, value } of savedPaymentFields) {
        await autofillSelector(selector, value, mode, options);
      }
    } else if (creditCardSection.classList.contains("credit-card-generic")) {
      const cardFields = [
        fields.cardNumber,
        fields.expirationMonthYear,
        fields.securityCode,
      ];

      for (const { options, selector, value } of cardFields) {
        await autofillSelector(selector, value, mode, options);
      }
    }

    if (isElementVisible(document.querySelector(".address-selector-form"))) {
      const billingFields = [
        fields.billingFirstName,
        fields.billingLastName,
        fields.billingAddressOne,
        fields.billingAddressTwo,
        fields.billingZipCode,
        fields.billingAddressCity,
        fields.billingState,
        fields.phoneNumber,
      ];

      for (const { options, selector, value } of billingFields) {
        await autofillSelector(selector, value, mode, options);
      }
    }

    const submitPaymentButton = await waitForSelector(
      "button[value='submit-payment']:not(:disabled)",
      { visible: true }
    );
    submitPaymentButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function placeOrder(gameStop) {
  const { autocheckoutEnabled } = gameStop;

  if (autocheckoutEnabled) {
    await waitForTimeout(1000);
    const placeOrderButton = await waitForSelector(
      "button[value='place-order']:not(:disabled)",
      { visible: true }
    );
    placeOrderButton.click();
  }
}
