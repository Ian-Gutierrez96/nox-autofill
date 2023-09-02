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
        const { billing, payment } = profiles[profileKey];
        const fields = {
          creditCardNumber: {
            options: { polling: { visible: true } },
            selector: "#credit-card-number",
            value: payment.ccNumber,
          },
          expiration: {
            options: { polling: { visible: true } },
            selector: "#expiration",
            value:
              payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
          },
          cvv: {
            options: { polling: { visible: true } },
            selector: "#cvv",
            value: payment.ccCSC,
          },
          postalCode: {
            options: { polling: { visible: true } },
            selector: "#postal-code",
            value: billing.postalCode,
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
