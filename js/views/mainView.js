import createToast from "../utils/createToast.js";

const routerViewElements = /** @type {HTMLCollectionOf<HTMLDivElement>} */ (
  document.getElementsByClassName("router__view")
);

setActiveRouterView();

/**
 * Toggle the body element's classList in order to enable the dark mode.
 * @param {boolean} isEnabled - Boolean indicating whether dark mode is enabled.
 */
export function toggleDarkMode(isEnabled) {
  if (window.matchMedia("(prefers-color-scheme: light)").matches) {
    document.body.classList.remove("dashboard--light-mode");
    document.body.classList.toggle("dashboard--dark-mode", isEnabled);
  } else {
    document.body.classList.remove("dashboard--dark-mode");
    document.body.classList.toggle("dashboard--light-mode", !isEnabled);
  }
}

/**
 * Toggles each form element in the dashboard to be enabled or disabled.
 * @param {boolean} isEnabled - Boolean indicating whether each form element
 * should be enabled.
 */
export function toggleFormElements(isEnabled) {
  document
    .querySelectorAll("button, input, fieldset, select")
    .forEach((element) => element.toggleAttribute("disabled", !isEnabled));
}

export function createAuthenticationError(message = "") {
  createToast("danger", "Authentication Error", message);
}

/**
 * Toggles each router view elements' active class modifier to whether the id
 * matches the URL's hash.
 */
function setActiveRouterView() {
  for (const routerViewElement of routerViewElements) {
    routerViewElement.classList.toggle(
      "router__view--active",
      routerViewElement.id === location.hash.slice(1)
    );
  }
}

window.addEventListener("hashchange", setActiveRouterView);
