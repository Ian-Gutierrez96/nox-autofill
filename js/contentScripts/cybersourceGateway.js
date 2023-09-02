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
          number: {
            options: { polling: { visible: true } },
            selector: "input[name='number']",
            value: payment.ccNumber,
          },
          name: {
            options: { polling: { visible: true } },
            selector: "input[name='name']",
            value: payment.ccGivenName + " " + payment.ccFamilyName,
          },
          expirationMonth: {
            options: { polling: { visible: true } },
            selector: "input[name='expirationMonth']",
            value: payment.ccExpMonth.padStart(2, "0"),
          },
          expirationYear: {
            options: { polling: { visible: true } },
            selector: "input[name='expirationYear']",
            value: "20" + payment.ccExpYear,
          },
          securityCode: {
            options: { polling: { visible: true } },
            selector: "input[name='securityCode']",
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
