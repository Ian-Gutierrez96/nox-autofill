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

async function autofillYeezySupply(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { yeezySupply },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (yeezySupply.autocheckoutEnabled || yeezySupply.autofillEnabled) &&
      Object.hasOwn(profiles, yeezySupply.profileKey)
    ) {
      const profile = profiles[yeezySupply.profileKey];

      switch (location.pathname) {
        case "/":
          if (notifications) {
            displayNotification(yeezySupply);
          }
          break;

        case "/cart":
          if (!isCartActive) {
            cart(yeezySupply);
          }
          break;

        case "/delivery":
          if (!isDeliveryActive) {
            delivery(yeezySupply, profile);
          }
          break;

        case "/payment":
          if (!isPaymentActive) {
            payment(yeezySupply, profile);
          }
          break;
      }
    }
  }
}

function displayNotification(yeezySupply) {
  const { autocheckoutEnabled } = yeezySupply;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Yeezy Supply. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Yeezy Supply.",
  });
}

async function cart(yeezySupply) {
  isCartActive = true;

  const { autocheckoutEnabled } = yeezySupply;

  if (autocheckoutEnabled) {
    const glassCheckoutButton = await waitForSelector(
      "[data-auto-id='glass-checkout-button-bottom']"
    );
    glassCheckoutButton.click();
  }

  isCartActive = false;
}

async function delivery(yeezySupply, profile) {
  isDeliveryActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = yeezySupply;
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
    shippingStateCode: {
      options: { select: { text: true } },
      selector: "[data-auto-id='shippingAddress-stateCode'] > select",
      value: firstAdministrativeLevels.has(shipping.country)
        ? firstAdministrativeLevels
            .get(shipping.country)
            .get(shipping.addressLevel1)
        : shipping.addressLevel1,
    },
    shippingZipcode: {
      selector: "input[data-auto-id='shippingAddress-zipcode']",
      value: shipping.postalCode,
    },
    shippingPhoneNumber: {
      selector: "input[data-auto-id='shippingAddress-phoneNumber']",
      value: contact.tel,
    },
    shippingEmailAddress: {
      selector: "input[data-auto-id='shippingAddress-emailAddress']",
      value: contact.email,
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
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
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

  waitForSelector("[data-auto-id='hidden-link-shippingAddress-address']").then(
    (hiddenLinkAddress) => hiddenLinkAddress.click()
  );
  waitForSelector("[data-auto-id='billing-address-checkbox']").then(
    (billingAddressCheckbox) => {
      if (billingAddressCheckbox instanceof HTMLInputElement) {
        if (billingAddressCheckbox.checked) {
          billingAddressCheckbox.click();
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
      fields.shippingStateCode,
      fields.shippingZipcode,
      fields.shippingPhoneNumber,
      fields.shippingEmailAddress,
      fields.billingCountry,
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCity,
      fields.billingZipcode,
    ];

    switch (billing.country) {
      case "CA":
      case "US":
        deliveryFields.push(fields.billingStateCode, fields.billingPhoneNumber);
        break;
    }

    for (const { options, selector, value } of deliveryFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const reviewAndPay = await waitForSelector(
      "[data-auto-id='review-and-pay-button']"
    );
    reviewAndPay.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }

  isDeliveryActive = false;
}

async function payment(yeezySupply, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = yeezySupply;
  const { payment } = profile;
  const fields = {
    cardNumber: {
      selector: "#card-number",
      value: payment.ccNumber,
    },
    name: {
      selector: "#name",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    expiryDate: {
      selector: "#expiryDate",
      value: payment.ccExpMonth.padStart(2, "0") + " / " + payment.ccExpYear,
    },
    securityNumberField: {
      selector: "#security-number-field",
      value: payment.ccCSC,
    },
  };

  if (autocheckoutEnabled) {
    const paymentFields = [
      fields.cardNumber,
      fields.name,
      fields.expiryDate,
      fields.securityNumberField,
    ];

    for (const { selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode);
    }

    const placeOrderButton = await waitForSelector(
      "[data-auto-id='place-order-button']"
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

chrome.runtime.onMessage.addListener(autofillYeezySupply);
