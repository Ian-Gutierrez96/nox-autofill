"use strict";

(async () => {
  if (self !== top) {
    const {
      profiles,
      scripts: { walmart },
      settings: { blacklistedSites },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.ancestorOrigins[0]) &&
      Object.hasOwn(profiles, walmart.profileKey)
    ) {
      switch (location.pathname) {
        case "/account/login":
          login(walmart);
          break;
      }
    }
  }
})();

async function login(script) {
  const { autocheckoutEnabled } = script;

  if (autocheckoutEnabled) {
    const continueAsGuest = await waitForSelector(
      "#sign-in-form .gxo-continue-btn"
    );
    continueAsGuest.click();
  }
}
