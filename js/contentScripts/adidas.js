"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isDeliveryActive = false;
let isPaymentActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillAdidas(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { adidas },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (adidas.autocheckoutEnabled || adidas.autofillEnabled) &&
      Object.hasOwn(profiles, adidas.profileKey)
    ) {
      const profile = profiles[adidas.profileKey];

      switch (location.pathname) {
        case "/us":
          if (notifications) {
            displayNotification(adidas);
          }
          break;

        case "/us/cart":
          if (!isCartActive) {
            cart(adidas);
          }
          break;

        case "/us/delivery":
          if (!isDeliveryActive) {
            delivery(adidas, profile);
          }
          break;

        case "/us/payment":
          if (!isPaymentActive) {
            payment(adidas, profile);
          }
          break;
      }
    }
  }
}

function displayNotification(adidas) {
  const { autocheckoutEnabled } = adidas;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Adidas. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Adidas.",
  });
}

async function cart(adidas) {
  isCartActive = true;

  const { autocheckoutEnabled } = adidas;

  if (autocheckoutEnabled) {
    const glassCheckoutButton = await waitForSelector(
      "button[data-auto-id='glass-checkout-button-right-side']"
    );
    await waitForTimeout(500);
    glassCheckoutButton.click();
  }

  isCartActive = false;
}

async function delivery(adidas, profile) {
  isDeliveryActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = adidas;
  const { billing, contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector: "input[data-auto-id='shippingAddress-firstName']",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector: "input[data-auto-id='shippingAddress-lastName']",
      value: shipping.familyName,
    },
    inlineSearchInput: {
      selector: "input[data-auto-id='inline-search-input']",
      value: shipping.addressLine1,
    },
    shippingAddress1: {
      selector: "input[data-auto-id='shippingAddress-address1']",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      selector: "input[data-auto-id='shippingAddress-address2']",
      value: shipping.addressLine2,
    },
    shippingCity: {
      selector: "input[data-auto-id='shippingAddress-city']",
      value: shipping.addressLevel2,
    },
    shippingState: {
      options: { select: { text: true } },
      selector: "[data-auto-id='shippingAddress-stateCode'] > select",
      value: usaStates.get(shipping.addressLevel1),
    },
    shippingZipcode: {
      selector: "input[data-auto-id='shippingAddress-zipcode']",
      value: shipping.postalCode,
    },
    contactEmailAddress: {
      selector:
        "input[data-auto-id='contact-emailAddress'], input[data-auto-id='shippingAddress-emailAddress']",
      value: contact.email,
    },
    contactPhoneNumber: {
      selector:
        "input[data-auto-id='contact-phoneNumber'], input[data-auto-id='shippingAddress-phoneNumber']",
      value: contact.tel,
    },
    billingCountry: {
      options: { select: { text: true } },
      selector: "[data-auto-id='billingAddress-country'] > select",
      value: countries.get(billing.country),
    },
    billingFirstName: {
      selector: "input[data-auto-id='billingAddress-firstName']",
      value: billing.givenName,
    },
    billingLastName: {
      selector: "input[data-auto-id='billingAddress-lastName']",
      value: billing.familyName,
    },
    billingAddress1: {
      selector: "input[data-auto-id='billingAddress-address1']",
      value: billing.addressLine1,
    },
    billingAddress2: {
      selector: "input[data-auto-id='billingAddress-address2']",
      value: billing.addressLine2,
    },
    billingCity: {
      selector: "input[data-auto-id='billingAddress-city']",
      value: billing.addressLevel2,
    },
    billingStateCode: {
      options: { select: { text: true } },
      selector: "[data-auto-id='billingAddress-stateCode'] > select",
      value: usaStates.get(billing.addressLevel1),
    },
    billingZipcode: {
      selector: "input[data-auto-id='billingAddress-zipcode']",
      value: billing.postalCode,
    },
    billingPhoneNumber: {
      selector: "input[data-auto-id='billingAddress-phoneNumber']",
      value: contact.tel,
    },
  };

  waitForSelector(
    "[data-auto-id='inline-address-suggestions-enter-address-manually-link'] > a"
  ).then((addressManuallyLink) => addressManuallyLink.click());

  waitForSelector("input[data-auto-id='billing-address-checkbox']").then(
    (billingAddressCheckbox) => {
      if (billingAddressCheckbox instanceof HTMLInputElement) {
        if (billingAddressCheckbox.checked) {
          billingAddressCheckbox.parentElement.click();
        }
      }
    }
  );

  if (autocheckoutEnabled) {
    const deliveryFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddress1,
      fields.shippingAddress2,
      fields.shippingCity,
      fields.shippingState,
      fields.shippingZipcode,
      fields.contactEmailAddress,
      fields.contactPhoneNumber,
      fields.billingCountry,
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCity,
      fields.billingZipcode,
    ];

    switch (billing.country) {
      case "US":
        deliveryFields.push(fields.billingStateCode, fields.billingPhoneNumber);
        break;
    }

    for (const { options, selector, value } of deliveryFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForTimeout(500);
    const reviewAndPayButton = await waitForSelector(
      "button[data-auto-id='review-and-pay-button']"
    );
    reviewAndPayButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }

  isDeliveryActive = false;
}

async function payment(adidas, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = adidas;
  const { payment } = profile;
  const fields = {
    nameOnCard: {
      selector: "input[data-auto-id='name-on-card-field']:enabled",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    expiryDate: {
      selector: "input[data-auto-id='expiry-date-field']:enabled",
      value: payment.ccExpMonth.padStart(2, "0") + " / " + payment.ccExpYear,
    },
  };

  if (autocheckoutEnabled) {
    const paymentFields = [fields.nameOnCard, fields.expiryDate];

    for (const { selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode);
    }

    await waitForTimeout(1000);
    const placeOrderButton = await waitForSelector(
      "button[data-auto-id='place-order-button']"
    );
    placeOrderButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isPaymentActive = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillAdidas);
