"use strict";

(async () => {
  if (self !== top) {
    const {
      profiles,
      scripts,
      settings: { blacklistedSites },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);
    const parentOrigin = location.ancestorOrigins[0];

    if (!blacklistedSites.includes(parentOrigin)) {
      const {
        autocheckoutEnabled,
        autofillEnabled,
        enabled,
        mode,
        profileKey,
      } =
        Object.values(scripts).find(
          (script) => script.origin === parentOrigin
        ) ?? scripts.aioAutofill;

      if (
        (autocheckoutEnabled || autofillEnabled || enabled) &&
        Object.hasOwn(profiles, profileKey)
      ) {
        const { payment } = profiles[profileKey];
        const fields = {
          cardHolderName: {
            options: { type: { keys: true } },
            selector: "input#name",
            value: payment.ccGivenName + " " + payment.ccFamilyName,
          },
          cardNumber: {
            options: { type: { keys: true } },
            selector: "input#number",
            value: payment.ccNumber,
          },
          expirationMonth: {
            selector: "select#expirationMonth",
            value: payment.ccExpMonth,
          },
          expirationYear: {
            selector: "select#expirationYear",
            value: "20" + payment.ccExpYear,
          },
          securityCode: {
            options: { type: { keys: true } },
            selector: "input#securityCode",
            value: payment.ccCSC,
          },
        };

        await Promise.all(
          Object.values(fields).map(({ options, selector, value }) =>
            autofillSelector(selector, value, mode, options)
          )
        );
      }
    }
  }
})();
