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
          cardNumber: {
            selector: "#card-number",
            value: payment.ccNumber,
          },
          cardExpiry: {
            selector: "#card-expiry",
            value:
              payment.ccExpMonth.padStart(2, "0") + " / " + payment.ccExpYear,
          },
          cardName: {
            selector: "#card-name",
            value: payment.ccGivenName + " " + payment.ccFamilyName,
          },
          cardCode: {
            selector: "#card-code",
            value: payment.ccCSC,
          },
        };

        await Promise.all(
          Object.values(fields).map(({ selector, value }) =>
            autofillSelector(selector, value, mode)
          )
        );
      }
    }
  }
})();
