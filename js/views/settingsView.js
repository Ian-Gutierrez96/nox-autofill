import createToast from "../utils/createToast.js";

const licenseAvatarImage = /** @type {HTMLImageElement} */ (
  document.getElementById("license-avatar")
);
const licenseUsernameElement = /** @type {HTMLElement} */ (
  document.getElementById("license-username")
);
const licenseExpirationTime = /** @type {HTMLTimeElement} */ (
  document.getElementById("license-expiration")
);
const blacklistedSitesUploaderInput = /** @type {HTMLInputElement} */ (
  document.getElementById("blacklisted-sites-uploader")
);
const blacklistedSitesDownloaderAnchor = /** @type {HTMLAnchorElement} */ (
  document.getElementById("blacklisted-sites-downloader")
);
const blacklistedSitesRemoverButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("blacklisted-sites-remover")
);
const blacklistedSiteAdder = /** @type {HTMLFormElement} */ (
  document.getElementById("blacklisted-site-adder")
);
const blacklistedSitesListDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("blacklisted-sites-list")
);
const blacklistedSiteElements = /** @type {HTMLCollectionOf<HTMLElement>} */ (
  document.getElementsByClassName("blacklisted-site")
);
const settingsEditorForm = /** @type {HTMLFormElement} */ (
  document.getElementById("settings-editor")
);

const urlValidatorInput = document.createElement("input");
const blacklistedURLsFileReader = new FileReader();

/**
 * Settings view's map of event types and their corresponding custom events.
 * @typedef {Object} SettingsViewEventMap
 * @property {CustomEvent<{ url: URL }>} blacklistedSiteAdd
 * @property {CustomEvent<{ url: URL }>} blacklistedSiteRemove
 * @property {CustomEvent<{ key: string, value: any }>} settingChange
 */

export const events = /** @type {EventEmitter<SettingsViewEventMap>} */ (
  new EventTarget()
);

urlValidatorInput.type = "url";

/**
 * Render details of the Hyper license on the status card.
 * @param {string} avatarURL - URL of the user's Discord avatar.
 * @param {string} username - User's Discord username.
 * @param {string} expirationDate - Expiration date of the user's license.
 */
export function renderLicenseInformation(avatarURL, username, expirationDate) {
  licenseAvatarImage.src = avatarURL;
  licenseUsernameElement.textContent = username;
  licenseExpirationTime.textContent = expirationDate;
}

/**
 * Set the href of the anchor used for downloading all the blocked sites.
 * @param {string} objectURL - Object URL used to reference the contents of the
 * blacklisted sites array.
 */
export function setDownloadBlacklistedSitesHref(objectURL) {
  blacklistedSitesDownloaderAnchor.href = objectURL;
}

/**
 * Render each blacklisted site in sequential order onto the list.
 * @param {string[]} blacklistedSites - Array of blacklisted sites.
 */
