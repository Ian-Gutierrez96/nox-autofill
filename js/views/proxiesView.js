import createToast from "../utils/createToast.js";
import { createProxyDetails } from "../utils/helpers.js";

const activeProxyNameElement = /** @type {HTMLElement} */ (
  document.getElementById("active-proxy-name")
);
const activeProxyDetailsElement = /** @type {HTMLElement} */ (
  document.getElementById("active-proxy-details")
);
const proxyDisconnectorButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("proxy-disconnector")
);
const sessionRefresherButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("session-refresher")
);
const proxiesUploaderInput = /** @type {HTMLInputElement} */ (
  document.getElementById("proxies-uploader")
);
const proxiesDownloaderAnchor = /** @type {HTMLAnchorElement} */ (
  document.getElementById("proxies-downloader")
);
const proxiesDeleterButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("proxies-deleter")
);
const proxiesListDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("proxies-list")
);
const proxyElements = /** @type {HTMLCollectionOf<HTMLElement>} */ (
  document.getElementsByClassName("proxy")
);
const proxyAdderForm = /** @type {HTMLFormElement} */ (
  document.getElementById("proxy-adder")
);
const proxyModalDialog = /** @type {HTMLDialogElement} */ (
  document.getElementById("proxy-modal")
);
const proxyEditorForm = /** @type {HTMLFormElement} */ (
  document.getElementById("proxy-editor")
);
const editProxyKeyInput = /** @type {HTMLInputElement} */ (
  document.getElementById("edit-proxy-key")
);
const proxyModalCloserButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("proxy-modal-closer")
);

const proxyRegExp =
  /^(?<host>(?=.{1,253}\.?:)(?:(?!-|[^.]+_)[A-Za-z0-9-_]{1,63}(?<!-)(?:\.|\b)){2,}):(?<port>\d+)(?::(?<username>\S+):(?<password>\S+))?$/;
const proxiesFileReader = new FileReader();

/**
 * Proxies view's map of event types and their corresponding custom events.
 * @typedef {Object} ProxiesViewEventMap
 * @property {CustomEvent<{ key: string, value: Proxy }>} proxySet
 * @property {CustomEvent<{ key: string }>} proxyConnect
 * @property {CustomEvent<{ key: string }>} proxyDelete
 * @property {CustomEvent} proxyDisconnect
 * @property {CustomEvent} sessionRefresh
 */

/**
 * Dispatch events and attach listeners for them.
 * @type {EventEmitter<ProxiesViewEventMap>}
 */
export const events = new EventTarget();

/**
 * Display the active proxy's name and details such as host, port, username, and
 * password. Will otherwise display the default text if no active proxy is set.
 * @param {Proxy} [proxy] - Proxy to display as active in the status card.
 */
export function displayActiveProxyStatus(proxy = null) {
  activeProxyNameElement.textContent = proxy ? proxy.name : "No Proxy";
  activeProxyDetailsElement.textContent = proxy
    ? createProxyDetails(proxy.host, proxy.port, proxy.username, proxy.password)
    : "";
  proxyDisconnectorButton.disabled = proxy === null;
  sessionRefresherButton.disabled = proxy === null;
}

/**
 * Set the download proxies anchor's href.
 * @param {string} objectURL - Object URL used to reference the contents of the
 * proxies object.
 */
export function setDownloadProxiesHref(objectURL) {
  proxiesDownloaderAnchor.href = objectURL;
}

/**
 * Append the proxies onto the proxies list in sequential order.
 * @param {Object<string, Proxy>} proxies - Object of the user's proxies and
 * their corresponding keys.
 */
