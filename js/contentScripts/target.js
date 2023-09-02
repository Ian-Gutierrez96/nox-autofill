"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isShippingActive = false;
let isPickupDeliveryActive = false;
let isPaymentActive = false;
let isPlaceOrderActive = false;
let isConfirmCVVActive = false;
let isConfirmCCNumberActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillTarget(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { target },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (target.autocheckoutEnabled || target.autofillEnabled) &&
      Object.hasOwn(profiles, target.profileKey)
    ) {
      const profile = profiles[target.profileKey];

      switch (location.pathname) {
        case "/":
          if (notifications) {
            displayNotification(target);
          }
          break;

        case "/cart":
          if (!isCartActive) {
            cart(target);
          }
          break;

        case "/checkout":
        case "/checkout/shipping":
        case "/checkout/pickup-delivery":
        case "/checkout/payment":
          if (!isShippingActive) {
            shipping(target, profile);
          }

          if (!isPickupDeliveryActive) {
            pickupDelivery(target, profile);
          }

          if (!isPaymentActive) {
            payment(target, profile);
          }

          if (!isPlaceOrderActive) {
            placeOrder(target);
          }

          if (!isConfirmCVVActive) {
            confirmCVV(target, profile);
          }

          if (!isConfirmCCNumberActive) {
            confirmCCNumber(target, profile);
          }
          break;
      }
    }
  }
}

function displayNotification(target) {
  const { autocheckoutEnabled } = target;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Target. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Target.",
  });
}

async function cart(target) {
  isCartActive = true;

  const { autocheckoutEnabled } = target;

  if (autocheckoutEnabled) {
    const checkoutButton = await waitForSelector(
      "button[data-test='checkout-button']"
    );
    checkoutButton.click();
  }

  isCartActive = false;
}

async function shipping(target, profile) {
  isShippingActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = target;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector: "input#first_name",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector: "input#last_name",
      value: shipping.familyName,
    },
    shippingAddressLine1: {
      selector: "input#address_line1",
      value: shipping.addressLine1,
    },
    shippingAddressLine2: {
      selector: "input#address_line2",
      value: shipping.addressLine2,
    },
    shippingZipCode: {
      selector: "input#zip_code",
      value: shipping.postalCode,
    },
    shippingCity: {
      selector: "input#city",
      value: shipping.addressLevel2,
    },
    shippingState: {
      selector: "select#state",
      value: shipping.addressLevel1,
    },
    shippingPhoneNumber: {
      selector: "input#phone_number",
      value: contact.tel,
    },
  };

  waitForXPath("//button[text()[contains(., '+ Address line 2')]]").then(
    (addressLine2Button) => addressLine2Button.click()
  );

  if (autocheckoutEnabled) {
    const deliveryFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddressLine1,
      fields.shippingAddressLine2,
      fields.shippingZipCode,
      fields.shippingCity,
      fields.shippingState,
      fields.shippingPhoneNumber,
    ];

    for (const { selector, value } of deliveryFields) {
      await autofillSelector(selector, value, mode);
    }

    const saveButton = await waitForXPath(
      "//button[text()[contains(., 'Save & continue')]]"
    );
    saveButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isShippingActive = false;
}

async function pickupDelivery(target, profile) {
  isPickupDeliveryActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = target;
  const { shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector: "input#pickup-person-name",
      value: shipping.givenName + " " + shipping.familyName,
    },
  };

  waitForSelector("#alternatePickupCheckbox").then(
    (alternatePickupCheckbox) => {
      if (
        alternatePickupCheckbox instanceof HTMLInputElement &&
        alternatePickupCheckbox.checked
      ) {
        alternatePickupCheckbox.click();
      }
    }
  );

  if (autocheckoutEnabled) {
    const pickupDeliveryFields = [fields.shippingFirstName];

    for (const { selector, value } of pickupDeliveryFields) {
      await autofillSelector(selector, value, mode);
    }

    const saveAndContinueButton = await waitForXPath(
      "//button[text()[contains(., 'Save and continue')]]"
    );
    saveAndContinueButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isPickupDeliveryActive = false;
}

