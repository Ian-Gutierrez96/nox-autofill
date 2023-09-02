export let { announcements: state } =
  /** @type {{ announcements: Announcement[] }} */ (
    await chrome.storage.local.get("announcements")
  );

/**
 * @typedef {Object} AnnouncementsEventMap
 * @property {CustomEvent} stateChange
 */

/**
 * Attach listeners for events dispatched from the announcements.
 * @type {EventEmitter<AnnouncementsEventMap>}
 */
export const events = new EventTarget();

/**
 * Updates the state if changes occurred on the storage's announcements
 * property.
 * @param {Object<string, chrome.storage.StorageChange>} changes - Changes when
 * one or more items change.
 * @param {keyof Pick<typeof chrome.storage, 'sync' | 'local' | 'managed' |
 * 'session'>} areaName - Storage area where changes were made.
 */
function onChangedListener(changes, areaName) {
  if (areaName === "local" && Object.hasOwn(changes, "announcements")) {
    state = changes.announcements.newValue;
    events.dispatchEvent(new CustomEvent("stateChange"));
  }
}

chrome.storage.onChanged.addListener(onChangedListener);
