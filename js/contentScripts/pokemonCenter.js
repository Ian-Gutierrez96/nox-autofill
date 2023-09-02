"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isAddressActive = false;
let isPaymentActive = false;
let isSummaryActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillPokemonCenter(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { pokemonCenter },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (pokemonCenter.autocheckoutEnabled || pokemonCenter.autofillEnabled) &&
      Object.hasOwn(profiles, pokemonCenter.profileKey)
    ) {
      const profile = profiles[pokemonCenter.profileKey];

      switch (location.pathname) {
        case "/":
          if (notifications) {
            displayNotification(pokemonCenter);
          }
          break;

        case "/cart":
          if (!isCartActive) {
            cart(pokemonCenter);
          }
          break;

        case "/checkout/address":
          if (!isAddressActive) {
            address(pokemonCenter, profile);
          }
          break;

        case "/checkout/payment":
          if (!isPaymentActive) {
            payment(pokemonCenter, profile);
          }
          break;

        case "/checkout/summary":
          if (!isSummaryActive) {
            summary(pokemonCenter);
          }
          break;
      }
    }
  }
}

function displayNotification(pokemonCenter) {
  const { autocheckoutEnabled } = pokemonCenter;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Pokémon Center. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Pokémon Center.",
  });
}

async function cart(pokemonCenter) {
  isCartActive = true;

  const { autocheckoutEnabled } = pokemonCenter;

  if (autocheckoutEnabled) {
    const checkoutButton = await waitForSelector(
      ":is(#guest-checkout, #checkout):enabled"
    );
    checkoutButton.click();
  }

  isCartActive = false;
}

