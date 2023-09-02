"use strict";

if (self !== top) {
  autofillWalletWalmart();
}

async function autofillWalletWalmart() {
  const {
    profiles,
    scripts: { walmart },
    settings: { blacklistedSites },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.ancestorOrigins[0]) &&
    (walmart.autocheckoutEnabled || walmart.autofillEnabled) &&
    Object.hasOwn(profiles, walmart.profileKey)
  ) {
    const profile = profiles[walmart.profileKey];

    switch (location.pathname) {
      case "/payments/wallet":
        singleFormAddPayment(walmart, profile);
        wallet(walmart, profile);
    }
  }
}

async function singleFormAddPayment(walmart, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = walmart;
  const { billing, contact, payment } = profile;
  const fields = {
    ccNumber: {
      selector: "#single-form-add-payment input[autocomplete='cc-number']",
      value: payment.ccNumber,
    },
    ccGivenName: {
      selector:
        "#single-form-add-payment input:is([autocomplete='cc-given-name'], [autocomplete='given-name'])",
      value: payment.ccGivenName,
    },
    ccFamilyName: {
      selector:
        "#single-form-add-payment input:is([autocomplete='cc-family-name'], [autocomplete='family-name'])",
      value: payment.ccFamilyName,
    },
    ccExpMonth: {
      selector: "#single-form-add-payment select[autocomplete='cc-exp-month']",
      value: payment.ccExpMonth.padStart(2, "0"),
    },
    ccExpYear: {
      selector: "#single-form-add-payment select[autocomplete='cc-exp-year']",
      value: "20" + payment.ccExpYear,
    },
    ccCSC: {
      selector: "#single-form-add-payment input[autocomplete='cc-csc']",
      value: payment.ccCSC,
    },
    paymentPhone: {
      selector: "#single-form-add-payment input[autocomplete='tel-national']",
      value: contact.tel,
    },
    billingAddressLineOne: {
      selector:
        "#single-form-add-payment input:is([autocomplete='address-line1'], #addressLineOne)",
      value: billing.addressLine1,
    },
    billingAddressLineTwo: {
      selector: "#single-form-add-payment input[autocomplete='address-line2']",
      value: billing.addressLine2,
    },
    billingCity: {
      selector: "#single-form-add-payment input[autocomplete='address-level2']",
      value: billing.addressLevel2,
    },
    billingState: {
      selector:
        "#single-form-add-payment select[autocomplete='address-level1']",
      value: billing.addressLevel1,
    },
    billingPostalCode: {
      selector: "#single-form-add-payment input[autocomplete='postal-code']",
      value: billing.postalCode,
    },
  };

  await waitForSelector("#single-form-add-payment");
  await waitForTimeout(500);

  waitForXPath(
    "//*[@id='single-form-add-payment']//button[text()='Add new address']"
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
      "button[form='single-form-add-payment'][type='submit']"
    );
    addCreditCardContinueButton.click();
  } else if (autofillEnabled) {
    await Promise.race(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }
}

async function wallet(walmart, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = walmart;
  const { payment } = profile;
  const fields = {
    creditCardCvv: {
      value: payment.ccCSC,
      xpath:
        "//*[text()='Please enter the CVV for the card']/ancestor::form[1]//input[@type='password']",
    },
  };

  const walletDialog = await waitForXPath(
    "//*[text()='Wallet']/ancestor::div[@role='dialog'][1]"
  );

  if (autocheckoutEnabled) {
    // Wait for the default card to load in
    const defaultCardElement = await waitForXPath(
      ".//*[text()='Default card']/ancestor::li[1]",
      { parent: walletDialog }
    );

    // Autofill the credit card CVV field if it exists for the default card
    const enterCVVForm = getElementByXPath(
      ".//*[text()='Please enter the CVV for the card']/ancestor::form[1]",
      defaultCardElement
    );

    if (enterCVVForm instanceof HTMLFormElement) {
      await autofillSelector("input[type='password']", payment.ccCSC, mode, {
        polling: { parent: enterCVVForm },
      });

      const confirmCVVButton = await waitForSelector("button[type='submit']", {
        parent: enterCVVForm,
      });
      confirmCVVButton.click();

      await waitForTimeout(2500);
    }

    // Click the continue button if the field is contained in a modal
    const continueButton = await waitForXPath(".//button[text()='Continue']", {
      parent: walletDialog,
    });
    continueButton.click();
  } else if (autofillEnabled) {
    await Promise.race(
      Object.values(fields).map(({ value, xpath }) =>
        autofillXPath(xpath, value, mode, { polling: { parent: walletDialog } })
      )
    );
  }
}
