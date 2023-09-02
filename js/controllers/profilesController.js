import * as profilesModel from "../models/profilesModel.js";
import * as profilesView from "../views/profilesView.js";

controlProfilesToList();
controlProfilesDownloadHref();

/**
 * Append each profile stored in the state onto the list.
 */
function controlProfilesToList() {
  profilesView.appendProfilesToList(profilesModel.state);
}

/**
 * Create a blob by stringifying the profiles to a JSON format. The profiles
 * downloader's href will be set to the location of the blob in JSON.
 */
function controlProfilesDownloadHref() {
  profilesView.setProfilesDownloadHref(
    URL.createObjectURL(
      new Blob([JSON.stringify(profilesModel.state)], {
        type: "text/json",
      })
    )
  );
}

/**
 * Create or edit an existing profile depending on whether a profile is already
 * mapped to the key.
 * @param {CustomEvent<{ key: string, value: Profile }>} event - CustomEvent
 * dispatched by profile being created or edited.
 */
async function controlProfileSet(event) {
  await profilesModel.setProfile(event.detail.key, event.detail.value);
}

/**
 * Delete the profile with the corresponding key.
 * @param {CustomEvent<{ key: string }>} event - CustomEvent dispatched by
 * profile being deleted.
 */
async function controlProfileDelete(event) {
  await profilesModel.deleteProfile(event.detail.key);
}

profilesModel.events.addEventListener("stateChange", controlProfilesToList);
profilesModel.events.addEventListener(
  "stateChange",
  controlProfilesDownloadHref
);
profilesView.events.addEventListener("profileSet", controlProfileSet);
profilesView.events.addEventListener("profileDelete", controlProfileDelete);
