import * as licenseModel from "../models/licenseModel.js";
import * as proxyModel from "../models/proxyModel.js";
import * as scriptsModel from "../models/scriptsModel.js";
import * as settingsModel from "../models/settingsModel.js";
import * as mainView from "../views/mainView.js";

controlDarkMode();
controlAuthenticateLicense();

/**
 * Toggle between light and dark mode depending on the user's stored preference.
 */
function controlDarkMode() {
  mainView.toggleDarkMode(settingsModel.state.darkMode);
}

/**
 * Retrieves the current license stored at Hyper and updates the one stored
 * locally. If the current license is still valid, then all form elements in the
 * dashboard will be enabled; otherwise, the license will be reset and redirect
 * the user back to the authentication page. If the fetch call was unable to be
 * performed then an authentication error message will be displayed.
 */
async function controlAuthenticateLicense() {
  try {
    // Display a network error message if there is no internet connection
    if (!navigator.onLine) {
      return mainView.createAuthenticationError(
        "No internet connection is detected. Please refresh the extension."
      );
    }

    // Check if a license is stored prior to updating it
    if (!licenseModel.state) {
      throw new Error("No license is currently saved.");
    }

    // Retrieve the updated license and reset it if it's no longer valid
    const license = await licenseModel.retrieveLicense(licenseModel.state.key);

    if (!licenseModel.isValidStatus(license.status)) {
      await licenseModel.updateLicenseMetadata(license.key, null);
      throw new Error("License no longer valid.");
    }

    // Enable all form elements in the dashboard
    await licenseModel.setLicense(license);
    mainView.toggleFormElements(true);
  } catch (error) {
    // Remove the license from Chrome's local storage
    await licenseModel.setLicense(null);

    // Disable all the scripts and disconnect the proxy if active
    await scriptsModel.disableAllScripts();
    await proxyModel.disconnectProxy();

    // Navigate to the authentication page
    window.location.assign("./authentication.html");
  }
}

settingsModel.events.addEventListener("stateChange", controlDarkMode);
matchMedia("(prefers-color-scheme: light)").addEventListener(
  "change",
  controlDarkMode
);
