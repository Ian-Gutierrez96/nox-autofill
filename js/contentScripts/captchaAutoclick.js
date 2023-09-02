"use strict";

(async () => {
  const {
    scripts: { captchaAutoclick },
    settings: { blacklistedSites },
  } = await chrome.storage.local.get(["scripts", "settings"]);

  if (!blacklistedSites.includes(location.origin) && captchaAutoclick.enabled) {
    await waitForTimeout(500);
    const captcha = await waitForSelector(".recaptcha-checkbox-checkmark");
    captcha.click();
  }
})();
