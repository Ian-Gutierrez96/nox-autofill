"use strict";

(async () => {
  const {
    scripts: { discordOAuthClicker },
    settings: { blacklistedSites },
  } = await chrome.storage.local.get(["scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    discordOAuthClicker.enabled
  ) {
    const authorizeButton = await waitForXPath(
      ".//div[text()[contains(., 'Authorize')]]/ancestor::button"
    );
    authorizeButton.click();
  }
})();
