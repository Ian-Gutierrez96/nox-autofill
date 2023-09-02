import { API_KEY } from "../config.js";

export let { license: state } = /** @type {{ license: License }} */ (
  await chrome.storage.local.get("license")
);

/**
 * @typedef {Object} LicenseEventMap
 * @property {CustomEvent} stateChange
 */

/**
 * Attach listeners for events dispatched from the license.
 * @type {EventEmitter<LicenseEventMap>}
 */
export const events = new EventTarget();

/**
 * Since Hyper is now inactive, all API requests return a placeholder object.
 * Feel free to edit this license to your own discretion.
 */
const placeholderLicense = {
  cancel_at: null,
  key: "9BUT-NFXD-I2WI-R3OO",
  metadata: { hwid: null },
  plan: {
    name: "Renewal",
  },
  status: "active",
  user: {
    avatar: chrome.runtime.getURL("images/default-avatar.svg"),
    username: "Default User",
  },
};

/**
 * Sets the license stored in Chrome's local storage.
 * @param {?License} license - The license.
 */
export async function setLicense(license) {
  state = license;
  await chrome.storage.local.set({ license: state });
}

/**
 * Determines if a license is valid depending on its status property.
 * @param {string} status - String indicating the license's status.
 * @returns {boolean} Whether the license status is valid.
 */
export function isValidStatus(status) {
  return ["active", "trialing", "past_due"].includes(status);
}

/**
 * Fetch the user's license to grant them access to the software.
 * @param {string} licenseKey - Key of the license you wish to fetch.
 * @returns {Promise<License>} Hyper license.
 */
export async function retrieveLicense(licenseKey) {
  return placeholderLicense;

  // Retrieve the license from the Hyper API
  const response = await fetch(
    `https://api.hyper.co/v6/licenses/${licenseKey}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
    }
  );

  // Check if response is successful and return JSON
  switch (response.status) {
    case 200:
      return response.json();
    case 401:
      throw new Error("The API key is invalid.");
    case 404:
      throw new Error("The license does not exist.");
    default:
      throw new Error("An unsuccessful network request was encountered.");
  }
}

/**
 * Use the update license endpoint to add metadata like hwid to an instance of
 * the License. This can help you track things like user preferences and the
 * device a user is using your software from.
 * @param {string} licenseKey - Key of the license you wish to update.
 * @param {?string} hardwareID - Store hwid, hardwareName, etc.
 * @returns {Promise<License>} Hyper license.
 */
export async function updateLicenseMetadata(licenseKey, hardwareID) {
  return placeholderLicense;

  // Update the license from the Hyper API
  const response = await fetch(
    `https://api.hyper.co/v6/licenses/${licenseKey}/metadata`,
    {
      method: "PATCH",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        metadata: { hwid: hardwareID },
      }),
    }
  );

  // Check if response is successful and return JSON
  switch (response.status) {
    case 200:
      return response.json();
    case 401:
      throw new Error("The API key is invalid.");
    case 404:
      throw new Error("The license does not exist.");
    default:
      throw new Error("An unsuccessful network request was encountered.");
  }
}

/**
 * Updates the state if changes occurred on the storage's license property.
 * @param {Object<string, chrome.storage.StorageChange>} changes - Changes when
 * one or more items change.
 * @param {keyof Pick<typeof chrome.storage, 'sync' | 'local' | 'managed' |
 * 'session'>} areaName - Storage area where changes were made.
 */
function onChangedListener(changes, areaName) {
  if (areaName === "local" && Object.hasOwn(changes, "license")) {
    state = changes.license.newValue;
    events.dispatchEvent(new CustomEvent("stateChange"));
  }
}

chrome.storage.onChanged.addListener(onChangedListener);
