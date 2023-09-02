export let { checkouts: state } = /** @type {{ checkouts: Checkout[] }} */ (
  await chrome.storage.local.get("checkouts")
);

/**
 * @typedef {Object} CheckoutsEventMap
 * @property {CustomEvent} stateChange
 */

/**
 * Attach listeners for events dispatched from the checkouts.
 * @type {EventEmitter<CheckoutsEventMap>}
 */
export const events = new EventTarget();

/**
 * Updates the state if changes occurred on the storage's checkouts property.
 * @param {Object<string, chrome.storage.StorageChange>} changes - Changes when
 * one or more items change.
 * @param {keyof Pick<typeof chrome.storage, 'sync' | 'local' | 'managed' |
 * 'session'>} areaName - Storage area where changes were made.
 */
function onChangedListener(changes, areaName) {
  if (areaName === "local" && Object.hasOwn(changes, "checkouts")) {
    state = changes.checkouts.newValue;
    events.dispatchEvent(new CustomEvent("stateChange"));
  }
}

chrome.storage.onChanged.addListener(onChangedListener);
