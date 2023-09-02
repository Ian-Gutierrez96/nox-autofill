export let { proxy: state } =
  /** @type {{ proxy: { activeKey: string, proxies: Object<string, Proxy> } }} */ (
    await chrome.storage.local.get("proxy")
  );

/**
 * @typedef {Object} ProxyEventMap
 * @property {CustomEvent} stateChange
 */

/**
 * Attach listeners for events dispatched from the proxy.
 * @type {EventEmitter<ProxyEventMap>}
 */
export const events = new EventTarget();

/**
 * Create or edit an existing proxy and update Chrome's proxy if it were active.
 * @param {string} key - Proxy's key.
 * @param {Proxy} value - New or updated proxy.
 */
export async function setProxy(key, value) {
  // Update Chrome's proxy if the active proxy is being updated
  if (state.activeKey === key) {
    chrome.proxy.settings.set({
      scope: "regular",
      value: {
        mode: "fixed_servers",
        rules: {
          singleProxy: {
            host: value.host,
            port: value.port,
            scheme: value.scheme,
          },
        },
      },
    });
  }

  // Set the proxy and update Chrome's local storage
  state.proxies[key] = value;
  await chrome.storage.local.set({ proxy: state });
}

/**
 * Delete a proxy and clear it from Chrome if it were active.
 * @param {string} key - Proxy's key.
 */
export async function deleteProxy(key) {
  // Ensure the key is mapped to a proxy
  if (!Object.hasOwn(state.proxies, key)) {
    throw new Error("Proxy key does not exist.");
  }

  // Clear Chrome's proxy if the active proxy is being deleted
  if (state.activeKey === key) {
    chrome.proxy.settings.clear({
      scope: "regular",
    });
    state.activeKey = null;
  }

  // 3. Delete the proxy and update Chrome's local storage
  delete state.proxies[key];
  await chrome.storage.local.set({ proxy: state });
}

/**
 * Set Chrome's proxy to an existing proxy and indicate it is active.
 * @param {string} key - Proxy's key.
 */
export async function connectProxy(key) {
  // Ensure the key is mapped to a proxy
  if (!Object.hasOwn(state.proxies, key)) {
    throw new Error("Proxy key does not exist.");
  }

  // Set Chrome's proxy to the one mapped to the corresponding key
  chrome.proxy.settings.set({
    scope: "regular",
    value: {
      mode: "fixed_servers",
      rules: {
        singleProxy: {
          host: state.proxies[key].host,
          port: state.proxies[key].port,
          scheme: state.proxies[key].scheme,
        },
      },
    },
  });

  // 3. Update the active key and update Chrome's local storage
  state.activeKey = key;
  await chrome.storage.local.set({ proxy: state });
}

/**
 * Clear Chrome's proxy and indicate no proxy is active.
 */
export async function disconnectProxy() {
  // Clear Chrome's proxy
  chrome.proxy.settings.clear({
    scope: "regular",
  });

  // Reset the active key and update Chrome's local storage
  state.activeKey = null;
  await chrome.storage.local.set({ proxy: state });
}

/**
 * Updates the state if changes occurred on the storage's proxy property.
 * @param {Object<string, chrome.storage.StorageChange>} changes - Changes when
 * one or more items change.
 * @param {keyof Pick<typeof chrome.storage, 'sync' | 'local' | 'managed' |
 * 'session'>} areaName - Storage area where changes were made.
 */
function onChangedListener(changes, areaName) {
  if (areaName === "local" && Object.hasOwn(changes, "proxy")) {
    state = changes.proxy.newValue;
    events.dispatchEvent(new CustomEvent("stateChange"));
  }
}

chrome.storage.onChanged.addListener(onChangedListener);