async function payment(target, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = target;
  const { billing, contact, payment } = profile;
  const fields = {
    creditCardNumberInput: {
      selector: "input#credit-card-number-input",
      value: payment.ccNumber,
    },
    creditCardExpirationInput: {
      selector: "input#credit-card-expiration-input",
      value: payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
    },
    creditCardCVVInput: {
      selector: "input#credit-card-cvv-input",
      value: payment.ccCSC,
    },
    creditCardNameInput: {
      selector: "input#credit-card-name-input",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    billingAddressCountrySelect: {
      selector: "select#billing-address-country-input",
      value: billing.country,
    },
    billingAddressLine1Input: {
      selector: "input#billing-address-line1-input",
      value: billing.addressLine1,
    },
    billingAddressLine2Input: {
      selector: "input#billing-address-line2-input",
      value: billing.addressLine2,
    },
    billingAddressZipCodeInput: {
      selector: "input#billing-address-zip-code-input",
      value: billing.postalCode,
    },
    billingAddressCityInput: {
      selector: "input#billing-address-city-input",
      value: billing.addressLevel2,
    },
    billingAddressStateSelect: {
      selector: "select#billing-address-state-input",
      value: billing.addressLevel1,
    },
    billingAddressStateInput: {
      selector: "input#billing-address-state-input",
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
    },
    billingAddressPhoneInput: {
      selector: "input#billing-address-phone-input",
      value: contact.tel,
    },
  };

  waitForSelector("button[data-test='add-new-payment-address-button']").then(
    (addNewPaymentAddressButton) => addNewPaymentAddressButton.click()
  );

  waitForXPath("//button[text()[contains(., '+ Address 2')]]").then(
    (addAddressLine2Button) => addAddressLine2Button.click()
  );

  if (autocheckoutEnabled) {
    const paymentFields = [
      fields.creditCardNumberInput,
      fields.creditCardExpirationInput,
      fields.creditCardCVVInput,
      fields.creditCardNameInput,
      fields.billingAddressCountrySelect,
      fields.billingAddressLine1Input,
      fields.billingAddressLine2Input,
      fields.billingAddressZipCodeInput,
      fields.billingAddressCityInput,
      fields.billingAddressPhoneInput,
    ];

    switch (billing.country) {
      case "US":
        paymentFields.push(fields.billingAddressStateSelect);
        break;

      default:
        paymentFields.push(fields.billingAddressStateInput);
        break;
    }

    for (const { selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode);
    }

    const saveAndContinueButton = await waitForXPath(
      "//button[text()[contains(., 'Save and continue')]]"
    );
    saveAndContinueButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isPaymentActive = false;
}

async function placeOrder(target) {
  isPlaceOrderActive = true;

  const { autocheckoutEnabled } = target;

  if (autocheckoutEnabled) {
    const placeOrderButton = await waitForXPath(
      "//button[text()[contains(., 'Place your order')]][not(@disabled)]"
    );
    placeOrderButton.click();
  }

  isPlaceOrderActive = false;
}

async function confirmCVV(target, profile) {
  isConfirmCVVActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = target;
  const { payment } = profile;
  const fields = {
    creditCardCVVInput: {
      selector: ".ModalDrawer #credit-card-cvv-input",
      value: payment.ccCSC,
    },
  };

  if (autocheckoutEnabled) {
    const confirmCVVFields = [fields.creditCardCVVInput];

    for (const { selector, value } of confirmCVVFields) {
      await autofillSelector(selector, value, mode);
    }

    const confirmButton = await waitForSelector(
      "button[data-test='confirm-button']"
    );
    confirmButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isConfirmCVVActive = false;
}

async function confirmCCNumber(target, profile) {
  isConfirmCCNumberActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = target;
  const { payment } = profile;
  const fields = {
    creditCardNumberInput: {
      selector: ".ModalDrawer #credit-card-number-input",
      value: payment.ccNumber,
    },
  };

  if (autocheckoutEnabled) {
    const confirmCCNumberFields = [fields.creditCardNumberInput];

    for (const { selector, value } of confirmCCNumberFields) {
      await autofillSelector(selector, value, mode);
    }

    const verifyCardButton = await waitForSelector(
      "button[data-test='verify-card-button']"
    );
    verifyCardButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isConfirmCCNumberActive = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillTarget);