export function appendProxiesToList(proxies) {
  proxiesListDiv.replaceChildren(
    ...Object.entries(proxies).map(([proxyKey, proxy]) => {
      const proxyElement = document.createElement("article");
      proxyElement.classList.add("proxy");
      proxyElement.dataset.proxyKey = proxyKey;

      const informationDiv = document.createElement("div");
      informationDiv.classList.add("proxy__information");
      proxyElement.appendChild(informationDiv);

      const detailsDiv = document.createElement("div");
      detailsDiv.classList.add("proxy__details");
      informationDiv.appendChild(detailsDiv);

      const headingHeading = document.createElement("h3");
      headingHeading.classList.add("proxy__name");
      headingHeading.textContent = proxy.name;
      detailsDiv.appendChild(headingHeading);

      const proxyStringDiv = document.createElement("div");
      proxyStringDiv.textContent = createProxyDetails(
        proxy.host,
        proxy.port,
        proxy.username,
        proxy.password
      );
      detailsDiv.appendChild(proxyStringDiv);

      const toolbarUList = document.createElement("ul");
      toolbarUList.classList.add("toolbar");
      proxyElement.appendChild(toolbarUList);

      const connectButtonLI = document.createElement("li");
      toolbarUList.appendChild(connectButtonLI);

      const connectProxyButton = document.createElement("button");
      connectProxyButton.classList.add("toolbar__button");
      connectProxyButton.title = "Connect proxy";
      connectButtonLI.appendChild(connectProxyButton);

      connectProxyButton.addEventListener("click", () => {
        events.dispatchEvent(
          new CustomEvent("proxyConnect", { detail: { key: proxyKey } })
        );
      });

      const connectIconSVG = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      connectIconSVG.setAttribute("fill", "currentColor");
      connectIconSVG.setAttribute("height", "24");
      connectIconSVG.setAttribute("viewBox", "0 0 48 48");
      connectIconSVG.setAttribute("width", "24");
      connectProxyButton.appendChild(connectIconSVG);

      const connectIconPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      connectIconPath.setAttribute(
        "d",
        "M8.65 42q-1.2 0-2.1-.9-.9-.9-.9-2.1V28.65q0-1.2.9-2.1.9-.9 2.1-.9h23.1V16.8h3v8.85h5.2q1.2 0 2.1.9.9.9.9 2.1V39q0 1.2-.9 2.1-.9.9-2.1.9Zm31.3-3V28.65H8.65V39Zm-24.4-5.15q0-.9-.6-1.5t-1.5-.6q-.9 0-1.5.6t-.6 1.5q0 .9.6 1.5t1.5.6q.9 0 1.5-.6t.6-1.5Zm7.4 0q0-.9-.6-1.5t-1.5-.6q-.9 0-1.5.6t-.6 1.5q0 .9.6 1.5t1.5.6q.9 0 1.5-.6t.6-1.5Zm5.3 2.1q.9 0 1.5-.6t.6-1.5q0-.9-.6-1.5t-1.5-.6q-.9 0-1.5.6t-.6 1.5q0 .9.6 1.5t1.5.6Zm1-21.3L27.2 12.6q1.2-1.2 2.725-1.9 1.525-.7 3.325-.7 1.8 0 3.325.7 1.525.7 2.725 1.9l-2.05 2.05q-.7-.7-1.75-1.175Q34.45 13 33.3 13q-1.2 0-2.275.475T29.25 14.65ZM25 10.4l-2.2-2.2q1.65-1.65 4.4-2.925Q29.95 4 33.25 4t6.05 1.275Q42.05 6.55 43.7 8.2l-2.2 2.2q-1.3-1.45-3.425-2.425Q35.95 7 33.25 7t-4.825.975Q26.3 8.95 25 10.4ZM8.65 39V28.65 39Z"
      );
      connectIconSVG.appendChild(connectIconPath);

      const editButtonLI = document.createElement("li");
      toolbarUList.appendChild(editButtonLI);

      const editProxyButton = document.createElement("button");
      editProxyButton.classList.add("toolbar__button");
      editProxyButton.title = "Edit proxy";
      editButtonLI.appendChild(editProxyButton);

      editProxyButton.addEventListener("click", () => {
        editProxyKeyInput.value = proxyKey;

        Object.entries(proxy).forEach(([settingKey, setting]) => {
          const fieldElement = proxyEditorForm.elements.namedItem(settingKey);

          if (fieldElement instanceof HTMLInputElement) {
            fieldElement.value = String(setting);
          } else if (fieldElement instanceof HTMLSelectElement) {
            for (const option of fieldElement.options) {
              if (option.value === String(setting)) option.selected = true;
            }
          }
        });

        proxyModalDialog.showModal();
      });

      const editIconSVG = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      editIconSVG.setAttribute("fill", "currentColor");
      editIconSVG.setAttribute("height", "24");
      editIconSVG.setAttribute("viewBox", "0 0 48 48");
      editIconSVG.setAttribute("width", "24");
      editProxyButton.appendChild(editIconSVG);

      const editIconPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      editIconPath.setAttribute(
        "d",
        "M9 39h2.2l22.15-22.15-2.2-2.2L9 36.8Zm30.7-24.3-6.4-6.4 2.1-2.1q.85-.85 2.1-.85t2.1.85l2.2 2.2q.85.85.85 2.1t-.85 2.1Zm-2.1 2.1L12.4 42H6v-6.4l25.2-25.2Zm-5.35-1.05-1.1-1.1 2.2 2.2Z"
      );
      editIconSVG.appendChild(editIconPath);

      const deleteButtonLI = document.createElement("li");
      toolbarUList.appendChild(deleteButtonLI);

      const deleteProxyButton = document.createElement("button");
      deleteProxyButton.classList.add("toolbar__button");
      deleteProxyButton.title = "Delete proxy";
      deleteButtonLI.appendChild(deleteProxyButton);

      deleteProxyButton.addEventListener("click", () => {
        events.dispatchEvent(
          new CustomEvent("proxyDelete", { detail: { key: proxyKey } })
        );
      });

      const deleteIconSVG = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      deleteIconSVG.setAttribute("fill", "currentColor");
      deleteIconSVG.setAttribute("height", "24");
      deleteIconSVG.setAttribute("viewBox", "0 0 48 48");
      deleteIconSVG.setAttribute("width", "24");
      deleteProxyButton.appendChild(deleteIconSVG);

      const deleteIconPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      deleteIconPath.setAttribute(
        "d",
        "M15 39H33Q33 39 33 39Q33 39 33 39V15H15V39Q15 39 15 39Q15 39 15 39ZM10.5 11V8H17.2L19.2 6H28.8L30.8 8H37.5V11ZM15 42Q13.8 42 12.9 41.1Q12 40.2 12 39V12H36V39Q36 40.2 35.1 41.1Q34.2 42 33 42ZM15 39H33Q33 39 33 39Q33 39 33 39H15Q15 39 15 39Q15 39 15 39Z"
      );
      deleteIconSVG.appendChild(deleteIconPath);

      return proxyElement;
    })
  );
}

