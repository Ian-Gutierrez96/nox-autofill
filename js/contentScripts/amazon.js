"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isPrimeInterstitialActive = false;
let isAddressSelectActive = false;
let isPaySelectActive = false;
let isAddBillingActive = false;
let isSPCActive = false;

const homeRegExp = /^\/$/;
const cartRegExp = /\/gp\/(?:(?:cart|huc)\/view\.html|aw\/c)/;
const primeInterstitialRegExp =
  /\/gp\/buy\/primeinterstitial\/handlers\/display\.html/;
const addressSelectRegExp = /\/gp\/buy\/addressselect\/handlers\/display\.html/;
const paySelectRegExp = /\/gp\/buy\/payselect\/handlers\/display\.html/;
const spcRegExp = /\/gp\/buy\/spc\/handlers\/display\.html/;

// ============================================================================
// Functions
// ============================================================================

async function autofillAmazon(message) {
  if (message.event !== "tab-update") return;

  const {
    profiles,
    scripts: { amazon },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (blacklistedSites.includes(location.origin)) return;
  if (!amazon.autocheckoutEnabled && !amazon.autofillEnabled) return;
  if (!Object.hasOwn(profiles, amazon.profileKey)) return;

  const profile = profiles[amazon.profileKey];

  if (homeRegExp.test(location.pathname)) {
    if (notifications) displayNotification(amazon);
  } else if (cartRegExp.test(location.pathname)) {
    if (!isCartActive) cart(amazon);
  } else if (primeInterstitialRegExp.test(location.pathname)) {
    if (!isPrimeInterstitialActive) primeInterstitial(amazon);
  } else if (addressSelectRegExp.test(location.pathname)) {
    if (!isAddressSelectActive) addressSelect(amazon, profile);
  } else if (paySelectRegExp.test(location.pathname)) {
    if (!isPaySelectActive) paySelect(amazon, profile);
    if (!isAddBillingActive) addBilling(amazon, profile);
  } else if (spcRegExp.test(location.pathname)) {
    if (!isSPCActive) spc(amazon);
  }
}

function displayNotification(amazon) {
  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: amazon.autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Amazon. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Amazon.",
  });
}

async function cart(amazon) {
  isCartActive = true;

  const { autocheckoutEnabled } = amazon;

  if (autocheckoutEnabled) {
    const proceedToCheckoutButton = await waitForSelector(
      "#sc-buy-box input[type='submit'], #hlb-ptc-btn-native, button[name='proceedToRetailCheckout']",
      { visible: true }
    );
    proceedToCheckoutButton.click();
  }

  isCartActive = false;
}

async function primeInterstitial(amazon) {
  isPrimeInterstitialActive = true;

  const { autocheckoutEnabled } = amazon;

  if (autocheckoutEnabled) {
    await waitForTimeout(500);
    const declineOfferButton = await waitForSelector(
      "#prime-interstitial-nothanks-button, form[name='confirmPurchase'] span[data-action='page-transit-no-update-action'] button",
      { visible: true }
    );
    declineOfferButton.click();
  }

  isPrimeInterstitialActive = false;
}