export function appendBlacklistedSitesToList(blacklistedSites) {
  blacklistedSitesListDiv.replaceChildren(
    ...blacklistedSites.map((blockedSite) => {
      const blacklistedSiteElement = document.createElement("article");
      blacklistedSiteElement.classList.add("blacklisted-site");
      blacklistedSiteElement.dataset.url = blockedSite;

      const informationHeading = document.createElement("h3");
      informationHeading.classList.add("blacklisted-site__information");
      blacklistedSiteElement.append(informationHeading);

      const globeIconSVG = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      globeIconSVG.classList.add("blacklisted-site__icon");
      globeIconSVG.setAttribute("fill", "currentColor");
      globeIconSVG.setAttribute("height", "24");
      globeIconSVG.setAttribute("viewBox", "0 0 48 48");
      globeIconSVG.setAttribute("width", "24");
      informationHeading.appendChild(globeIconSVG);

      const globeIconPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      globeIconPath.setAttribute(
        "d",
        "M24 44q-4.2 0-7.85-1.575Q12.5 40.85 9.8 38.15q-2.7-2.7-4.25-6.375Q4 28.1 4 23.9t1.55-7.825Q7.1 12.45 9.8 9.75t6.35-4.225Q19.8 4 24 4q4.2 0 7.85 1.525Q35.5 7.05 38.2 9.75q2.7 2.7 4.25 6.325Q44 19.7 44 23.9t-1.55 7.875Q40.9 35.45 38.2 38.15t-6.35 4.275Q28.2 44 24 44Zm0-2.9q1.75-1.8 2.925-4.125Q28.1 34.65 28.85 31.45H19.2q.7 3 1.875 5.4Q22.25 39.25 24 41.1Zm-4.25-.6q-1.25-1.9-2.15-4.1-.9-2.2-1.5-4.95H8.6Q10.5 35 13 37.025q2.5 2.025 6.75 3.475Zm8.55-.05q3.6-1.15 6.475-3.45 2.875-2.3 4.625-5.55h-7.45q-.65 2.7-1.525 4.9-.875 2.2-2.125 4.1Zm-20.7-12h7.95q-.15-1.35-.175-2.425-.025-1.075-.025-2.125 0-1.25.05-2.225.05-.975.2-2.175h-8q-.35 1.2-.475 2.15T7 23.9q0 1.3.125 2.325.125 1.025.475 2.225Zm11.05 0H29.4q.2-1.55.25-2.525.05-.975.05-2.025 0-1-.05-1.925T29.4 19.5H18.65q-.2 1.55-.25 2.475-.05.925-.05 1.925 0 1.05.05 2.025.05.975.25 2.525Zm13.75 0h8q.35-1.2.475-2.225Q41 25.2 41 23.9q0-1.3-.125-2.25T40.4 19.5h-7.95q.15 1.75.2 2.675.05.925.05 1.725 0 1.1-.075 2.075-.075.975-.225 2.475Zm-.5-11.95h7.5q-1.65-3.45-4.525-5.75Q32 8.45 28.25 7.5q1.25 1.85 2.125 4t1.525 5Zm-12.7 0h9.7q-.55-2.65-1.85-5.125T24 7q-1.6 1.35-2.7 3.55-1.1 2.2-2.1 5.95Zm-10.6 0h7.55q.55-2.7 1.4-4.825.85-2.125 2.15-4.125-3.75.95-6.55 3.2T8.6 16.5Z"
      );
      globeIconSVG.appendChild(globeIconPath);

      const originText = document.createTextNode(blockedSite);
      informationHeading.appendChild(originText);

      const toolbarUList = document.createElement("ul");
      toolbarUList.classList.add("toolbar");
      blacklistedSiteElement.appendChild(toolbarUList);

      const removeButtonLI = document.createElement("li");
      toolbarUList.appendChild(removeButtonLI);

      const removeBlacklistedSiteButton = document.createElement("button");
      removeBlacklistedSiteButton.classList.add("toolbar__button");
      removeBlacklistedSiteButton.title = "Remove blacklisted site";
      removeButtonLI.appendChild(removeBlacklistedSiteButton);

      removeBlacklistedSiteButton.addEventListener("click", () => {
        events.dispatchEvent(
          new CustomEvent("blacklistedSiteRemove", {
            detail: { url: new URL(blockedSite) },
          })
        );
      });

      const removeIconSVG = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      removeIconSVG.setAttribute("fill", "currentColor");
      removeIconSVG.setAttribute("height", "24");
      removeIconSVG.setAttribute("viewBox", "0 0 48 48");
      removeIconSVG.setAttribute("width", "24");
      removeBlacklistedSiteButton.appendChild(removeIconSVG);

      const removeIconPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      removeIconPath.setAttribute(
        "d",
        "M15 39H33Q33 39 33 39Q33 39 33 39V15H15V39Q15 39 15 39Q15 39 15 39ZM10.5 11V8H17.2L19.2 6H28.8L30.8 8H37.5V11ZM15 42Q13.8 42 12.9 41.1Q12 40.2 12 39V12H36V39Q36 40.2 35.1 41.1Q34.2 42 33 42ZM15 39H33Q33 39 33 39Q33 39 33 39H15Q15 39 15 39Q15 39 15 39Z"
      );
      removeIconSVG.appendChild(removeIconPath);

      return blacklistedSiteElement;
    })
  );
}

