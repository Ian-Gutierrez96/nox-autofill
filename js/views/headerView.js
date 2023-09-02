const userAvatarImage = /** @type {HTMLImageElement} */ (
  document.getElementById("user-avatar")
);
const dashboardTitleHeading = /** @type {HTMLHeadingElement} */ (
  document.getElementById("dashboard-title")
);
const userNameSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("user-name")
);
const userPlanElement = document.getElementById("user-plan");

setTitleToCurrentHash();

/**
 * Render the user's license details on the information figure.
 * @param {string} avatarURL - URL of the user's Discord avatar.
 * @param {string} username - User's Discord username.
 * @param {string} plan - Name of the user's NOX plan.
 */
export function renderUserInformation(avatarURL, username, plan) {
  userAvatarImage.src = avatarURL;
  userNameSpan.textContent = username;
  userPlanElement.textContent = plan;
}

/**
 * Sets the dashboard's title in the header to the current URL's hash.
 */
function setTitleToCurrentHash() {
  dashboardTitleHeading.textContent = location.hash.slice(1);
}

window.addEventListener("hashchange", setTitleToCurrentHash);
