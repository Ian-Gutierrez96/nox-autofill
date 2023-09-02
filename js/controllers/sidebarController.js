import * as licenseModel from "../models/licenseModel.js";
import * as proxyModel from "../models/proxyModel.js";
import * as scriptsModel from "../models/scriptsModel.js";
import * as sidebarView from "../views/sidebarView.js";

/**
 * Resets the license's hardware ID and navigates to the authentication page. An
 * unsuccessful fetch call will result in an error message being displayed.
 */
async function controlLogout() {
  try {
    // Throw an internet connection error message if Wi-Fi is disconnected
    if (!navigator.onLine) {
      throw new Error("No internet connection is detected.");
    }

    // Reset the license's hardware ID through Hyper's API and delete it locally
    await licenseModel.updateLicenseMetadata(licenseModel.state.key, null);
    await licenseModel.setLicense(null);

    // Disable all the scripts and disconnect the proxy if active
    await scriptsModel.disableAllScripts();
    await proxyModel.disconnectProxy();

    // Navigate to the authentication page
    window.location.assign("./authentication.html");
  } catch (error) {
    sidebarView.createLogoutError(error.message);
  }
}

sidebarView.events.addEventListener("logout", controlLogout);
