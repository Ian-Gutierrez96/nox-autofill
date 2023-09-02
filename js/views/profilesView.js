import AddressFieldName from "../enums/AddressFieldName.js";
import profileSchema from "../schemas/profileSchema.js";
import addressFieldSetLayouts from "../utils/addressFieldSetLayouts.js";
import { firstAdministrativeLevels } from "../utils/administrativeLevels.js";
import createToast from "../utils/createToast.js";

const displayCcTypeImage = /** @type {HTMLImageElement} */ (
  document.getElementById("display-cc-type")
);
const displayCcNumberDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("display-cc-number")
);
const displayCcNameDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("display-cc-name")
);
const displayCcExpDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("display-cc-exp")
);
const displayCcCSCSpan = /** @type {HTMLSpanElement} */ (
  document.getElementById("display-cc-csc")
);
const profilesDeleterButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("profiles-deleter")
);
const profilesUploaderInput = /** @type {HTMLInputElement} */ (
  document.getElementById("profiles-uploader")
);
const profilesDownloaderAnchor = /** @type {HTMLAnchorElement} */ (
  document.getElementById("profiles-downloader")
);
const profilesListDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("profiles-list")
);
const profileElements = /** @type {HTMLCollectionOf<HTMLElement>} */ (
  document.getElementsByClassName("profile")
);
const profileCreatorForm = /** @type {HTMLFormElement} */ (
  document.getElementById("profile-creator")
);
const createShippingCountrySelect = /** @type {HTMLSelectElement} */ (
  document.getElementById("create-shipping-country")
);
const createBillingAddressSameInput = /** @type {HTMLInputElement} */ (
  document.getElementById("create-billing-address-same")
);
const createBillingCountrySelect = /** @type {HTMLSelectElement} */ (
  document.getElementById("create-billing-country")
);
const createPaymentCcGivenNameInput = /** @type {HTMLInputElement} */ (
  document.getElementById("create-payment-cc-given-name")
);
const createPaymentCcFamilyNameInput = /** @type {HTMLInputElement} */ (
  document.getElementById("create-payment-cc-family-name")
);
const createPaymentCcNumberInput = /** @type {HTMLInputElement} */ (
  document.getElementById("create-payment-cc-number")
);
const createPaymentCcTypeInput = /** @type {HTMLInputElement} */ (
  document.getElementById("create-payment-cc-type")
);
const createPaymentCcExpMonthSelect = /** @type {HTMLSelectElement} */ (
  document.getElementById("create-payment-cc-exp-month")
);
const createPaymentCcExpYearSelect = /** @type {HTMLSelectElement} */ (
  document.getElementById("create-payment-cc-exp-year")
);
const createPaymentCcCSCInput = /** @type {HTMLInputElement} */ (
  document.getElementById("create-payment-cc-csc")
);
const profileModalDialog = /** @type {HTMLDialogElement} */ (
  document.getElementById("profile-modal")
);
const profileEditorForm = /** @type {HTMLFormElement} */ (
  document.getElementById("profile-editor")
);
const editProfileKeyInput = /** @type {HTMLInputElement} */ (
  document.getElementById("edit-profile-key")
);
const editShippingCountrySelect = /** @type {HTMLSelectElement} */ (
  document.getElementById("edit-shipping-country")
);
const editBillingAddressSameInput = /** @type {HTMLInputElement} */ (
  document.getElementById("edit-billing-address-same")
);
const editBillingCountrySelect = /** @type {HTMLSelectElement} */ (
  document.getElementById("edit-billing-country")
);
const editPaymentCcNumberInput = /** @type {HTMLInputElement} */ (
  document.getElementById("edit-payment-cc-number")
);
const editPaymentCcCSCInput = /** @type {HTMLInputElement} */ (
  document.getElementById("edit-payment-cc-csc")
);
const profileModalCloserButton = /** @type {HTMLButtonElement} */ (
  document.getElementById("profile-modal-closer")
);

const profilesFileReader = new FileReader();
const cardTypes = new Set([
  "amex",
  "diners",
  "discover",
  "elo",
  "hipercard",
  "jcb",
  "maestro",
  "mastercard",
  "mir",
  "unionpay",
  "visa",
]);

/**
 * Profiles view's map of event types and their corresponding custom events.
 * @typedef {Object} ProfilesViewEventMap
 * @property {CustomEvent<{ key: string }>} profileDelete
 * @property {CustomEvent<{ key: string, value: Profile }>} profileSet
 */

/**
 * Dispatch events and attach listeners for them.
 * @type {EventEmitter<ProfilesViewEventMap>}
 */
export const events = new EventTarget();