async function addressSelect(amazon, profile) {
  isAddressSelectActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = amazon;
  const { contact, shipping } = profile;
  const fields = {
    enterAddressCountryCodeDropdown: {
      selector: "#address-ui-widgets-countryCode-dropdown-nativeId:enabled",
      value: shipping.country,
    },
    enterAddressFullName: {
      selector: "#address-ui-widgets-enterAddressFullName:enabled",
      value: shipping.givenName + " " + shipping.familyName,
    },
    enterAddressPhoneNumber: {
      selector: "#address-ui-widgets-enterAddressPhoneNumber:enabled",
      value: contact.tel,
    },
    enterAddressLine1: {
      selector: "#address-ui-widgets-enterAddressLine1:enabled",
      value: shipping.addressLine1,
    },
    enterAddressLine2: {
      selector: "#address-ui-widgets-enterAddressLine2:enabled",
      value: shipping.addressLine2,
    },
    enterAddressCity: {
      selector: "#address-ui-widgets-enterAddressCity:enabled",
      value: shipping.addressLevel2,
    },
    enterAddressCityDropdown: {
      selector:
        "#address-ui-widgets-enterAddressCity-dropdown-nativeId:enabled",
      value: shipping.addressLevel2.toUpperCase(),
    },
    enterAddressStateOrRegion: {
      selector: "#address-ui-widgets-enterAddressStateOrRegion:enabled",
      value: getFullAddressLevel1(shipping.country, shipping.addressLevel1),
    },
    enterAddressStateOrRegionDropdown: {
      selector:
        "#address-ui-widgets-enterAddressStateOrRegion-dropdown-nativeId:enabled",
      value: shipping.addressLevel1,
    },
    enterAddressPostalCode: {
      selector: "#address-ui-widgets-enterAddressPostalCode:enabled",
      value: shipping.postalCode,
    },
  };

  const addressForm = await Promise.race([
    waitForSelector("#shipaddress #address-list", { visible: true }),
    waitForSelector("#shipaddress #address-ui-checkout-form", {
      visible: true,
    }),
  ]);

  if (autocheckoutEnabled) {
    if (addressForm.id === "address-ui-checkout-form") {
      const shippingFields = [
        fields.enterAddressFullName,
        fields.enterAddressPhoneNumber,
        fields.enterAddressLine1,
        fields.enterAddressLine2,
        fields.enterAddressPostalCode,
      ];

      if (isCityDropdownIncluded(shipping.country)) {
        shippingFields.push(fields.enterAddressCityDropdown);
      } else {
        shippingFields.push(fields.enterAddressCity);
      }

      if (isStateOrRegionDropdownIncluded(shipping.country)) {
        shippingFields.push(fields.enterAddressStateOrRegionDropdown);
      } else if (isStateOrRegionIncluded(shipping.country)) {
        shippingFields.push(fields.enterAddressStateOrRegion);
      }

      await initializeAddressForm(
        addressForm,
        fields.enterAddressCountryCodeDropdown,
        mode
      );

      for (const { selector, value } of shippingFields) {
        await autofillSelector(selector, value, mode, {
          polling: { parent: addressForm },
        });
      }

      await waitForTimeout(500);
      const submitAddressButton = await waitForSelector(
        "#address-ui-widgets-form-submit-button input",
        { parent: addressForm }
      );
      submitAddressButton.click();
    } else if (addressForm.id === "address-list") {
      await waitForTimeout(500);
      const selectAddressButton = await waitForSelector(
        "#shipToThisAddressButton input",
        { parent: addressForm }
      );
      selectAddressButton.click();
    }
  } else if (autofillEnabled) {
    const shippingFields = [
      fields.enterAddressFullName,
      fields.enterAddressPhoneNumber,
      fields.enterAddressLine1,
      fields.enterAddressLine2,
      fields.enterAddressCity,
      fields.enterAddressCityDropdown,
      fields.enterAddressStateOrRegionDropdown,
      fields.enterAddressPostalCode,
    ];

    await initializeAddressForm(
      addressForm,
      fields.enterAddressCountryCodeDropdown,
      mode
    );

    await Promise.race(
      shippingFields.map(({ selector, value }) =>
        autofillSelector(selector, value, mode, {
          polling: { parent: addressForm },
        })
      )
    );
  }

  isAddressSelectActive = false;
}

