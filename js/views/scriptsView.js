const scriptElements = /** @type {HTMLCollectionOf<HTMLDivElement>} */ (
  document.getElementsByClassName("script")
);

/**
 * Map of event types and their corresponding custom events.
 * @typedef {object} ScriptsViewEventMap
 * @property {CustomEvent<{ scriptKey: string, settingKey: string, value: any
 *  }>} scriptChange
 */

/**
 * Dispatch events and attach listeners for them.
 * @type {EventEmitter<ScriptsViewEventMap>}
 */
export const events = new EventTarget();

/**
 * Replace each script element's profile select options and select the script's
 * current profile.
 * @param {Object<string, Profile>} profiles - Map of the user's profiles and
 * their corresponding keys.
 */
export function replaceScriptsProfileOptions(profiles) {
  for (const scriptElement of scriptElements) {
    const profileKeyElement = scriptElement.querySelector(
      "[data-setting-key='profileKey']"
    );

    if (profileKeyElement instanceof HTMLSelectElement) {
      profileKeyElement.replaceChildren(
        ...Object.entries(profiles).map(([profileKey, profile]) => {
          const option = document.createElement("option");
          option.value = profileKey;
          option.textContent = profile.contact.username;
          option.selected = profileKeyElement.value === profileKey;

          return option;
        })
      );
    }
  }
}

/**
 * Update each script element's setting controls.
 * @param {Object<string, Script>} scripts - Map of the supported scripts and
 * their corresponding keys.
 */
export function updateScriptSettings(scripts) {
  for (const scriptElement of scriptElements) {
    scriptElement.classList.remove("script--active");

    scriptElement
      .querySelectorAll("[data-setting-key]")
      .forEach((settingElement) => {
        if (settingElement instanceof HTMLInputElement) {
          settingElement.checked =
            scripts[scriptElement.dataset.scriptKey][
              settingElement.dataset.settingKey
            ];

          if (settingElement.checked)
            scriptElement.classList.add("script--active");
        } else if (settingElement instanceof HTMLSelectElement) {
          for (const optionElement of settingElement.options) {
            optionElement.selected =
              optionElement.value ===
              scripts[scriptElement.dataset.scriptKey][
                settingElement.dataset.settingKey
              ];
          }
        }
      });
  }
}

/**
 * Modify a script's setting with the value dependent on the input/select
 * element's value.
 * @param {Event} event - Change event fired by a script element's setting
 * control's value changing.
 */
function changeScriptSetting(event) {
  if (event.currentTarget instanceof HTMLElement) {
    if (event.target instanceof HTMLInputElement) {
      events.dispatchEvent(
        new CustomEvent("scriptChange", {
          detail: {
            scriptKey: event.currentTarget.dataset.scriptKey,
            settingKey: event.target.dataset.settingKey,
            value: event.target.checked,
          },
        })
      );
    } else if (event.target instanceof HTMLSelectElement) {
      events.dispatchEvent(
        new CustomEvent("scriptChange", {
          detail: {
            scriptKey: event.currentTarget.dataset.scriptKey,
            settingKey: event.target.dataset.settingKey,
            value: event.target.value,
          },
        })
      );
    }
  }
}

for (const scriptElement of scriptElements) {
  scriptElement.addEventListener("change", changeScriptSetting);
}
