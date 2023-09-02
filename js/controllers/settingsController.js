import * as licenseModel from "../models/licenseModel.js";
import * as settingsModel from "../models/settingsModel.js";
import * as settingsView from "../views/settingsView.js";

controlLicenseInformation();
controlDownloadBlacklistedSitesHref();
controlBlacklistedSitesToList();
controlSettings();

/**
 * Render details of the Hyper license stored in Chrome's local storage or
 * display placeholder information.
 */
function controlLicenseInformation() {
  if (licenseModel.state) {
    settingsView.renderLicenseInformation(
      licenseModel.state.user.avatar,
      licenseModel.state.user.username,
      licenseModel.state.cancel_at ?? "in a lifetime"
    );
  }
}

/**
 * Create a blob by joining every blacklisted site's URL with a newline
 * separator. The blacklisted sites downloader's href will be set to the
 * location of the blob in plaintext.
 */
function controlDownloadBlacklistedSitesHref() {
  settingsView.setDownloadBlacklistedSitesHref(
    URL.createObjectURL(
      new Blob([settingsModel.state.blacklistedSites.join("\n")], {
        type: "text/plain",
      })
    )
  );
}

/**
 * Append each blacklisted site onto the list.
 */
function controlBlacklistedSitesToList() {
  settingsView.appendBlacklistedSitesToList(
    settingsModel.state.blacklistedSites
  );
}

/**
 * Update each setting's controls to match the current values stored in the
 * state.
 */
function controlSettings() {
  settingsView.updateSettings({
    darkMode: settingsModel.state.darkMode,
    notifications: settingsModel.state.notifications,
  });
}

/**
 * Add a site to the blacklist.
 * @param {CustomEvent<{ url: URL }>} event - CustomEvent dispatched by a
 * blacklisted site being added.
 */
async function controlBlacklistedSiteAdd(event) {
  await settingsModel.addBlacklistedSite(event.detail.url);
}

/**
 * Remove a site from the blacklist.
 * @param {CustomEvent<{ url: URL }>} event - CustomEvent dispatched by a
 * blacklisted site being removed.
 */
async function controlBlacklistedSiteRemove(event) {
  await settingsModel.removeBlacklistedSite(event.detail.url);
}

/**
 * Change a setting's value.
 * @param {CustomEvent<{ key: string, value: any }>} event - CustomEvent
 * dispatched by a setting being changed.
 */
async function controlSettingChange(event) {
  await settingsModel.setScriptSetting(event.detail.key, event.detail.value);
}

licenseModel.events.addEventListener("stateChange", controlLicenseInformation);
settingsModel.events.addEventListener(
  "stateChange",
  controlDownloadBlacklistedSitesHref
);
settingsModel.events.addEventListener(
  "stateChange",
  controlBlacklistedSitesToList
);
settingsModel.events.addEventListener("stateChange", controlSettings);
settingsView.events.addEventListener(
  "blacklistedSiteAdd",
  controlBlacklistedSiteAdd
);
settingsView.events.addEventListener(
  "blacklistedSiteRemove",
  controlBlacklistedSiteRemove
);
settingsView.events.addEventListener("settingChange", controlSettingChange);
