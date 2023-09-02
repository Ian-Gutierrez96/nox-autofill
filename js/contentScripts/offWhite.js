"use strict";

// ============================================================================
// Variables
// ============================================================================

let isBagActive = false;
let isCheckoutActive = false;
let isShippingInfoActive = false;
let isShippingOptionsActive = false;
let isPaymentBillingActive = false;
let isPlaceOrderActive = false;

// ============================================================================
// Function
// ============================================================================

async function autofillOffWhite(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { offWhite },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (offWhite.autocheckoutEnabled || offWhite.autofillEnabled) &&
      Object.hasOwn(profiles, offWhite.profileKey)
    ) {
      const profile = profiles[offWhite.profileKey];

      switch (location.pathname) {
        case "/en-us":
        case "/en-us/":
          if (notifications) {
            displayNotification(offWhite);
          }
          break;

        case "/en-us/bag":
        case "/en-us/commerce/bag":
          if (!isBagActive) {
            bag(offWhite);
          }
          break;

        case "/en-us/checkout":
        case "/en-us/commerce/checkout":
          if (!isCheckoutActive) {
            checkout(offWhite, profile);
          }

          if (!isShippingInfoActive) {
            shippingInformation(offWhite, profile);
          }

          if (!isShippingOptionsActive) {
            shippingOptions(offWhite);
          }

          if (!isPaymentBillingActive) {
            paymentAndBilling(offWhite, profile);
          }

          if (!isPlaceOrderActive) {
            placeOrder(offWhite);
          }
          break;
      }
    }
  }
}

function displayNotification(offWhite) {
  const { autocheckoutEnabled } = offWhite;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Off-White. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Off-White.",
  });
}

async function bag(offWhite) {
  isBagActive = true;

  const { autocheckoutEnabled } = offWhite;

  if (autocheckoutEnabled) {
    const checkoutBtn = await waitForSelector(
      "a[href='/en-us/commerce/checkout']"
    );
    checkoutBtn.click();
  }

  isBagActive = false;
}

async function checkout(offWhite, profile) {
  isCheckoutActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = offWhite;
  const { contact } = profile;
  const fields = {
    guestEmail: {
      selector: "input[name='email']:enabled",
      value: contact.email,
    },
  };

  if (autocheckoutEnabled) {
    const checkoutFields = [fields.guestEmail];

    for (const { selector, value } of checkoutFields) {
      await autofillSelector(selector, value, mode);
    }

    const guestCheckoutButton = await waitForXPath(
      ".//span[text()[contains(., 'Checkout as Guest')]]/ancestor::button"
    );
    guestCheckoutButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isCheckoutActive = false;
}

async function shippingInformation(offWhite, profile) {
  isShippingInfoActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = offWhite;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector: "input[name='shippingAddress.firstName']:enabled",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector: "input[name='shippingAddress.lastName']:enabled",
      value: shipping.familyName,
    },
    shippingPhone: {
      selector: "input[name='shippingAddress.phone']:enabled",
      value: contact.tel,
    },
    shippingCountry: {
      options: { select: { text: true } },
      selector: "select[name='shippingAddress.country']:enabled",
      value: countries.get(shipping.country),
    },
    shippingAddressLine1: {
      selector: "input[name='shippingAddress.addressLine1']:enabled",
      value: shipping.addressLine1,
    },
    shippingAddressLine2: {
      selector: "input[name='shippingAddress.addressLine2']:enabled",
      value: shipping.addressLine2,
    },
    shippingCity: {
      selector: "input[name='shippingAddress.city']:enabled",
      value: shipping.addressLevel2,
    },
    shippingInputState: {
      selector: "input[name='shippingAddress.state']:enabled",
      value: firstAdministrativeLevels.has(shipping.country)
        ? firstAdministrativeLevels
            .get(shipping.country)
            .get(shipping.addressLevel1)
        : shipping.addressLevel1,
    },
    shippingSelectState: {
      options: { select: { text: true } },
      selector: "select[name='shippingAddress.state']:enabled",
      value: firstAdministrativeLevels.has(shipping.country)
        ? firstAdministrativeLevels
            .get(shipping.country)
            .get(shipping.addressLevel1)
        : shipping.addressLevel1,
    },
    shippingZipCode: {
      selector: "input[name='shippingAddress.zipCode']:enabled",
      value: shipping.postalCode,
    },
  };

  if (autocheckoutEnabled) {
    const shippingInfoFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingPhone,
      fields.shippingCountry,
      fields.shippingAddressLine1,
      fields.shippingAddressLine2,
      fields.shippingCity,
      fields.shippingZipCode,
    ];

    switch (shipping.country) {
      case "CA":
      case "US":
        shippingInfoFields.push(fields.shippingSelectState);
        break;

      default:
        shippingInfoFields.push(fields.shippingInputState);
        break;
    }

    for (const { options, selector, value } of shippingInfoFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const saveShippingInfoBtn = await waitForSelector(
      "#siteContent > section > section:nth-of-type(1) button[type='submit']"
    );
    saveShippingInfoBtn.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }

  isShippingInfoActive = false;
}

