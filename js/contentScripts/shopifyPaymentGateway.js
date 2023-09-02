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
      const { autocheckoutEnabled, autofillEnabled, mode, profileKey } =
        Object.values(scripts).find(
          (script) => script.origin === parentOrigin
        ) ?? scripts.shopify;

      if (Object.hasOwn(profiles, profileKey)) {
        const { payment } = profiles[profileKey];
        const fields = [
          {
            options: { polling: { visible: true }, type: { keys: true } },
            selector: "input#number:not([data-honeypot-field])",
            value: payment.ccNumber,
          },
          {
            options: { polling: { visible: true }, type: { keys: true } },
            selector: "input#name:not([data-honeypot-field])",
            value: payment.ccGivenName + " " + payment.ccFamilyName,
          },
          {
            options: { polling: { visible: true }, type: { keys: true } },
            selector: "input#expiry:not([data-honeypot-field])",
            value:
              payment.ccExpMonth.padStart(2, "0") + " / " + payment.ccExpYear,
          },
          {
            options: { polling: { visible: true }, type: { keys: true } },
            selector: "input#verification_value:not([data-honeypot-field])",
            value: payment.ccCSC,
          },
        ];

        await waitForTimeout(1500);

        if (autocheckoutEnabled) {
          await Promise.race(
            fields.map(({ options, selector, value }) =>
              autofillSelector(selector, value, mode, options)
            )
          );

          window.parent.postMessage({ command: "complete_payment" }, "*");
        } else if (autofillEnabled) {
          await Promise.all(
            fields.map(({ options, selector, value }) =>
              autofillSelector(selector, value, mode, options)
            )
          );
        }
      }
    }
  }
})();