Payment.formatCardNumber(createPaymentCcNumberInput);
Payment.formatCardNumber(editPaymentCcNumberInput);
Payment.formatCardCVC(createPaymentCcCSCInput);
Payment.formatCardCVC(editPaymentCcCSCInput);

/**
 * Append the profiles onto the profiles list in sequential order.
 * @param {Object<string, Profile>} profiles - Object of the user's profiles and
 * their corresponding keys.
 */
export function appendProfilesToList(profiles) {
  profilesListDiv.replaceChildren(
    ...Object.entries(profiles).map(([profileKey, profile]) => {
      const profileElement = document.createElement("article");
      profileElement.classList.add("profile");
      profileElement.dataset.profileKey = profileKey;

      const informationDiv = document.createElement("div");
      informationDiv.classList.add("profile__information");
      profileElement.appendChild(informationDiv);

      const avatarImg = document.createElement("img");
      avatarImg.alt = "Card logo";
      avatarImg.classList.add("profile__avatar");
      avatarImg.src = cardTypes.has(profile.payment.ccType)
        ? `./images/${profile.payment.ccType}.svg`
        : "./images/generic.svg";
      informationDiv.appendChild(avatarImg);

      const detailsDiv = document.createElement("div");
      detailsDiv.classList.add("profile__details");
      informationDiv.appendChild(detailsDiv);

      const headingHeading = document.createElement("h3");
      headingHeading.classList.add("profile__name");
      headingHeading.textContent = profile.contact.username;
      detailsDiv.appendChild(headingHeading);

      const cardNumberDiv = document.createElement("div");
      cardNumberDiv.textContent = "**** " + profile.payment.ccNumber.slice(-4);
      detailsDiv.appendChild(cardNumberDiv);

      const toolbarUList = document.createElement("ul");
      toolbarUList.classList.add("toolbar");
      profileElement.appendChild(toolbarUList);

      const editButtonLI = document.createElement("li");
      toolbarUList.appendChild(editButtonLI);

      const editProfileButton = document.createElement("button");
      editProfileButton.classList.add("toolbar__button");
      editProfileButton.title = "Edit profile";
      editButtonLI.appendChild(editProfileButton);

      editProfileButton.addEventListener("click", () => {
        editProfileKeyInput.value = profileKey;

        Object.entries(profile).forEach(([fieldSetKey, fieldSet]) => {
          const fieldSetElement =
            profileEditorForm.elements.namedItem(fieldSetKey);

          if (fieldSetElement instanceof HTMLFieldSetElement) {
            fieldSetElement
              .querySelectorAll("[data-field-key]")
              .forEach((fieldElement) => {
                if (fieldElement instanceof HTMLInputElement) {
                  fieldElement.value = fieldSet[fieldElement.dataset.fieldKey];

                  fieldElement.dispatchEvent(
                    new InputEvent("input", { bubbles: true, cancelable: true })
                  );
                } else if (fieldElement instanceof HTMLSelectElement) {
                  for (const option of fieldElement.options) {
                    if (
                      option.value === fieldSet[fieldElement.dataset.fieldKey]
                    ) {
                      option.selected = true;

                      fieldElement.dispatchEvent(
                        new InputEvent("input", {
                          bubbles: true,
                          cancelable: true,
                        })
                      );
                    }
                  }
                }
              });
          }
        });

        profileModalDialog.showModal();
      });

      const editIconSVG = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "svg"
      );
      editIconSVG.setAttribute("fill", "currentColor");
      editIconSVG.setAttribute("height", "24");
      editIconSVG.setAttribute("viewBox", "0 0 48 48");
      editIconSVG.setAttribute("width", "24");
      editProfileButton.appendChild(editIconSVG);

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

      const deleteProfileButton = document.createElement("button");
      deleteProfileButton.classList.add("toolbar__button");
      deleteProfileButton.title = "Delete profile";
      deleteButtonLI.appendChild(deleteProfileButton);

      deleteProfileButton.addEventListener("click", () => {
        events.dispatchEvent(
          new CustomEvent("profileDelete", { detail: { key: profileKey } })
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
      deleteProfileButton.appendChild(deleteIconSVG);

      const deleteIconPath = document.createElementNS(
        "http://www.w3.org/2000/svg",
        "path"
      );
      deleteIconPath.setAttribute(
        "d",
        "M15 39H33Q33 39 33 39Q33 39 33 39V15H15V39Q15 39 15 39Q15 39 15 39ZM10.5 11V8H17.2L19.2 6H28.8L30.8 8H37.5V11ZM15 42Q13.8 42 12.9 41.1Q12 40.2 12 39V12H36V39Q36 40.2 35.1 41.1Q34.2 42 33 42ZM15 39H33Q33 39 33 39Q33 39 33 39H15Q15 39 15 39Q15 39 15 39Z"
      );
      deleteIconSVG.appendChild(deleteIconPath);

      return profileElement;
    })
  );
}

/**
 * Set the download profile anchor's href.
 * @param {string} objectURL - Object URL used to reference the contents of the
 * profiles object.
 */
export function setProfilesDownloadHref(objectURL) {
  profilesDownloaderAnchor.href = objectURL;
}

/**
 * Upload the profiles from the JSON file passed in if they match the profile
 * schema.
 * @param {ProgressEvent<FileReader>} event - Progress event fired when the
 * fileReader begins reading a new file.
 */
function uploadProfiles(event) {
  try {
    // Retrieve each enumerable property from the parsed JSON file
    const entries = Object.entries(JSON.parse(event.target.result.toString()));

    // Validate each entry and display a toast if an error is encountered
    for (const [key, profile] of entries) {
      const { error } = profileSchema.validate(profile);

      if (error) {
        return createToast(
          "danger",
          "Invalid Profile Format",
          `The JSON file's property with key "${key}" was not a valid profile. ${error.message}.`
        );
      }
    }

    // Upload each profile stored in the JSON file
    entries.forEach(([key, value]) => {
      events.dispatchEvent(
        new CustomEvent("profileSet", {
          detail: { key, value },
        })
      );
    });

    // Display a toast indicating the upload was successful
    createToast(
      "success",
      "Profiles Uploaded",
      "Successfully created new profiles and updated existing ones."
    );
  } catch (error) {
    // Display a toast instructing the user to upload a valid JSON file
    if (error instanceof SyntaxError) {
      createToast(
        "danger",
        "Unable to Parse Profiles",
        "Please make sure that the file type you've uploaded is a valid JSON file."
      );
    }
  }
}

/**
 * Reads each JSON file passed into the uploadProfiles input element.
 */
function readUploadedProfiles() {
  for (const file of profilesUploaderInput.files) {
    profilesFileReader.readAsText(file);
  }

  profilesUploaderInput.value = null;
}

/**
 * Iterates through each profile element in the list and deletes it based off
 * the profileKey stored in the dataset.
 */
function deleteAllProfiles() {
  for (const profileElement of profileElements) {
    events.dispatchEvent(
      new CustomEvent("profileDelete", {
        detail: { key: profileElement.dataset.profileKey },
      })
    );
  }
}

/**
 * Create a profile based off a form's data with a unique UUID, or edit one if a
 * profile-key field is present in the form.
 * @param {SubmitEvent} event - Submit event fired when the user submits a
 * profile profile form.
 */
function createOrEditProfile(event) {
  if (event.currentTarget instanceof HTMLFormElement) {
    const formData = new FormData(event.currentTarget);

    const contact = {
      email: formData.get("contact-email").toString().trim(),
      tel: formData.get("contact-tel").toString().replace(/\D/g, ""),
      username: formData.get("contact-username").toString().trim(),
    };

    const shipping = {
      addressLevel1: formData.has("shipping-address-level1")
        ? formData.get("shipping-address-level1").toString()
        : null,
      addressLevel2: formData.has("shipping-address-level2")
        ? formData.get("shipping-address-level2").toString().trim()
        : null,
      addressLine1: formData.get("shipping-address-line1").toString().trim(),
      addressLine2: formData.get("shipping-address-line2").toString().trim(),
      country: formData.get("shipping-country").toString(),
      familyName: formData.get("shipping-family-name").toString().trim(),
      givenName: formData.get("shipping-given-name").toString().trim(),
      postalCode: formData.has("shipping-postal-code")
        ? formData.get("shipping-postal-code").toString().trim()
        : null,
    };

    const billing = formData.get("billing-address-same")
      ? shipping
      : {
          addressLevel1: formData.has("billing-address-level1")
            ? formData.get("billing-address-level1").toString()
            : null,
          addressLevel2: formData.has("billing-address-level2")
            ? formData.get("billing-address-level2").toString().trim()
            : null,
          addressLine1: formData.get("billing-address-line1").toString().trim(),
          addressLine2: formData.get("billing-address-line2").toString().trim(),
          country: formData.get("billing-country").toString(),
          familyName: formData.get("billing-family-name").toString().trim(),
          givenName: formData.get("billing-given-name").toString().trim(),
          postalCode: formData.has("billing-postal-code")
            ? formData.get("billing-postal-code").toString().trim()
            : null,
        };

    const payment = {
      ccCSC: formData.get("payment-cc-csc").toString().trim(),
      ccExpMonth: formData.get("payment-cc-exp-month").toString(),
      ccExpYear: formData.get("payment-cc-exp-year").toString(),
      ccFamilyName: formData.get("payment-cc-family-name").toString(),
      ccGivenName: formData.get("payment-cc-given-name").toString(),
      ccNumber: formData.get("payment-cc-number").toString().replace(/\D/g, ""),
      ccType: formData.get("payment-cc-type").toString(),
    };

    events.dispatchEvent(
      new CustomEvent("profileSet", {
        detail: {
          key: formData.has("profile-key")
            ? formData.get("profile-key").toString()
            : crypto.randomUUID(),
          value: { billing, contact, payment, shipping },
        },
      })
    );

    if (event.currentTarget.method !== "dialog") {
      event.preventDefault();
    }

    event.currentTarget.reset();
  }
}

/**
 * Dispatch input events to each form control during the next event cycle (after
 * all the controls have been reset).
 * @param {SubmitEvent} event - Submit event fired when the user submits a
 * profile form.
 */
function dispatchInputEvents(event) {
  if (event.currentTarget instanceof HTMLFormElement) {
    const formControls = event.currentTarget.elements;

    setTimeout(() => {
      for (const formControlElement of formControls) {
        formControlElement.dispatchEvent(
          new InputEvent("input", { bubbles: true, cancelable: true })
        );
      }
    });
  }
}

/**
 * Format the country select element's fieldset according to locale selected.
 * @param {Event} event - Change event fired by a fieldset's country select
 * element changing.
 */
function formatAddressFieldSet(event) {
  if (event.currentTarget instanceof HTMLSelectElement) {
    const addressFieldSet = event.currentTarget.closest("fieldset");
    const formControls = event.currentTarget.form.elements;
    const activeElement = document.activeElement;
    const country = event.currentTarget.value;

    const addressFieldSetLegends =
      addressFieldSet.getElementsByTagName("legend");
    const addressFieldSetLayout = addressFieldSetLayouts.get(country);

    addressFieldSet.replaceChildren(
      ...addressFieldSetLegends,
      ...addressFieldSetLayout.map((addressFields) => {
        const formRowDiv = document.createElement("div");
        formRowDiv.classList.add("form__row");

        addressFields.forEach((addressField) => {
          const addressFieldElement = formControls.namedItem(
            addressFieldSet.name + "-" + addressField.name
          );

          if (
            addressFieldElement instanceof HTMLInputElement ||
            addressFieldElement instanceof HTMLSelectElement
          ) {
            addressFieldElement.parentElement.classList.toggle(
              "form__control--hidden",
              addressField.disabled
            );
            addressFieldElement.disabled = addressField.disabled;
            addressFieldElement.required = addressField.required;

            addressFieldElement.labels.forEach((label) => {
              label.textContent = addressField.label;
            });

            switch (addressField.name) {
              case AddressFieldName.ADDRESS_LEVEL1:
                if (firstAdministrativeLevels.has(country)) {
                  const placeholderOption = document.createElement("option");
                  placeholderOption.textContent = "Select a region";
                  placeholderOption.disabled = true;
                  placeholderOption.value = "";

                  addressFieldElement.replaceChildren(
                    placeholderOption,
                    ...Array.from(
                      firstAdministrativeLevels.get(country).entries()
                    ).map(([isoCode, name]) => {
                      const option = document.createElement("option");
                      option.textContent = name;
                      option.value = isoCode;
                      return option;
                    })
                  );
                }
                break;
            }

            formRowDiv.appendChild(addressFieldElement.parentElement);
          }
        });

        return formRowDiv;
      })
    );

    if (activeElement instanceof HTMLElement) activeElement.focus();
  }
}

/**
 * Toggle the visibility of an address field set depending on whether an input
 * checkbox is checked. If checked, the address field set will be hidden and
 * each form control will be set to readonly.
 * @param {Event} event - Change event fired by a "Billing same as shipping"
 * input checkbox.
 */
function toggleAddressFieldSet(event) {
  if (event.currentTarget instanceof HTMLInputElement) {
    const addressFieldSet = event.currentTarget.form.elements.namedItem(
      event.currentTarget.dataset.fieldsetToggle
    );
    const isFieldSetVisible = event.currentTarget.checked;

    if (addressFieldSet instanceof HTMLFieldSetElement) {
      addressFieldSet.classList.toggle(
        "form__fieldset--hidden",
        isFieldSetVisible
      );
      addressFieldSet
        .querySelectorAll("[data-field-key]")
        .forEach((fieldElement) => {
          fieldElement.toggleAttribute("readonly", isFieldSetVisible);
        });
    }
  }
}

/**
 * Updates the display credit card holder's name as the concatenation of the
 * cardholder's first and last name in the create profile form's payment
 * fieldset. If both fields are empty, the div will have a default textContent
 * of "Your name".
 */
function updateDisplayCcName() {
  displayCcNameDiv.textContent =
    [createPaymentCcGivenNameInput.value, createPaymentCcFamilyNameInput.value]
      .filter(Boolean)
      .join(" ") || "Your Name";
}

/**
 * Updates the display credit card's number as the value of the corresponding
 * form input. If the form control is empty, the textContent will default to
 * dots.
 */
function updateDisplayCcNumber() {
  displayCcNumberDiv.textContent =
    createPaymentCcNumberInput.value || "•••• •••• •••• ••••";
}

/**
 * Sets the value of the credit card type input hidden in the payment fieldset.
 * Will be set to null if the credit card number matches no card format.
 * @param {InputEvent} event - Input event fired by credit card number field.
 */
function setPaymentCreditCardType(event) {
  if (event.currentTarget instanceof HTMLInputElement) {
    const paymentCcTypeElement =
      event.currentTarget.form.elements.namedItem("payment-cc-type");

    if (paymentCcTypeElement instanceof HTMLInputElement) {
      paymentCcTypeElement.value = Payment.fns.cardType(
        event.currentTarget.value
      );
      paymentCcTypeElement.dispatchEvent(
        new InputEvent("input", { bubbles: true, cancelable: true })
      );
    }
  }
}

/**
 * Updates the display credit card's type and displays the logo; will otherwise
 * be hidden if the card has no type.
 */
function updateDisplayCreditCardType() {
  const cardType = Payment.fns.cardType(createPaymentCcNumberInput.value);

  if (cardTypes.has(cardType)) {
    displayCcTypeImage.src = chrome.runtime.getURL(`./images/${cardType}.svg`);
    displayCcTypeImage.style.opacity = "100%";
  } else {
    displayCcTypeImage.style.opacity = "0%";
  }
}

/**
 * Updates the display credit card's expiration date as the concatenation of the
 * corresponding payment field select values joined together by a forward slash.
 */
function updateDisplayCcExp() {
  displayCcExpDiv.textContent = [
    createPaymentCcExpMonthSelect.value.padStart(2, "0"),
    createPaymentCcExpYearSelect.value,
  ].join(" / ");
}

/**
 * Update the display credit card's security code as the value of the
 * corresponding payment field input. Will otherwise default to placeholder dots
 * if empty.
 */
function updateDisplayCcCSC() {
  displayCcCSCSpan.textContent = createPaymentCcCSCInput.value || "•••";
}

/**
 * Close the profile modal.
 */
function closeProfileModal() {
  profileModalDialog.close();
}

profilesFileReader.addEventListener("load", uploadProfiles);
profilesUploaderInput.addEventListener("input", readUploadedProfiles);
profilesDeleterButton.addEventListener("click", deleteAllProfiles);
profileCreatorForm.addEventListener("reset", dispatchInputEvents);
profileCreatorForm.addEventListener("submit", createOrEditProfile);
createShippingCountrySelect.addEventListener("input", formatAddressFieldSet);
createBillingAddressSameInput.addEventListener("input", toggleAddressFieldSet);
createBillingCountrySelect.addEventListener("input", formatAddressFieldSet);
createPaymentCcGivenNameInput.addEventListener("input", updateDisplayCcName);
createPaymentCcFamilyNameInput.addEventListener("input", updateDisplayCcName);
createPaymentCcNumberInput.addEventListener("input", updateDisplayCcNumber);
createPaymentCcNumberInput.addEventListener("input", setPaymentCreditCardType);
createPaymentCcTypeInput.addEventListener("input", updateDisplayCreditCardType);
createPaymentCcExpMonthSelect.addEventListener("input", updateDisplayCcExp);
createPaymentCcExpYearSelect.addEventListener("input", updateDisplayCcExp);
createPaymentCcCSCInput.addEventListener("input", updateDisplayCcCSC);
profileEditorForm.addEventListener("reset", dispatchInputEvents);
profileEditorForm.addEventListener("submit", createOrEditProfile);
editShippingCountrySelect.addEventListener("input", formatAddressFieldSet);
editBillingAddressSameInput.addEventListener("input", toggleAddressFieldSet);
editBillingCountrySelect.addEventListener("input", formatAddressFieldSet);
editPaymentCcNumberInput.addEventListener("input", setPaymentCreditCardType);
profileModalCloserButton.addEventListener("click", closeProfileModal);
