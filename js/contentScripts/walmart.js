"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isAddEditAddressActive = false;
let isAddressSelectionActive = false;
let isAddCreditCardActive = false;
let isPaymentActive = false;
let isContactActive = false;
let isBuyNowActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillWalmart(message) {
  if (message.event !== "tab-update") return;

  const {
    profiles,
    scripts: { walmart },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (blacklistedSites.includes(location.origin)) return;
  if (!walmart.autocheckoutEnabled && !walmart.autofillEnabled) return;
  if (!Object.hasOwn(profiles, walmart.profileKey)) return;

  const profile = profiles[walmart.profileKey];

  switch (location.pathname) {
    case "/":
      if (notifications) {
        displayNotification(walmart);
      }
      break;

    case "/cart":
      if (!isCartActive) {
        cart(walmart);
      }
      break;

    default:
      if (!isAddEditAddressActive) {
        addEditAddress(walmart, profile);
      }

      if (!isAddressSelectionActive) {
        addressSelection(walmart);
      }

      if (!isAddCreditCardActive) {
        addCreditCard(walmart, profile);
      }

      if (!isPaymentActive) {
        payment(walmart, profile);
      }

      if (!isContactActive) {
        contact(walmart, profile);
      }

      if (!isBuyNowActive) {
        buyNow(walmart);
      }
  }
}

function displayNotification(walmart) {
  const { autocheckoutEnabled } = walmart;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Walmart. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Walmart.",
  });
}

async function cart(walmart) {
  isCartActive = true;

  const { autocheckoutEnabled } = walmart;

  if (autocheckoutEnabled) {
    waitForSelector("button[data-automation-id='continue-as-guest-btn']", {
      visible: true,
    }).then((continueAsGuestButton) => continueAsGuestButton.click());

    const continueToCheckoutButton = await waitForXPath(
      "//button[text()='Continue to checkout']",
      { visible: true }
    );
    continueToCheckoutButton.click();
  }

  isCartActive = false;
}

