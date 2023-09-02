"use strict";

(async () => {
  const {
    scripts: { paypalPayNow },
    settings: { blacklistedSites },
  } = await chrome.storage.local.get(["scripts", "settings"]);

  if (!blacklistedSites.includes(location.origin) && paypalPayNow.enabled) {
    const paymentSubmitButton = await waitForSelector("#payment-submit-btn");
    paymentSubmitButton.click();
  }
})();
