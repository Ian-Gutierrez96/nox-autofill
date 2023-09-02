import * as licenseModel from "../models/licenseModel.js";
import * as authenticatorView from "../views/authenticatorView.js";

const regExp = /^([A-Z0-9]{4}-){3}[A-Z0-9]{4}$/;

/**
 * Validate and authenticate the user's license key, and update it on the user's
 * local machine.
 * @param {CustomEvent<{ key: string }>} event - Authentication event fired by
 * user submitting license key.
 */
async function controlAuthenticate(event) {
  try {
    // Check if the license key is correctly formatted and internet is on
    const licenseKey = event.detail.key;

    if (!regExp.test(licenseKey)) {
      throw new Error("Invalid license key format.");
    } else if (!navigator.onLine) {
      throw new Error("No internet connection is detected.");
    }

    // Check if license is invalid or already bound to another hardware ID
    const license = await licenseModel.retrieveLicense(licenseKey);

    if (!licenseModel.isValidStatus(license.status)) {
      throw new Error("License no longer valid.");
    } else if (license.metadata.hwid) {
      throw new Error("License already in use on another machine.");
    }

    // Update the hardware ID on the user's license and store it locally
    const hardwareID = crypto.randomUUID();

    await licenseModel.setLicense(
      await licenseModel.updateLicenseMetadata(licenseKey, hardwareID)
    );

    // Open up the dashboard
    window.location.assign("./dashboard.html#home");
  } catch (error) {
    authenticatorView.setLicenseKeyValidity(error.message);
  }
}

authenticatorView.events.addEventListener("authenticate", controlAuthenticate);