/**
 * Disconnect the proxy that is currently active.
 */
function disconnectProxy() {
  events.dispatchEvent(new CustomEvent("proxyDisconnect"));
}

/**
 * Iterate through every line in a text file and upload a proxy if it matches
 * the conventional format.
 * @param {ProgressEvent<FileReader>} event - Progress event fired when the
 * FileReader begins reading anew file.
 */
function uploadProxies(event) {
  const proxies = event.target.result
    .toString()
    .split(/\n/)
    .map((line) => line.trim());

  for (let index = 0; index < proxies.length; index++) {
    if (!proxyRegExp.test(proxies[index])) {
      return createToast(
        "danger",
        "Invalid Proxy Format",
        `The proxy at line ${index} does not match the specified format.`
      );
    }
  }

  proxiesFileReader.proxies.forEach((proxy) => {
    const matches = proxy.match(proxyRegExp);

    events.dispatchEvent(
      new CustomEvent("proxySet", {
        detail: {
          key: crypto.randomUUID(),
          value: {
            host: matches.groups.host,
            name: "Imported Proxy",
            password: matches.groups.password,
            port: parseInt(matches.groups.port),
            scheme: "https",
            username: matches.groups.username,
          },
        },
      })
    );
  });

  createToast(
    "success",
    "Proxies Uploaded",
    "Successfully imported new proxies."
  );
}

/**
 * Read each file passed into the proxies uploader.
 */
function readUploadedProxies() {
  for (const file of proxiesUploaderInput.files) {
    proxiesFileReader.readAsText(file);
  }

  proxiesUploaderInput.value = null;
}

/**
 * Iterate through each proxy element in the list and delete it based off the
 * proxyKey stored in the dataset.
 */
function deleteAllProxies() {
  for (const proxyElement of proxyElements) {
    events.dispatchEvent(
      new CustomEvent("proxyDelete", {
        detail: { key: proxyElement.dataset.proxyKey },
      })
    );
  }
}

/**
 * Create a proxy based off a form's data with a unique UUID, or edit an
 * existing one if a proxy-key field is present in the form.
 * @param {SubmitEvent} event - Submit event fired by proxy form being
 * submitted.
 */
function createOrEditProxy(event) {
  if (event.currentTarget instanceof HTMLFormElement) {
    if (event.currentTarget.method !== "dialog") event.preventDefault();
    const formData = new FormData(event.currentTarget);

    events.dispatchEvent(
      new CustomEvent("proxySet", {
        detail: {
          key: formData.has("proxy-key")
            ? formData.get("proxy-key").toString()
            : crypto.randomUUID(),
          value: {
            host: formData.get("host").toString(),
            name: formData.get("name").toString(),
            password: formData.get("password"),
            port: parseInt(formData.get("port").toString()),
            scheme: formData.get("scheme").toString(),
            username: formData.get("username").toString(),
          },
        },
      })
    );

    event.currentTarget.reset();
  }
}

/**
 * Refresh every tab in every Chrome window.
 */
function refreshSession() {
  events.dispatchEvent(new CustomEvent("sessionRefresh"));
}

/**
 * Close the proxy modal.
 */
function closeProxyModal() {
  proxyModalDialog.close();
}

proxyDisconnectorButton.addEventListener("click", disconnectProxy);
proxiesFileReader.addEventListener("load", uploadProxies);
proxiesUploaderInput.addEventListener("input", readUploadedProxies);
proxiesDeleterButton.addEventListener("click", deleteAllProxies);
sessionRefresherButton.addEventListener("click", refreshSession);
proxyAdderForm.addEventListener("submit", createOrEditProxy);
proxyEditorForm.addEventListener("submit", createOrEditProxy);
proxyModalCloserButton.addEventListener("click", closeProxyModal);
