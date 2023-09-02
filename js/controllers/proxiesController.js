import * as proxyModel from "../models/proxyModel.js";
import { createProxyDetails } from "../utils/helpers.js";
import * as proxiesView from "../views/proxiesView.js";

controlActiveProxyStatus();
controlDownloadProxiesHref();
controlProxiesToList();

/**
 * Create a blob by mapping every proxy to its detail string and joining each
 * one with a newline. The proxy downloader's href will be set to the location
 * of the blob in plaintext.
 */
function controlDownloadProxiesHref() {
  proxiesView.setDownloadProxiesHref(
    URL.createObjectURL(
      new Blob(
        [
          Object.values(proxyModel.state.proxies)
            .map(({ host, port, username, password }) =>
              createProxyDetails(host, port, username, password)
            )
            .join("\n"),
        ],
        {
          type: "text/plain",
        }
      )
    )
  );
}

/**
 * Retrieve the proxy that matches the active proxy's key and display its
 * information onto the proxy status.
 */
function controlActiveProxyStatus() {
  proxiesView.displayActiveProxyStatus(
    proxyModel.state.proxies[proxyModel.state.activeKey]
  );
}

/**
 * Append each proxy stored in the state onto the list.
 */
function controlProxiesToList() {
  proxiesView.appendProxiesToList(proxyModel.state.proxies);
}

/**
 * Disconnect the active proxy.
 */
async function controlProxyDisconnect() {
  await proxyModel.disconnectProxy();
}

/**
 * Connect the proxy mapped to a key.
 * @param {CustomEvent<{ key: string }>} event - CustomEvent fired by a proxy
 * being connected.
 */
async function controlProxyConnect(event) {
  await proxyModel.connectProxy(event.detail.key);
}

/**
 * Delete the proxy mapped to a key.
 * @param {CustomEvent<{ key: string }>} event - CustomEvent fired by a proxy
 * being deleted.
 */
async function controlProxyDelete(event) {
  await proxyModel.deleteProxy(event.detail.key);
}

/**
 * Retrieve every normal Chrome window and reload each one of its tabs.
 */
async function controlSessionRefresh() {
  const windows = await chrome.windows.getAll({ windowTypes: ["normal"] });

  for (const window of windows) {
    const tabs = await chrome.tabs.query({ windowId: window.id });

    for (const tab of tabs) await chrome.tabs.reload(tab.id);
  }
}

/**
 * Create or edit a proxy based on whether the key passed in already exists.
 * @param {CustomEvent<{ key: string, value: Proxy }>} event - CustomEvent fired
 * by a proxy being set.
 */
async function controlProxySet(event) {
  await proxyModel.setProxy(event.detail.key, event.detail.value);
}

proxyModel.events.addEventListener("stateChange", controlDownloadProxiesHref);
proxyModel.events.addEventListener("stateChange", controlActiveProxyStatus);
proxyModel.events.addEventListener("stateChange", controlProxiesToList);
proxiesView.events.addEventListener("proxyDisconnect", controlProxyDisconnect);
proxiesView.events.addEventListener("proxyConnect", controlProxyConnect);
proxiesView.events.addEventListener("proxyDelete", controlProxyDelete);
proxiesView.events.addEventListener("sessionRefresh", controlSessionRefresh);
proxiesView.events.addEventListener("proxySet", controlProxySet);
