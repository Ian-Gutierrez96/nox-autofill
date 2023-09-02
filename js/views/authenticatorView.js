const authenticatorForm = /** @type {HTMLFormElement} */ (
  document.getElementById("authenticator")
);
const licenseKeyInput = /** @type {HTMLInputElement} */ (
  document.getElementById("license-key")
);
const licenseKeyErrorDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("license-key-error")
);

/**
 * @typedef {object} AuthenticatorViewEventMap
 * @property {CustomEvent<{ key: string }>} authenticate
 */

/**
 * Receive events and attach listeners for them.
 * @type {EventEmitter<AuthenticatorViewEventMap>}
 */
export const events = new EventTarget();

/**
 * Set a custom validity message for the license key input and display it unto
 * the error helper.
 * @param {string} [message] - The message to use for validity errors.
 */
export function setLicenseKeyValidity(message = "") {
  licenseKeyInput.setCustomValidity(message);
  licenseKeyErrorDiv.textContent = licenseKeyInput.validationMessage;
  licenseKeyErrorDiv.hidden = licenseKeyInput.checkValidity();
}

/**
 * Authenticate the user's license.
 * @param {SubmitEvent} event - Submit event fired by authenticator form being
 * submitted.
 */
function authenticateLicense(event) {
  event.preventDefault();

  events.dispatchEvent(
    new CustomEvent("authenticate", { detail: { key: licenseKeyInput.value } })
  );
}

/**
 * Format the license key input's value according to the structure of a Hyper
 * license key.
 */
function formatLicenseKey() {
  // Reset the license key input and error message if it's invalid
  if (!licenseKeyInput.validity.valid) setLicenseKeyValidity();

  // Retrieve the license key and format its input value to the input mask
  const licenseKey = licenseKeyInput.value.toUpperCase();
  const licenseKeyMask = licenseKeyInput.dataset.mask;
  let formattedLicenseKey = "";

  for (
    let maskIndex = 0, keyIndex = 0;
    maskIndex < licenseKeyMask.length;
    maskIndex++, keyIndex++
  ) {
    const maskCharacter = licenseKeyMask.charAt(maskIndex);
    const keyCharacter = licenseKey.charAt(keyIndex);

    switch (maskCharacter) {
      case "*":
        if (/[A-Z0-9]/.test(keyCharacter)) formattedLicenseKey += keyCharacter;
        else if (keyCharacter) maskIndex--;
        break;

      default:
        if (keyCharacter) {
          formattedLicenseKey += maskCharacter;
          keyIndex--;
        }
        break;
    }
  }

  // Update the license key's input value
  licenseKeyInput.value = formattedLicenseKey;
}

authenticatorForm.addEventListener("submit", authenticateLicense);
licenseKeyInput.addEventListener("input", formatLicenseKey);
