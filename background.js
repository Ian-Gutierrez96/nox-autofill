/**
 * Set the default storage data when the extension has been installed.
 * @param {chrome.runtime.InstalledDetails} details - Details of the event fired
 * when the extension is first installed, when the extension is updated to a new
 * version, and when Chrome is updated to a new version.
 */
async function initializeStorage(details) {
  if (details.reason === chrome.runtime.OnInstalledReason.INSTALL) {
    await chrome.storage.local.set({
      activeWindowId: null,
      announcements: [
        {
          lines: [
            "Congratulations on purchasing NOX, the bespoke autofill built to be the ultimate checkout companion.",
            "Begin by creating a new profile and enabling the neccessary scripts that tailor your needs.",
          ],
          theme: "primary",
          title: "Welcome to NOX",
        },
      ],
      checkouts: [],
      license: null,
      profiles: {},
      proxy: {
        activeKey: null,
        proxies: {},
      },
      scripts: {
        adidas: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.adidas.com",
          profileKey: null,
        },
        aioAutofill: {
          enabled: false,
          mode: "fast",
          profileKey: null,
        },
        amazon: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.amazon.com",
          profileKey: null,
        },
        bestBuy: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.bestbuy.com",
          profileKey: null,
        },
        captchaAutoclick: {
          enabled: false,
        },
        champsSports: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.champssports.com",
          profileKey: null,
        },
        crocs: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.crocs.com",
          profileKey: null,
        },
        dicksSportingGoods: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.dickssportinggoods.com",
          profileKey: null,
        },
        discordOAuthClicker: {
          enabled: false,
        },
        eastbay: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.eastbay.com",
          profileKey: null,
        },
        ebay: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.ebay.com",
          profileKey: null,
        },
        evga: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://secure.evga.com",
          profileKey: null,
        },
        finishline: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.finishline.com",
          profileKey: null,
        },
        footLocker: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.footlocker.com",
          profileKey: null,
        },
        gameStop: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.gamestop.com",
          profileKey: null,
        },
        hibbett: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.hibbett.com",
          profileKey: null,
        },
        jdSports: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.jdsports.com",
          profileKey: null,
        },
        kidsFootLocker: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.kidsfootlocker.com",
          profileKey: null,
        },
        lego: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.lego.com",
          profileKey: null,
        },
        lids: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.lids.com",
          profileKey: null,
        },
        linkMaker: {
          enabled: false,
        },
        newBalance: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.newbalance.com",
          profileKey: null,
        },
        nike: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.nike.com",
          profileKey: null,
        },
        nvidia: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://store.mellanox.com",
          profileKey: null,
        },
        offWhite: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.off---white.com",
          profileKey: null,
        },
        paypalPayNow: {
          enabled: false,
        },
        pokemonCenter: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.pokemoncenter.com",
          profileKey: null,
        },
        shopDisney: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.shopdisney.com",
          profileKey: null,
        },
        shopify: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          checkoutTokens: [],
          keywords: [],
          maxPrice: null,
          minPrice: null,
          mode: "fast",
          profileKey: null,
          size: null,
        },
        snipes: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.snipesusa.com",
          profileKey: null,
        },
        stripe: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          profileKey: null,
        },
        supreme: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          category: null,
          checkoutDelay: null,
          color: null,
          keywords: [],
          mode: "fast",
          monitorDelay: null,
          origin: "https://us.supreme.com",
          profileKey: null,
          quantity: 1,
          size: null,
        },
        target: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.target.com",
          profileKey: null,
        },
        walmart: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.walmart.com",
          profileKey: null,
        },
        yeezySupply: {
          autocheckoutEnabled: false,
          autofillEnabled: false,
          mode: "fast",
          origin: "https://www.yeezysupply.com",
          profileKey: null,
        },
      },
      settings: {
        blacklistedSites: [],
        darkMode: true,
        notifications: true,
      },
    });
  }
}

/**
 * Focus the popup window if it is currently open, otherwise open the
 * authentication page or dashboard depending if the user has a license stored
 * in the local storage.
 */
async function openNoxWindow() {
  const { activeWindowId, license } = await chrome.storage.local.get([
    "activeWindowId",
    "license",
  ]);
  const popupWindows = await chrome.windows.getAll({
    windowTypes: [chrome.windows.WindowType.POPUP],
  });

  if (popupWindows.some((window) => window.id === activeWindowId)) {
    await chrome.windows.update(activeWindowId, { focused: true });
  } else {
    const window = await chrome.windows.create({
      url: license ? "./dashboard.html#home" : "./authentication.html",
      type: chrome.windows.WindowType.POPUP,
      state: chrome.windows.WindowState.NORMAL,
    });

    await chrome.storage.local.set({ activeWindowId: window.id });
  }
}

/**
 * Set activeWindowId to null if the popup window has just been closed.
 * @param {number} windowId - ID of the removed window.
 */
async function closeNoxWindow(windowId) {
  const { activeWindowId } = await chrome.storage.local.get("activeWindowId");

  if (windowId === activeWindowId) {
    await chrome.storage.local.set({ activeWindowId: null });
  }
}

/**
 * Execute the command passed into the message's corresponding property.
 * @param {any} message - Message sent by content script.
 */
function executeMessageCommand(message) {
  switch (message.command) {
    case "display-notification":
      chrome.notifications.create({
        iconUrl: "./images/nox.png",
        message: message.notificationContent,
        silent: true,
        title: "NOX",
        type: chrome.notifications.TemplateType.BASIC,
      });
      break;
  }
}

/**
 * Sends a tab-update message on tabs that have completed updating.
 * @param {number} tabId
 * @param {chrome.tabs.TabChangeInfo} changeInfo
 */
async function sendTabUpdateEvent(tabId, changeInfo) {
  try {
    if (changeInfo.status === chrome.tabs.TabStatus.COMPLETE) {
      await chrome.tabs.sendMessage(tabId, { event: "tab-update" });
    }
  } catch (error) {
    console.log("");
  }
}

chrome.action.onClicked.addListener(openNoxWindow);
chrome.runtime.onInstalled.addListener(initializeStorage);
chrome.runtime.onMessage.addListener(executeMessageCommand);
chrome.windows.onRemoved.addListener(closeNoxWindow);
chrome.tabs.onUpdated.addListener(sendTabUpdateEvent);
