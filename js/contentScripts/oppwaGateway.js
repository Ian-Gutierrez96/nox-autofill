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
          cardCvv: {
            selector: "input[name='card.cvv']",
            value: payment.ccCSC,
          },
          cardExpiry: {
            selector: "input[data-action='blur-card-expiry']",
            value:
              payment.ccExpMonth.padStart(2, "0") + " / " + payment.ccExpYear,
          },
          cardHolder: {
            selector: "input[name='card.holder']",
            value: payment.ccGivenName + " " + payment.ccFamilyName,
          },
          cardNumber: {
            selector: "input[name='card.number']",
            value: payment.ccNumber,
          },
        };

        Object.values(fields).forEach(({ selector, value }) => {
          autofillSelector(selector, value, mode).then((element) => {
            waitForTimeout(500).then(() =>
              element.dispatchEvent(new Event("forcedBlur"))
            );
          });
        });
      }
    }
  }
})();