/**
 * Update the form controls used for editing the settings.
 * @param {Object<string, boolean>} settings - Map of the setting keys and their
 * corresponding value.
 */
export function updateSettings(settings) {
  Object.entries(settings).forEach(([key, value]) => {
    const formControl = settingsEditorForm.elements.namedItem(key);
    if (formControl instanceof HTMLInputElement) formControl.checked = value;
  });
}

/**
 * Iterate through every line in a text file and upload a blacklisted site if it
 * is a valid URL.
 * @param {ProgressEvent<FileReader>} event - ProgressEvent fired when the
 * FileReader begins reading a new file.
 */
function uploadBlacklistedSites(event) {
  const blacklistedSites = event.target.result
    .toString()
    .split(/\n/)
    .map((line) => line.trim());

  for (let index = 0; index < blacklistedSites.length; index++) {
    urlValidatorInput.value = blacklistedSites[index];

    if (!urlValidatorInput.checkValidity()) {
      return createToast(
        "danger",
        "Invalid Blacklisted Site Format",
        `The blacklisted site at line ${index} does not match the specified format.`
      );
    }
  }

  blacklistedSites.forEach((blacklistedSite) => {
    events.dispatchEvent(
      new CustomEvent("blacklistedSiteAdd", {
        detail: { url: new URL(blacklistedSite) },
      })
    );
  });

  createToast(
    "success",
    "Blacklisted Sites Uploaded",
    "Successfully uploaded new blacklisted sites and kept existing ones."
  );
}

/**
 * Read each file passed into input used for uploading blacklisted sites.
 */
function readUploadedBlacklistedSites() {
  for (const file of blacklistedSitesUploaderInput.files) {
    blacklistedURLsFileReader.readAsText(file);
  }

  blacklistedSitesUploaderInput.value = null;
}

/**
 * Iterate through each blacklisted site element in the list and remove it.
 */
function removeAllBlacklistedSites() {
  for (const blacklistedSiteElement of blacklistedSiteElements) {
    events.dispatchEvent(
      new CustomEvent("blacklistedSiteRemove", {
        detail: { url: new URL(blacklistedSiteElement.dataset.url) },
      })
    );
  }
}

/**
 * Add a site to the blacklist.
 * @param {SubmitEvent} event - SubmitEvent dispatched by a form used for adding
 * a site onto the blacklist.
 */
function addBlacklistedSite(event) {
  if (event.currentTarget instanceof HTMLFormElement) {
    const formData = new FormData(event.currentTarget);

    events.dispatchEvent(
      new CustomEvent("blacklistedSiteAdd", {
        detail: {
          url: new URL(formData.get("url").toString()),
        },
      })
    );

    event.preventDefault();
    event.currentTarget.reset();
  }
}

/**
 * Modify a NOX setting with a value dependent on the input element's value.
 * @param {Event} event - Event dispatched by a settings-editor form control
 * being changed.
 */
function changeSetting(event) {
  if (event.target instanceof HTMLInputElement) {
    events.dispatchEvent(
      new CustomEvent("settingChange", {
        detail: {
          key: event.target.name,
          value: event.target.checked,
        },
      })
    );
  }
}

blacklistedURLsFileReader.addEventListener("load", uploadBlacklistedSites);
blacklistedSitesUploaderInput.addEventListener(
  "input",
  readUploadedBlacklistedSites
);
blacklistedSitesRemoverButton.addEventListener(
  "click",
  removeAllBlacklistedSites
);
blacklistedSiteAdder.addEventListener("submit", addBlacklistedSite);
settingsEditorForm.addEventListener("change", changeSetting);
