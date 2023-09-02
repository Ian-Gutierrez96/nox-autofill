"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isCheckoutActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillSupreme(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { supreme },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (supreme.autocheckoutEnabled || supreme.autofillEnabled) &&
      Object.hasOwn(profiles, supreme.profileKey)
    ) {
      const profile = profiles[supreme.profileKey];

      if (/^\/$/.test(location.pathname)) {
        if (notifications) {
          displayNotification(supreme);
        }
      } else if (/^\/cart$/.test(location.pathname)) {
        if (!isCartActive) {
          cart(supreme);
        }
      } else if (
        /^\/checkouts\/c\/[a-z0-9]*(?:\/information)?$/.test(location.pathname)
      ) {
        if (!isCheckoutActive) {
          checkout(supreme, profile);
        }
      }
    }
  }
}

function displayNotification(supreme) {
  const { autocheckoutEnabled } = supreme;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Supreme. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Supreme.",
  });
}

async function cart(supreme) {
  isCartActive = true;

  const { autocheckoutEnabled } = supreme;

  if (autocheckoutEnabled) {
    const checkoutButton = await waitForSelector("input[name='checkout']", {
      visible: true,
    });
    checkoutButton.click();
  }

  isCartActive = false;
}

async function checkout(supreme, profile) {
  isCheckoutActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = supreme;
  const { contact, shipping } = profile;
  const fields = {
    shippingCountryCode: {
      options: { polling: { visible: true } },
      selector: "select[name='countryCode']",
      value: shipping.country,
    },
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: "input[name='firstName']",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: "input[name='lastName']",
      value: shipping.familyName,
    },
    shippingEmail: {
      options: { polling: { visible: true } },
      selector: "input[name='email']",
      value: contact.email,
    },
    shippingAddress1: {
      options: { polling: { visible: true } },
      selector: "input[name='address1']",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: "input[name='address2']",
      value: shipping.addressLine2,
    },
    shippingCity: {
      options: { polling: { visible: true } },
      selector: "input[name='city']",
      value: shipping.addressLevel2,
    },
    shippingPostalCode: {
      options: { polling: { visible: true } },
      selector: "input[name='postalCode']",
      value: shipping.postalCode,
    },
    shippingZone: {
      options: { polling: { visible: true } },
      selector: "select[name='zone']",
      value: shipping.addressLevel1,
    },
    shippingPhone: {
      options: { polling: { visible: true } },
      selector: "input[name='phone']",
      value: contact.tel,
    },
  };

  waitForSelector("input[name='accept_tos']", { visible: true }).then(
    (acceptTOSCheckbox) => {
      if (acceptTOSCheckbox instanceof HTMLInputElement) {
        if (!acceptTOSCheckbox.checked) {
          acceptTOSCheckbox.click();
        }
      }
    }
  );

  if (autocheckoutEnabled) {
    const checkoutFields = [
      fields.shippingCountryCode,
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingEmail,
      fields.shippingAddress1,
      fields.shippingAddress2,
      fields.shippingCity,
      fields.shippingPostalCode,
      fields.shippingZone,
      fields.shippingPhone,
    ];

    for (const { options, selector, value } of checkoutFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForTimeout(3000);
    const processPaymentButton = await waitForSelector(
      "button[type='submit']",
      { visible: true }
    );
    processPaymentButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }

  isCheckoutActive = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillSupreme);
