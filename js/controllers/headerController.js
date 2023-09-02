import * as licenseModel from "../models/licenseModel.js";
import * as headerView from "../views/headerView.js";

controlUserInformation();

/**
 * Update the user's license information if it exists.
 */
function controlUserInformation() {
  if (licenseModel.state) {
    headerView.renderUserInformation(
      licenseModel.state.user.avatar,
      licenseModel.state.user.username,
      licenseModel.state.plan.name
    );
  }
}

licenseModel.events.addEventListener("stateChange", controlUserInformation);
