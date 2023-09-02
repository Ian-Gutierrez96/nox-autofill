export let { profiles: state } =
  /** @type {{ profiles: Object<string, Profile> }} */ (
    await chrome.storage.local.get("profiles")
  );

/**
 * @typedef {Object} ProfilesEventMap
 * @property {CustomEvent} stateChange
 */

/**
 * Attach listeners for events dispatched from the profiles.
 * @type {EventEmitter<ProfilesEventMap>}
 */
export const events = new EventTarget();

/**
 * Create or edit an existing profile and update Chrome's local storage.
 * @param {string} key - Profile's key.
 * @param {Profile} value - New or updated profile.
 */
export async function setProfile(key, value) {
  state[key] = value;
  await chrome.storage.local.set({ profiles: state });
}

/**
 * Delete a profile and erase it from Chrome's local storage.
 * @param {string} key - Profile's key.
 */
export async function deleteProfile(key) {
  // Ensure a profile is mapped to the key
  if (!Object.hasOwn(state, key)) {
    throw new Error(`Profile with key ${key} does not exist.`);
  }

  // Delete the profile and update Chrome's local storage
  delete state[key];
  await chrome.storage.local.set({ profiles: state });
}

/**
 * Updates the state if changes occurred on the storage's profiles property.
 * @param {Object<string, chrome.storage.StorageChange>} changes - Changes when
 * one or more items change.
 * @param {keyof Pick<typeof chrome.storage, 'sync' | 'local' | 'managed' |
 * 'session'>} areaName - Storage area where changes were made.
 */
function onChangedListener(changes, areaName) {
  if (areaName === "local" && Object.hasOwn(changes, "profiles")) {
    state = changes.profiles.newValue;
    events.dispatchEvent(new CustomEvent("stateChange"));
  }
}

chrome.storage.onChanged.addListener(onChangedListener);