async function paySelect(amazon, profile) {
  isPaySelectActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = amazon;
  const { payment } = profile;
  const fields = {
    addCreditCardNumber: {
      options: { polling: { visible: true } },
      selector: "input[name='addCreditCardNumber']",
      value: payment.ccNumber,
    },
    accountHolderName: {
      options: { polling: { visible: true } },
      selector: "input[name='ppw-accountHolderName']",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    expirationDateMonth: {
      options: { polling: { visible: true } },
      selector: "input[name='ppw-expirationDate_month']",
      value: payment.ccExpMonth,
    },
    expirationDateYear: {
      options: { polling: { visible: true } },
      selector: "input[name='ppw-expirationDate_year']",
      value: "20" + payment.ccExpYear,
    },
  };

  if (autocheckoutEnabled) {
    const paymentInstrumentElement = await waitForSelector(
      "#payment :is([data-instrument-id], #apx-add-credit-card-action-test-id)",
      { visible: true }
    );

    if (paymentInstrumentElement.id === "apx-add-credit-card-action-test-id") {
      await waitForTimeout(500);
      paymentInstrumentElement.click();
    }

    await waitForTimeout(500);
    const useThisPaymentButton = await waitForSelector(
      ".apx-compact-continue-action:not(.a-button-disabled) input",
      { visible: true }
    );
    useThisPaymentButton.click();
  } else if (autofillEnabled) {
    await Promise.race(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }

  isPaySelectActive = false;
}

async function addBilling(amazon, profile) {
  isAddBillingActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = amazon;
  const { billing, contact } = profile;
  const fields = {
    enterAddressCountryCodeDropdown: {
      selector: "#address-ui-widgets-countryCode-dropdown-nativeId:enabled",
      value: billing.country,
    },
    enterAddressFullName: {
      selector: "#address-ui-widgets-enterAddressFullName:enabled",
      value: billing.givenName + " " + billing.familyName,
    },
    enterAddressPhoneNumber: {
      selector: "#address-ui-widgets-enterAddressPhoneNumber:enabled",
      value: contact.tel,
    },
    enterAddressLine1: {
      selector: "#address-ui-widgets-enterAddressLine1:enabled",
      value: billing.addressLine1,
    },
    enterAddressLine2: {
      selector: "#address-ui-widgets-enterAddressLine2:enabled",
      value: billing.addressLine2,
    },
    enterAddressCity: {
      selector: "#address-ui-widgets-enterAddressCity:enabled",
      value: billing.addressLevel2,
    },
    enterAddressCityDropdown: {
      selector:
        "#address-ui-widgets-enterAddressCity-dropdown-nativeId:enabled",
      value: billing.addressLevel2.toUpperCase(),
    },
    enterAddressStateOrRegion: {
      selector: "#address-ui-widgets-enterAddressStateOrRegion:enabled",
      value: getFullAddressLevel1(billing.country, billing.addressLevel1),
    },
    enterAddressStateOrRegionDropdown: {
      selector:
        "#address-ui-widgets-enterAddressStateOrRegion-dropdown-nativeId:enabled",
      value: billing.addressLevel1,
    },
    enterAddressPostalCode: {
      selector: "#address-ui-widgets-enterAddressPostalCode:enabled",
      value: billing.postalCode,
    },
  };

  const addNewBillingLink = await waitForSelector(
    "#payment #add-new-address-popover-link",
    { visible: true }
  );
  addNewBillingLink.click();

  const addressForm = await waitForSelector(
    "#add-billing-address-popover #address-ui-checkout-form",
    { visible: true }
  );

  if (autocheckoutEnabled) {
    const billingFields = [
      fields.enterAddressFullName,
      fields.enterAddressPhoneNumber,
      fields.enterAddressLine1,
      fields.enterAddressLine2,
      fields.enterAddressPostalCode,
    ];

    if (isCityDropdownIncluded(billing.country)) {
      billingFields.push(fields.enterAddressCityDropdown);
    } else {
      billingFields.push(fields.enterAddressCity);
    }

    if (isStateOrRegionDropdownIncluded(billing.country)) {
      billingFields.push(fields.enterAddressStateOrRegionDropdown);
    } else if (isStateOrRegionIncluded(billing.country)) {
      billingFields.push(fields.enterAddressStateOrRegion);
    }

    await initializeAddressForm(
      addressForm,
      fields.enterAddressCountryCodeDropdown,
      mode
    );

    for (const { selector, value } of billingFields) {
      await autofillSelector(selector, value, mode, {
        polling: { parent: addressForm },
      });
    }

    await waitForTimeout(500);
    const submitAddressButton = await waitForSelector(
      "#address-ui-widgets-form-submit-button input",
      { parent: addressForm }
    );
    submitAddressButton.click();
  } else if (autofillEnabled) {
    const billingFields = [
      fields.enterAddressFullName,
      fields.enterAddressPhoneNumber,
      fields.enterAddressLine1,
      fields.enterAddressLine2,
      fields.enterAddressCity,
      fields.enterAddressCityDropdown,
      fields.enterAddressStateOrRegionDropdown,
      fields.enterAddressPostalCode,
    ];

    await initializeAddressForm(
      addressForm,
      fields.enterAddressCountryCodeDropdown,
      mode
    );

    await Promise.race(
      billingFields.map(({ selector, value }) =>
        autofillSelector(selector, value, mode, {
          polling: { parent: addressForm },
        })
      )
    );
  }

  isAddBillingActive = false;
}

async function spc(amazon) {
  isSPCActive = true;

  if (amazon.autocheckoutEnabled) {
    const submitOrderButton = await waitForSelector(
      "#bottomSubmitOrderButtonId input",
      { visible: true }
    );
    submitOrderButton.click();
  }

  isSPCActive = false;
}

function initializeAddressForm(addressForm, countryField, mode) {
  const updatedContainerSelector =
    "div[data-csa-c-content-id$='" + countryField.value.toUpperCase() + "']";

  return Promise.all([
    autofillSelector(
      countryField.selector,
      countryField.value,
      mode,
      countryField.options
    ),
    waitForSelector(updatedContainerSelector, {
      parent: addressForm,
      visible: true,
    }),
  ]);
}

function isCityDropdownIncluded(country) {
  return ["AU", "PL"].includes(country);
}

function isStateOrRegionDropdownIncluded(country) {
  return ["AU", "CA", "IE", "US"].includes(country);
}

function isStateOrRegionIncluded(country) {
  return !["AT", "BE", "EG", "FR", "DE", "SA", "SE", "AE", "GB"].includes(
    country
  );
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillAmazon);
