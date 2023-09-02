"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isSignInActive = false;
let isShippingActive = false;
let isPaymentActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillLEGO(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { lego },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (lego.autocheckoutEnabled || lego.autofillEnabled) &&
      Object.hasOwn(profiles, lego.profileKey)
    ) {
      const profile = profiles[lego.profileKey];

      switch (location.pathname) {
        case "/en-us":
          if (notifications) {
            displayNotification(lego);
          }
          break;

        case "/en-us/cart":
          if (!isCartActive) {
            cart(lego);
          }
          break;

        case "/en-us/checkout":
          if (!isSignInActive) {
            signIn(lego);
          }

          if (!isShippingActive) {
            shipping(lego, profile);
          }

          if (!isPaymentActive) {
            payment(lego, profile);
          }
          break;
      }
    }
  }
}

function displayNotification(lego) {
  const { autocheckoutEnabled } = lego;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for LEGO. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for LEGO.",
  });
}

async function cart(lego) {
  isCartActive = true;

  const { autocheckoutEnabled } = lego;

  if (autocheckoutEnabled) {
    const checkoutSecurely = await waitForSelector("a[href='/en-us/checkout']");
    checkoutSecurely.click();
  }

  isCartActive = false;
}

async function signIn(lego) {
  isSignInActive = true;

  const { autocheckoutEnabled } = lego;

  if (autocheckoutEnabled) {
    const continueGuest = await waitForSelector(
      "button[data-test='continue-guest']"
    );
    continueGuest.click();
  }

  isSignInActive = false;
}

async function shipping(lego, profile) {
  isShippingActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = lego;
  const { contact, shipping } = profile;
  const fields = {
    deliveryFirstName: {
      selector: "[data-target='delivery'] input[name='firstName']",
      value: shipping.givenName,
    },
    deliveryLastName: {
      selector: "[data-target='delivery'] input[name='lastName']",
      value: shipping.familyName,
    },
    deliveryPhoneNumber: {
      selector: "[data-target='delivery'] input[name='phone']",
      value: contact.tel,
    },
    deliveryEmail: {
      selector: "[data-target='delivery'] input[name='email']",
      value: contact.email,
    },
    inputWithSuggestions: {
      selector:
        "[data-target='delivery'] input[data-test='input-with-suggestions']",
      value: shipping.addressLine1,
    },
    deliveryAddressLine1: {
      selector: "[data-target='delivery'] input[name='addressLine1']",
      value: shipping.addressLine1,
    },
    deliveryAddressLine2: {
      selector: "[data-target='delivery'] input[name='addressLine2']",
      value: shipping.addressLine2,
    },
    deliveryCity: {
      selector: "[data-target='delivery'] input[name='city']",
      value: shipping.addressLevel2,
    },
    deliveryState: {
      selector: "[data-target='delivery'] select[name='state']",
      value: shipping.addressLevel1,
    },
    deliveryPostalCode: {
      selector: "[data-target='delivery'] input[name='postalCode']",
      value: shipping.postalCode,
    },
  };

  waitForSelector("button[data-test='manual-address']").then((manualAddress) =>
    manualAddress.click()
  );

  if (autocheckoutEnabled) {
    const deliverySection = await waitForSelector(
      "[data-target='delivery'] [class^='Loadingstyles__Wrapper']"
    );

    if (deliverySection.querySelector("[data-test='address-form']")) {
      const deliveryFields = [
        fields.deliveryFirstName,
        fields.deliveryLastName,
        fields.deliveryPhoneNumber,
        fields.deliveryAddressLine1,
        fields.deliveryAddressLine2,
        fields.deliveryCity,
        fields.deliveryState,
        fields.deliveryPostalCode,
      ];

      if (document.querySelector(fields.deliveryEmail.selector)) {
        deliveryFields.push(fields.deliveryEmail);
      }

      for (const { selector, value } of deliveryFields) {
        await autofillSelector(selector, value, mode);
      }
    }

    const submitAddress = await waitForSelector(
      "[data-target='delivery'] button[data-test='submit-address']"
    );
    submitAddress.click();

    const continueToPayment = await waitForSelector(
      "button[data-test='continue-to-payment']"
    );
    continueToPayment.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isShippingActive = false;
}

async function payment(lego, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = lego;
  const { billing } = profile;
  const fields = {
    billingFirstName: {
      selector: "[data-target='payment'] input[name='firstName']",
      value: billing.givenName,
    },
    billingLastName: {
      selector: "[data-target='payment'] input[name='lastName']",
      value: billing.familyName,
    },
    billingAddressLine1: {
      selector: "[data-target='payment'] input[name='addressLine1']",
      value: billing.addressLine1,
    },
    billingAddressLine2: {
      selector: "[data-target='payment'] input[name='addressLine2']",
      value: billing.addressLine2,
    },
    billingCity: {
      selector: "[data-target='payment'] input[name='city']",
      value: billing.addressLevel2,
    },
    billingState: {
      selector: "[data-target='payment'] select[name='state']",
      value: billing.addressLevel1,
    },
    billingPostalCode: {
      selector: "[data-target='payment'] input[name='postalCode']",
      value: billing.postalCode,
    },
    billingCountry: {
      selector: "[data-target='payment'] select[name='country']",
      value: billing.country,
    },
  };

  waitForSelector("input[name='Payment Card']").then((paymentCardRadio) => {
    if (paymentCardRadio instanceof HTMLInputElement) {
      if (!paymentCardRadio.checked) {
        paymentCardRadio.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const billingAddressContainer = await waitForSelector(
      "[data-target='payment'] :is(#address-summary-container, #address-form)"
    );

    switch (billingAddressContainer.id) {
      case "address-summary-container":
        const changeBillingButton = await waitForSelector(
          "button[data-test='change-billing']"
        );

        if (
          changeBillingButton instanceof HTMLButtonElement &&
          changeBillingButton.textContent === "Edit Address"
        ) {
          changeBillingButton.click();
        } else {
          break;
        }

      case "address-form":
        const billingFields = [
          fields.billingCountry,
          fields.billingFirstName,
          fields.billingLastName,
          fields.billingAddressLine1,
          fields.billingAddressLine2,
          fields.billingCity,
          fields.billingPostalCode,
        ];

        switch (billing.country) {
          case "AU":
          case "CA":
          case "DP":
          case "MX":
          case "US":
            billingFields.push(fields.billingState);
        }

        for (const { selector, value } of billingFields) {
          await autofillSelector(selector, value, mode);
        }

        const submitAddress = await waitForSelector(
          "[data-target='payment'] button[data-test='submit-address']"
        );
        submitAddress.click();
    }

    await waitForTimeout(1000);
    const confirmOrderButton = await waitForSelector(
      "[data-target='payment'] button[data-test='confirm-order-button']:enabled"
    );
    confirmOrderButton.click();
  } else if (autofillEnabled) {
    waitForSelector("button[data-test='change-billing']").then(
      (changeBillingButton) => {
        if (
          changeBillingButton instanceof HTMLButtonElement &&
          changeBillingButton.textContent === "Edit Address"
        ) {
          changeBillingButton.click();
        }
      }
    );

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

chrome.runtime.onMessage.addListener(autofillLEGO);
