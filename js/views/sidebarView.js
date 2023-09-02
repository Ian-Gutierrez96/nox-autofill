import createToast from "../utils/createToast.js";

const sidebarLinkElements = /** @type {HTMLCollectionOf<HTMLAnchorElement>} */ (
  document.getElementsByClassName("sidebar__link")
);
const logoutUserButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("logout-user")
);

/**
 * Map of CustomEvents and their corresponding types
 * @typedef {Object} SidebarViewEventMap
 * @property {CustomEvent} logout
 */

/**
 * Dispatch events and attach listeners for them.
 * @type {EventEmitter<SidebarViewEventMap>}
 */
export const events = new EventTarget();

updateCurrentSidebarLink();

/**
 * Enables the logout button and creates a toast notification indicating a
 * logout error has occurred.
 * @param {string} message - Toast notification's error message.
 */
export function createLogoutError(message = "") {
  logoutUserButton.disabled = false;
  createToast("danger", "Logout Error", message);
}

/**
 * Iterate through each sidebar link and set the aria-current attribute's value
 * to "page" if the anchor's hash matches the URL's hash. Will otherwise remove
 * the attribute.
 */
function updateCurrentSidebarLink() {
  for (const sidebarLinkElement of sidebarLinkElements) {
    if (sidebarLinkElement.hash === location.hash) {
      sidebarLinkElement.setAttribute("aria-current", "page");
    } else {
      sidebarLinkElement.removeAttribute("aria-current");
    }
  }
}

/**
 * Disable the logout user button and reset the user's license.
 */
function logoutUser() {
  logoutUserButton.disabled = true;
  events.dispatchEvent(new CustomEvent("logout"));
}

window.addEventListener("hashchange", updateCurrentSidebarLink);
logoutUserButton.addEventListener("click", logoutUser);
