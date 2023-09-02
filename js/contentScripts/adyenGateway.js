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
          encryptedCardNumber: {
            selector: "#encryptedCardNumber",
            value: payment.ccNumber,
          },
          encryptedExpiryMonth: {
            selector: "#encryptedExpiryMonth",
            value: payment.ccExpMonth.padStart(2, "0"),
          },
          encryptedExpiryYear: {
            selector: "#encryptedExpiryYear",
            value: payment.ccExpYear,
          },
          encryptedSecurityCode: {
            selector: "#encryptedSecurityCode",
            value: payment.ccCSC,
          },
          encryptedExpiryDate: {
            selector: "#encryptedExpiryDate",
            value:
              payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
          },
        };

        await waitForTimeout(1000);
        await Promise.all(
          Object.values(fields).map(({ selector, value }) =>
            autofillSelector(selector, value, mode)
          )
        );
      }
    }
  }
})();