async function addEditAddress(walmart, profile) {
  isAddEditAddressActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = walmart;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector: "#add-edit-address-form input[name='firstName']",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector: "#add-edit-address-form input[name='lastName']",
      value: shipping.familyName,
    },
    shippingAddressLineOne: {
      selector: "#add-edit-address-form input[name='addressLineOne']",
      value: shipping.addressLine1,
    },
    shippingAddressLineTwo: {
      selector: "#add-edit-address-form input[name='addressLineTwo']",
      value: shipping.addressLine2,
    },
    shippingCity: {
      selector: "#add-edit-address-form input[name='city']",
      value: shipping.addressLevel2,
    },
    shippingState: {
      selector: "#add-edit-address-form select[name='state']",
      value: shipping.addressLevel1,
    },
    shippingPostalCode: {
      selector: "#add-edit-address-form input[name='postalCode']",
      value: shipping.postalCode,
    },
    shippingPhone: {
      selector: "#add-edit-address-form input[name='phone']",
      value: contact.tel,
    },
  };

  await waitForSelector("#add-edit-address-form");
  await waitForTimeout(500);

  if (autocheckoutEnabled) {
    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingAddressLineOne,
      fields.shippingAddressLineTwo,
      fields.shippingCity,
      fields.shippingState,
      fields.shippingPostalCode,
      fields.shippingPhone,
    ];

    for (const { selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode);
    }

    const continueButton = await waitForSelector(
      "button[form='add-edit-address-form'][type='submit']"
    );
    continueButton.click();
  } else if (autofillEnabled) {
    await Promise.race(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isAddEditAddressActive = false;
}

async function addressSelection(walmart) {
  isAddressSelectionActive = true;

  const { autocheckoutEnabled } = walmart;

  await waitForSelector("#address-selection-form");
  await waitForTimeout(500);

  if (autocheckoutEnabled) {
    const addressSelectionContinueButton = await waitForSelector(
      "button[form='address-selection-form'][type='submit']"
    );
    addressSelectionContinueButton.click();
  }

  isAddressSelectionActive = false;
}

async function addCreditCard(walmart, profile) {
  isAddCreditCardActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = walmart;
  const { billing, contact, payment } = profile;
  const fields = {
    ccNumber: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input[autocomplete='cc-number']",
      value: payment.ccNumber,
    },
    ccGivenName: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input:is([autocomplete='cc-given-name'], [autocomplete='given-name'])",
      value: payment.ccGivenName,
    },
    ccFamilyName: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input:is([autocomplete='cc-family-name'], [autocomplete='family-name'])",
      value: payment.ccFamilyName,
    },
    ccExpMonth: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) select[autocomplete='cc-exp-month']",
      value: payment.ccExpMonth.padStart(2, "0"),
    },
    ccExpYear: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) select[autocomplete='cc-exp-year']",
      value: "20" + payment.ccExpYear,
    },
    ccCSC: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input[autocomplete='cc-csc']",
      value: payment.ccCSC,
    },
    paymentPhone: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input[autocomplete='tel-national']",
      value: contact.tel,
    },
    billingAddressLineOne: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input:is([autocomplete='address-line1'], #addressLineOne)",
      value: billing.addressLine1,
    },
    billingAddressLineTwo: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input[autocomplete='address-line2']",
      value: billing.addressLine2,
    },
    billingCity: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input[autocomplete='address-level2']",
      value: billing.addressLevel2,
    },
    billingState: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) select[autocomplete='address-level1']",
      value: billing.addressLevel1,
    },
    billingPostalCode: {
      selector:
        ":is(#add-creditcard-form, #single-form-add-payment) input[autocomplete='postal-code']",
      value: billing.postalCode,
    },
  };

  waitForXPath(
    "//*[@id='add-creditcard-form' or @id='single-form-add-payment']//button[text()='Add new address']"
  ).then((addNewAddressButton) => addNewAddressButton.click());

  if (autocheckoutEnabled) {
    const paymentFields = [
      fields.ccNumber,
      fields.ccGivenName,
      fields.ccFamilyName,
      fields.ccExpMonth,
      fields.ccExpYear,
      fields.ccCSC,
      fields.paymentPhone,
      fields.billingAddressLineOne,
      fields.billingAddressLineTwo,
      fields.billingCity,
      fields.billingState,
      fields.billingPostalCode,
    ];

    for (const { selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode);
    }

    const addCreditCardContinueButton = await waitForSelector(
      ":is(#add-creditcard-form, #single-form-add-payment) button[type='submit']"
    );
    addCreditCardContinueButton.click();
  } else if (autofillEnabled) {
    await Promise.race(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isAddCreditCardActive = false;
}

async function payment(walmart, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = walmart;
  const { payment } = profile;
  const fields = {
    creditCardCvv: {
      options: { type: { keys: true } },
      value: payment.ccCSC,
      xpath:
        "//*[text()='Please enter the CVV for the card']/ancestor::form[1]//input[@type='password']",
    },
  };

  if (autocheckoutEnabled) {
    const paymentFields = [fields.creditCardCvv];

    for (const { options, value, xpath } of paymentFields) {
      await autofillXPath(xpath, value, mode, options);
    }

    // Click the continue button if the field is contained in a modal
    const continueButton = getElementByXPath(
      "//ancestor::*[@role='dialog'][1]//button[text()='Continue']"
    );

    if (continueButton instanceof HTMLElement) {
      continueButton.click();
    }
  } else if (autofillEnabled) {
    await Promise.race(
      Object.values(fields).map(({ options, value, xpath }) =>
        autofillXPath(xpath, value, mode, options)
      )
    );
  }

  isPaymentActive = false;
}

async function contact(walmart, profile) {
  isContactActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = walmart;
  const { contact } = profile;
  const fields = {
    contactMobileNumber: {
      options: { type: { keys: true } },
      value: contact.tel,
      xpath:
        "//*[@id='contact-card-header']/ancestor::section[1]//input[@autocomplete='tel-national']",
    },
    contactEmailAddress: {
      options: { type: { keys: true } },
      value: contact.email,
      xpath:
        "//*[@id='contact-card-header']/ancestor::section[1]//input[@autocomplete='email']",
    },
  };

  if (autocheckoutEnabled) {
    // wait for the phone number field and autofill the HTML element
    await autofillXPath(
      fields.contactMobileNumber.xpath,
      fields.contactMobileNumber.value,
      mode,
      fields.contactMobileNumber.options
    );

    // Autofill the email address field which exists if the user is a guest
    const emailAddressElement = getElementByXPath(
      fields.contactEmailAddress.xpath
    );

    if (emailAddressElement instanceof HTMLElement) {
      await autofillHTMLElement(
        emailAddressElement,
        fields.contactEmailAddress.value,
        mode,
        fields.contactEmailAddress.options
      );
    }

    // Wait a second before clicking the "Place order" button
    await waitForTimeout(1000);
    const placeOrder = await waitForXPath(
      "//*[@id='mobile-sticky-footer']//button[text()[contains(., 'Place order')]]"
    );
    placeOrder.click();
  } else if (autofillEnabled) {
    await Promise.race(
      Object.values(fields).map(({ options, value, xpath }) =>
        autofillXPath(xpath, value, mode, options)
      )
    );
  }

  isContactActive = false;
}

async function buyNow(walmart) {
  isBuyNowActive = true;

  const { autocheckoutEnabled } = walmart;

  if (autocheckoutEnabled) {
    const modalElement = await waitForXPath(
      "//*[text()='Buy now']/ancestor::div[@role='dialog'][1]"
    );

    await processSection("Ship to", "Add an address");
    await processSection("Pay with", "Add a payment method");
    await processSection("Pay with", "Enter your CVV");

    const placeOrderButton = await waitForXPath(
      ".//button[text()='Place order']",
      { parent: modalElement }
    );
    placeOrderButton.click();

    async function processSection(title, description) {
      const sectionXPath = `.//*[text()='${title}']/ancestor::li[1]`;
      const descriptionXPath = `.//*[text()='${description}']`;

      const sectionElement = await waitForXPath(sectionXPath, {
        parent: modalElement,
      });

      if (getElementByXPath(descriptionXPath, sectionElement)) {
        sectionElement.click();

        await waitForXPath(`${sectionXPath}[not(${descriptionXPath})]`, {
          parent: modalElement,
        });
        await waitForTimeout(1000);
      }
    }
  }

  isBuyNowActive = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillWalmart);
