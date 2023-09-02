"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isTunnelActive = false;
let isDeliveryActive = false;
let isPaymentActive = false;
let isReviewActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillNike(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { nike },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (nike.autocheckoutEnabled || nike.autofillEnabled) &&
      Object.hasOwn(profiles, nike.profileKey)
    ) {
      const profile = profiles[nike.profileKey];

      switch (location.pathname) {
        case "/":
          if (notifications) {
            displayNotification(nike);
          }
          break;

        case "/cart":
          if (!isCartActive) {
            cart(nike);
          }
          break;

        case "/checkout/tunnel":
          if (!isTunnelActive) {
            checkoutTunnel(nike);
          }
          break;

        case "/checkout":
          if (!isDeliveryActive) {
            delivery(nike, profile);
          }

          if (!isPaymentActive) {
            payment(nike, profile);
          }

          if (!isReviewActive) {
            orderReview(nike);
          }
          break;
      }
    }
  }
}

function displayNotification(nike) {
  const { autocheckoutEnabled } = nike;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Nike. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Nike.",
  });
}

async function cart(nike) {
  isCartActive = true;

  const { autocheckoutEnabled } = nike;

  if (autocheckoutEnabled) {
    const checkoutBtn = await waitForSelector(
      "button:is([data-automation='guest-checkout-button'], [data-automation='member-checkout-button'])",
      { visible: true }
    );
    checkoutBtn.click();
  }

  isCartActive = false;
}

async function checkoutTunnel(nike) {
  isTunnelActive = true;

  const { autocheckoutEnabled } = nike;

  if (autocheckoutEnabled) {
    const guestCheckoutBtn = await waitForSelector(
      "button[data-attr='qa-guest-checkout']",
      { visible: true }
    );
    guestCheckoutBtn.click();
  }

  isTunnelActive = false;
}

async function delivery(nike, profile) {
  isDeliveryActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = nike;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] input#firstName",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] input#lastName",
      value: shipping.familyName,
    },
    searchAddressInput: {
      options: { polling: { visible: true } },
      selector: "input#search-address-input",
      value: shipping.addressLine1,
    },
    shippingAddress1: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] input#address1",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] input#address2",
      value: shipping.addressLine2,
    },
    shippingCity: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] input#city",
      value: shipping.addressLevel2,
    },
    shippingState: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] select#state",
      value: shipping.addressLevel1,
    },
    shippingPostalCode: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] input#postalCode",
      value: shipping.postalCode,
    },
    shippingEmail: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] input#email",
      value: contact.email,
    },
    shippingPhoneNumber: {
      options: { polling: { visible: true } },
      selector: "[data-attr='AddressFormAVS'] input#phoneNumber",
      value: contact.tel,
    },
  };

  waitForSelector(
    "[data-attr='AddressFormAVS'] button[data-addr='toggleAddressLine']",
    { visible: true }
  ).then((toggleAddressLineButton) => toggleAddressLineButton.click());

  waitForSelector("#addressSuggestionOptOut").then((addressSuggestionOptOut) =>
    addressSuggestionOptOut.click()
  );

  if (autocheckoutEnabled) {
    const deliveryFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddress1,
      fields.shippingAddress2,
      fields.shippingCity,
      fields.shippingState,
      fields.shippingPostalCode,
      fields.shippingEmail,
      fields.shippingPhoneNumber,
    ];

    for (const { options, selector, value } of deliveryFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const saveAddressBtn = await waitForSelector(
      "button[data-attr='saveAddressBtn']:enabled",
      { visible: true }
    );
    await waitForTimeout(1000);
    saveAddressBtn.click();

    const continuePaymentBtn = await waitForSelector(
      "button[data-attr='continuePaymentBtn']",
      { visible: true }
    );
    await waitForTimeout(1000);
    continuePaymentBtn.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }

  isDeliveryActive = false;
}

async function payment(nike, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = nike;
  const { billing } = profile;
  const fields = {
    billingFirstName: {
      options: { polling: { visible: true } },
      selector: ".billingForm input#firstName",
      value: billing.givenName,
    },
    billingLastName: {
      options: { polling: { visible: true } },
      selector: ".billingForm input#lastName",
      value: billing.familyName,
    },
    billingAddress1: {
      options: { polling: { visible: true } },
      selector: ".billingForm input#address1",
      value: billing.addressLine1,
    },
    billingAddress2: {
      options: { polling: { visible: true } },
      selector: ".billingForm input#address2",
      value: billing.addressLine2,
    },
    billingCity: {
      options: { polling: { visible: true } },
      selector: ".billingForm input#city",
      value: billing.addressLevel2,
    },
    billingState: {
      options: { polling: { visible: true } },
      selector: ".billingForm select#state",
      value: billing.addressLevel1,
    },
    billingPostalCode: {
      options: { polling: { visible: true } },
      selector: ".billingForm input#postalCode",
      value: billing.postalCode,
    },
  };

  waitForSelector("#billingAddress", { visible: true }).then(
    (billingAddressCheckbox) => {
      if (billingAddressCheckbox instanceof HTMLInputElement) {
        if (billingAddressCheckbox.checked) {
          billingAddressCheckbox.click();
        }
      }
    }
  );

  if (autocheckoutEnabled) {
    const paymentFields = [
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCity,
      fields.billingState,
      fields.billingPostalCode,
    ];

    for (const { options, selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForSelector("iframe[data-attr='credit-card-iframe']");

    const continueOrderReviewBtn = await waitForSelector(
      "[data-attr='continueToOrderReviewBtn']:enabled",
      { visible: true }
    );
    await waitForTimeout(1500);
    continueOrderReviewBtn.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }

  isPaymentActive = false;
}

async function orderReview(nike) {
  isReviewActive = true;

  const { autocheckoutEnabled } = nike;

  if (autocheckoutEnabled) {
    await waitForTimeout(1000);
    const placeOrderBtn = await waitForSelector(
      "[data-attr='test-desktop-button'] > button:not(:disabled)",
      { visible: true }
    );
    placeOrderBtn.click();
  }

  isReviewActive = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillNike);
