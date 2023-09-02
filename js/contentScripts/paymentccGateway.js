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
          creditCardNumber: {
            options: { polling: { visible: true }, type: { keys: true } },
            selector: "#creditCardNumber",
            value: payment.ccNumber,
          },
          expirationDate: {
            options: { polling: { visible: true }, type: { keys: true } },
            selector: "#expirationDate",
            value:
              payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
          },
          cvNumber: {
            options: { polling: { visible: true }, type: { keys: true } },
            selector: "#cvNumber",
            value: payment.ccCSC,
          },
        };

        await waitForTimeout(500);
        await Promise.all(
          Object.values(fields).map(({ options, selector, value }) =>
            autofillSelector(selector, value, mode, options)
          )
        );
      }
    }
  }
})();