async function shippingOptions(offWhite) {
  isShippingOptionsActive = true;

  const { autocheckoutEnabled } = offWhite;

  if (autocheckoutEnabled) {
    const saveShippingOptionBtn = await waitForSelector(
      "#siteContent > section > section:nth-of-type(2) button[type='submit']"
    );
    saveShippingOptionBtn.click();
  }

  isShippingOptionsActive = false;
}

async function paymentAndBilling(offWhite, profile) {
  isPaymentBillingActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = offWhite;
  const { billing, contact } = profile;
  const fields = {
    billingFirstName: {
      selector: "input[name='billingAddress.firstName']:enabled",
      value: billing.givenName,
    },
    billingLastName: {
      selector: "input[name='billingAddress.lastName']:enabled",
      value: billing.familyName,
    },
    billingPhone: {
      selector: "input[name='billingAddress.phone']:enabled",
      value: contact.tel,
    },
    billingCountry: {
      options: { select: { text: true } },
      selector: "select[name='billingAddress.country']:enabled",
      value: countries.get(billing.country),
    },
    billingAddressLine1: {
      selector: "input[name='billingAddress.addressLine1']:enabled",
      value: billing.addressLine1,
    },
    billingAddressLine2: {
      selector: "input[name='billingAddress.addressLine2']:enabled",
      value: billing.addressLine2,
    },
    billingCity: {
      selector: "input[name='billingAddress.city']:enabled",
      value: billing.addressLevel2,
    },
    billingInputState: {
      selector: "input[name='billingAddress.state']:enabled",
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
    },
    billingSelectState: {
      options: { select: { text: true } },
      selector: "select[name='billingAddress.state']:enabled",
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
    },
    billingZipCode: {
      selector: "input[name='billingAddress.zipCode']:enabled",
      value: billing.postalCode,
    },
  };

  waitForSelector("#shippingAsBilling").then((billingCheckbox) => {
    if (billingCheckbox instanceof HTMLInputElement) {
      if (billingCheckbox.checked) {
        billingCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const paymentAndBillingFields = [
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingPhone,
      fields.billingCountry,
      fields.billingAddressLine1,
      fields.billingAddressLine2,
      fields.billingCity,
      fields.billingZipCode,
    ];

    switch (billing.country) {
      case "CA":
      case "US":
        paymentAndBillingFields.push(fields.billingSelectState);
        break;

      default:
        paymentAndBillingFields.push(fields.billingInputState);
        break;
    }

    for (const { options, selector, value } of paymentAndBillingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForSelector("#payment-gateway");
    await waitForTimeout(2500);
    const savePaymentBtn = await waitForSelector(
      "#siteContent > section > section:nth-of-type(3) button[type='submit']"
    );
    savePaymentBtn.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }

  isPaymentBillingActive = false;
}

async function placeOrder(offWhite) {
  isPlaceOrderActive = true;

  const { autocheckoutEnabled } = offWhite;

  if (autocheckoutEnabled) {
    const placeOrderBtn = await waitForSelector(
      "#siteContent > section > button, button[aria-label='Place Order']:enabled"
    );
    placeOrderBtn.click();
  }

  isPlaceOrderActive = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillOffWhite);
