export let { settings: state } = /** @type {{ settings: Settings }} */ (
  await chrome.storage.local.get("settings")
);

/**
 * @typedef {Object} SettingsEventMap
 * @property {CustomEvent<Settings>} stateChange
 */

/**
 * Attach listeners for CustomEvents dispatched from the settings.
 * @type {EventEmitter<SettingsEventMap>}
 */
export const events = new EventTarget();

/**
 * Blacklist a site's URL in order to prevent NOX scripts from running on the
 * page. Will not push duplicates or URLs with null origins.
 * @param {URL} url - Blacklisted site's URL.
 */
export async function addBlacklistedSite(url) {
  // Return if the origin is null or the origin is already blacklisted
  if (url.origin === "null") return;
  if (state.blacklistedSites.includes(url.origin)) return;

  // Push the origin to the blacklisted sites and update Chrome's local storage
  state.blacklistedSites.push(url.origin);
  await chrome.storage.local.set({ settings: state });
}

/**
 * Remove a site's URL from the blacklist, allowing NOX scripts to run on the
 * page.
 * @param {URL} url - Blacklisted site's URL.
 */
export async function removeBlacklistedSite(url) {
  // Return if the origin is null
  if (url.origin === "null") return;

  // Retrieve the index of the blacklisted site's URL and return if not present
  const index = state.blacklistedSites.indexOf(url.origin);
  if (index === -1) {
    throw new Error("Blacklisted site does not exist.");
  }

  // Remove the blacklisted site and update Chrome's local storage
  state.blacklistedSites.splice(index, 1);
  await chrome.storage.local.set({ settings: state });
}

/**
 * Alter a certain functionality of NOX, such as whether notifications are
 * displayed or dark mode is enabled.
 * @param {string} key - Setting's key.
 * @param {any} value - Setting's updated value.
 */
export async function setScriptSetting(key, value) {
  // Ensure a setting is mapped to the key
  if (!Object.hasOwn(state, key)) {
    throw new Error(`Script with key ${key} does not exist.`);
  }

  // Update the setting's value and update Chrome's local storage
  state[key] = value;
  await chrome.storage.local.set({ settings: state });
}

/**
 * Updates the state if changes occurred on the storage's settings property.
 * @param {Object<string, chrome.storage.StorageChange>} changes - Changes when
 * one or more items change.
 * @param {keyof Pick<typeof chrome.storage, 'sync' | 'local' | 'managed' |
 * 'session'>} areaName - Storage area where changes were made.
 */
function onChangedListener(changes, areaName) {
  if (areaName === "local" && Object.hasOwn(changes, "settings")) {
    state = changes.settings.newValue;
    events.dispatchEvent(new CustomEvent("stateChange"));
  }
}

chrome.storage.onChanged.addListener(onChangedListener);