async function address(pokemonCenter, profile) {
  isAddressActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = pokemonCenter;
  const { billing, contact, shipping } = profile;
  const fields = {
    billingGivenName: {
      selector: "#billing-givenName",
      value: billing.givenName,
    },
    billingFamilyName: {
      selector: "#billing-familyName",
      value: billing.familyName,
    },
    billingStreetAddress: {
      selector: "#billing-streetAddress",
      value: billing.addressLine1,
    },
    billingExtendedAddress: {
      selector: "#billing-extendedAddress",
      value: billing.addressLine2,
    },
    billingLocality: {
      selector: "#billing-locality",
      value: billing.addressLevel2,
    },
    billingRegion: {
      selector: "#billing-region",
      value: billing.addressLevel1,
    },
    billingPostalCode: {
      selector: "#billing-postalCode",
      value: billing.postalCode,
    },
    billingCountryName: {
      selector: "#billing-countryName",
      value: billing.country,
    },
    billingPhoneNumber: {
      selector: "#billing-phoneNumber",
      value: "+" + phoneCodes.get(billing.country) + contact.tel,
    },
    billingEmail: {
      selector: "#billing-email",
      value: contact.email,
    },
    shippingGivenName: {
      selector: "#shipping-givenName",
      value: shipping.givenName,
    },
    shippingFamilyName: {
      selector: "#shipping-familyName",
      value: shipping.familyName,
    },
    shippingStreetAddress: {
      selector: "#shipping-streetAddress",
      value: shipping.addressLine1,
    },
    shippingExtendedAddress: {
      selector: "#shipping-extendedAddress",
      value: shipping.addressLine2,
    },
    shippingLocality: {
      selector: "#shipping-locality",
      value: shipping.addressLevel2,
    },
    shippingRegion: {
      selector: "#shipping-region",
      value: shipping.addressLevel1,
    },
    shippingPostalCode: {
      selector: "#shipping-postalCode",
      value: shipping.postalCode,
    },
    shippingCountryName: {
      selector: "#shipping-countryName",
      value: shipping.country,
    },
    shippingPhoneNumber: {
      selector: "#shipping-phoneNumber",
      value: "+" + phoneCodes.get(shipping.country) + contact.tel,
    },
  };

  waitForSelector("#sameAsBilling:enabled").then((sameAsBillingCheckbox) => {
    if (
      sameAsBillingCheckbox instanceof HTMLInputElement &&
      sameAsBillingCheckbox.checked
    ) {
      sameAsBillingCheckbox.click();
    }
  });

  waitForSelector("#address-suggestion-form").then((addressSuggestionForm) => {
    [
      addressSuggestionForm.querySelector("#billing-0"),
      addressSuggestionForm.querySelector("#shipping-0"),
      addressSuggestionForm.querySelector("button[type='submit']"),
    ].forEach((suggestedAddressField) => {
      if (suggestedAddressField instanceof HTMLInputElement) {
        if (!suggestedAddressField.checked) {
          suggestedAddressField.click();
        }
      } else if (suggestedAddressField instanceof HTMLButtonElement) {
        suggestedAddressField.click();
      }
    });
  });

  if (autocheckoutEnabled) {
    const billingAddressForm = await waitForSelector(
      "#billing-address-options-default, #billing-address-options-new, #billingForm"
    );

    switch (billingAddressForm.id) {
      case "billing-address-options-default":
        const defaultBillingButton = await waitForSelector(
          "button[aria-controls='billing-address-options-default']"
        );

        defaultBillingButton.click();
        break;

      case "billing-address-options-new":
        const newBillingButton = await waitForSelector(
          "button[aria-controls='billing-address-options-new']"
        );

        newBillingButton.click();

      case "billingForm":
        const billingFields = [
          fields.billingGivenName,
          fields.billingFamilyName,
          fields.billingStreetAddress,
          fields.billingExtendedAddress,
          fields.billingLocality,
          fields.billingRegion,
          fields.billingPostalCode,
          fields.billingCountryName,
          fields.billingPhoneNumber,
        ];

        if (billingAddressForm.querySelector(fields.billingEmail.selector)) {
          billingFields.push(fields.billingEmail);
        }

        for (const { selector, value } of billingFields) {
          await autofillSelector(selector, value, mode);
        }
    }

    const shippingAddressForm = await waitForSelector(
      "#shipping-address-options-default, #shipping-address-options-new, #shippingForm"
    );

    switch (shippingAddressForm.id) {
      case "shipping-address-options-default":
        const defaultShippingButton = await waitForSelector(
          "button[aria-controls='shipping-address-options-default']"
        );

        defaultShippingButton.click();
        break;

      case "shipping-address-options-new":
        const newShippingButton = await waitForSelector(
          "button[aria-controls='shipping-address-options-new']"
        );

        newShippingButton.click();

      case "shippingForm":
        const shippingFields = [
          fields.shippingGivenName,
          fields.shippingFamilyName,
          fields.shippingStreetAddress,
          fields.shippingExtendedAddress,
          fields.shippingLocality,
          fields.shippingRegion,
          fields.shippingPostalCode,
          fields.shippingCountryName,
          fields.shippingPhoneNumber,
        ];

        for (const { selector, value } of shippingFields) {
          await autofillSelector(selector, value, mode);
        }
    }

    const nextButton = await waitForSelector("button[value='Next']:enabled");
    nextButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isAddressActive = false;
}

async function payment(pokemonCenter, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = pokemonCenter;
  const { billing, contact, shipping } = profile;
  const fields = {
    shippingGivenName: {
      selector: "#shipping-givenName",
      value: shipping.givenName,
    },
    shippingFamilyName: {
      selector: "#shipping-familyName",
      value: shipping.familyName,
    },
    shippingStreetAddress: {
      selector: "#shipping-streetAddress",
      value: shipping.addressLine1,
    },
    shippingExtendedAddress: {
      selector: "#shipping-extendedAddress",
      value: shipping.addressLine2,
    },
    shippingLocality: {
      selector: "#shipping-locality",
      value: shipping.addressLevel2,
    },
    shippingRegion: {
      selector: "#shipping-region",
      value: shipping.addressLevel1,
    },
    shippingPostalCode: {
      selector: "#shipping-postalCode",
      value: shipping.postalCode,
    },
    shippingCountryName: {
      selector: "#shipping-countryName",
      value: shipping.country,
    },
    shippingPhoneNumber: {
      selector: "#shipping-phoneNumber",
      value: contact.tel,
    },
    billingGivenName: {
      selector: "#billing-givenName",
      value: billing.givenName,
    },
    billingFamilyName: {
      selector: "#billing-familyName",
      value: billing.familyName,
    },
    billingStreetAddress: {
      selector: "#billing-streetAddress",
      value: billing.addressLine1,
    },
    billingExtendedAddress: {
      selector: "#billing-extendedAddress",
      value: billing.addressLine2,
    },
    billingLocality: {
      selector: "#billing-locality",
      value: billing.addressLevel2,
    },
    billingRegion: {
      selector: "#billing-region",
      value: billing.addressLevel1,
    },
    billingPostalCode: {
      selector: "#billing-postalCode",
      value: billing.postalCode,
    },
    billingCountryName: {
      selector: "#billing-countryName",
      value: billing.country,
    },
    billingPhoneNumber: {
      selector: "#billing-phoneNumber",
      value: contact.tel,
    },
    billingEmail: {
      selector: "#billing-email",
      value: contact.email,
    },
    billingSelector: {
      selector: "#billing-selector",
      value: "credit-card",
    },
  };

  if (autocheckoutEnabled) {
    const paymentFields = [fields.billingSelector];

    for (const { selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode);
    }

    await waitForTimeout(1500);
    const nextButton = await waitForSelector("button[value='Next']:enabled");
    nextButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isPaymentActive = false;
}

async function summary(pokemonCenter) {
  isSummaryActive = true;

  const { autocheckoutEnabled } = pokemonCenter;

  if (autocheckoutEnabled) {
    const placeOrderButton = await waitForSelector(
      "button[value='Place Order']:enabled"
    );
    placeOrderButton.click();
  }

  isSummaryActive = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillPokemonCenter);
