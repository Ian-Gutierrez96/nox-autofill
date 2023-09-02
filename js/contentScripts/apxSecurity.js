"use strict";

// ============================================================================
// Main
// ============================================================================

if (self !== top) {
  autofillAPXSecurity();
}

// ============================================================================
// Functions
// ============================================================================

async function autofillAPXSecurity() {
  const {
    profiles,
    scripts: { amazon },
    settings: { blacklistedSites },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (blacklistedSites.includes(location.ancestorOrigins[0])) return;
  if (!amazon.autocheckoutEnabled && !amazon.autofillEnabled) return;
  if (!Object.hasOwn(profiles, amazon.profileKey)) return;

  const profile = profiles[amazon.profileKey];

  switch (location.pathname) {
    case "/cpe/pm/register":
      register(amazon, profile);
  }
}

async function register(amazon, profile) {
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
      selector: "select[name='ppw-expirationDate_month']",
      value: payment.ccExpMonth,
    },
    expirationDateYear: {
      options: { polling: { visible: true } },
      selector: "select[name='ppw-expirationDate_year']",
      value: "20" + payment.ccExpYear,
    },
  };

  if (autocheckoutEnabled) {
    const creditCardFields = [
      fields.addCreditCardNumber,
      fields.accountHolderName,
      fields.expirationDateMonth,
      fields.expirationDateYear,
    ];

    for (const { options, selector, value } of creditCardFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForTimeout(500);
    const addYourCardButton = await waitForSelector(
      "input[name='ppw-widgetEvent:AddCreditCardEvent']",
      { visible: true }
    );
    addYourCardButton.click();
  } else if (autofillEnabled) {
    await Promise.race(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}
