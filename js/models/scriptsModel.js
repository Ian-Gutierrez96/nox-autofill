export let { scripts: state } =
  /** @type {{ scripts: Object<string, Script> }} */ (
    await chrome.storage.local.get("scripts")
  );

/**
 * @typedef {Object} ScriptsEventMap
 * @property {CustomEvent} stateChange
 */

/**
 * Attach listeners for events dispatched from the scripts.
 * @type {EventEmitter<ScriptsEventMap>}
 */
export const events = new EventTarget();

/**
 * Disables all the scripts for the purpose of restricting the access to
 * autofill or autocheckout functionalities.
 */
export async function disableAllScripts() {
  // Make an array of all the settings that will be disabled
  const settingKeys = ["autofillEnabled", "autocheckoutEnabled", "enabled"];

  // Loop through each script and disable each setting if it exists
  Object.values(state).forEach((script) => {
    settingKeys.forEach((settingKey) => {
      if (Object.hasOwn(script, settingKey)) {
        script[settingKey] = false;
      }
    });
  });

  // Update Chrome's local storage
  await chrome.storage.local.set({ scripts: state });
}

/**
 * Edit a script's setting and update Chrome's local storage.
 * @param {string} scriptKey - NOX script's key.
 * @param {string} settingKey - Script setting's key.
 * @param {*} value - Script setting's value.
 */
export async function setScriptSetting(scriptKey, settingKey, value) {
  // Ensure a script and setting are mapped to the keys
  if (!Object.hasOwn(state, scriptKey)) {
    throw new Error(`Script with key ${scriptKey} does not exist.`);
  } else if (!Object.hasOwn(state[scriptKey], settingKey)) {
    throw new Error(
      `Setting with key ${settingKey} does not exist on ${scriptKey}.`
    );
  }

  // Update the script's setting and update Chrome's local storage
  state[scriptKey][settingKey] = value;
  await chrome.storage.local.set({ scripts: state });
}

/**
 * Updates the state if changes occurred on the storage's scripts property.
 * @param {Object<string, chrome.storage.StorageChange>} changes - Changes when
 * one or more items change.
 * @param {keyof Pick<typeof chrome.storage, 'sync' | 'local' | 'managed' |
 * 'session'>} areaName - Storage area where changes were made.
 */
function onChangedListener(changes, areaName) {
  if (areaName === "local" && Object.hasOwn(changes, "scripts")) {
    state = changes.scripts.newValue;
    events.dispatchEvent(new CustomEvent("stateChange"));
  }
}

chrome.storage.onChanged.addListener(onChangedListener);
