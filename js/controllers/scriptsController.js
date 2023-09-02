import * as profilesModel from "../models/profilesModel.js";
import * as scriptsModel from "../models/scriptsModel.js";
import { getFirstKey } from "../utils/helpers.js";
import * as scriptsView from "../views/scriptsView.js";

controlScriptsProfileOptions();
controlScriptSettings();

/**
 * Replace each script element's profile select options and select the script's
 * current profile.
 */
function controlScriptsProfileOptions() {
  scriptsView.replaceScriptsProfileOptions(profilesModel.state);
}

/**
 * Update each script's setting controls.
 */
function controlScriptSettings() {
  scriptsView.updateScriptSettings(scriptsModel.state);
}

/**
 * Set each script's profileKey property to the key of the first profile stored
 * in the state if the script's current profile no longer exists.
 */
async function controlScriptProfileKeys() {
  const newProfileKey = getFirstKey(profilesModel.state);

  for (const [scriptKey, script] of Object.entries(scriptsModel.state)) {
    if (Object.hasOwn(script, "profileKey")) {
      if (!Object.hasOwn(profilesModel.state, script.profileKey)) {
        await scriptsModel.setScriptSetting(
          scriptKey,
          "profileKey",
          newProfileKey
        );
      }
    }
  }
}

/**
 * Set a script's settings to the current value passed in.
 * @param {CustomEvent<{ scriptKey: string, settingKey: string, value: any }>}
 * event - CustomEvent dispatched by a script's setting being change.
 */
async function controlScriptChange(event) {
  await scriptsModel.setScriptSetting(
    event.detail.scriptKey,
    event.detail.settingKey,
    event.detail.value
  );
}

profilesModel.events.addEventListener(
  "stateChange",
  controlScriptsProfileOptions
);
profilesModel.events.addEventListener("stateChange", controlScriptProfileKeys);
scriptsModel.events.addEventListener("stateChange", controlScriptSettings);
scriptsView.events.addEventListener("scriptChange", controlScriptChange);
