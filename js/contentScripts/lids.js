"use strict";

// ============================================================================
// Main
// ============================================================================

autofillLids();

// ============================================================================
// Functions
// ============================================================================

async function autofillLids() {
  const {
    profiles,
    scripts: { lids },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (lids.autocheckoutEnabled || lids.autofillEnabled) &&
    Object.hasOwn(profiles, lids.profileKey)
  ) {
    const profile = profiles[lids.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) {
          displayNotification(lids);
        }
        break;

      case "/cart":
        cart(lids);
        break;

      case "/shipping":
        shipping(lids, profile);
        break;

      case "/payment":
        payment(lids, profile);
        break;
    }
  }
}

function displayNotification(lids) {
  const { autocheckoutEnabled } = lids;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Lids. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Lids.",
  });
}

async function cart(lids) {
  const { autocheckoutEnabled } = lids;

  if (autocheckoutEnabled) {
    const buttonCheckoutCart = await waitForSelector(
      "button[data-talos='buttonCheckoutCart']"
    );
    buttonCheckoutCart.click();
  }
}

async function shipping(lids, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = lids;
  const { contact, shipping } = profile;
  const fields = {
    textShippingFirstName: {
      selector: "input#firstName",
      value: shipping.givenName,
    },
    textShippingLastName: {
      selector: "input#lastName",
      value: shipping.familyName,
    },
    textShippingEmail: {
      selector: "input#email",
      value: contact.email,
    },
    textShippingPhone: {
      selector: "input#phone",
      value: contact.tel,
    },
    textShippingAddress1: {
      selector: "input#addressLine1",
      value: shipping.addressLine1,
    },
    textShippingAddress2: {
      selector: "input#addressLine2",
      value: shipping.addressLine2,
    },
    dropdownShippingCountry: {
      selector: "select#country",
      value: shipping.country,
    },
    textShippingZip: {
      selector: "input#postalCode",
      value: shipping.postalCode,
    },
    textShippingCity: {
      selector: "input#city",
      value: shipping.addressLevel2,
    },
    shippingState: {
      selector: "input#state",
      value: firstAdministrativeLevels.has(shipping.country)
        ? firstAdministrativeLevels
            .get(shipping.country)
            .get(shipping.addressLevel1)
        : shipping.addressLevel1,
    },
    dropdownShippingState: {
      selector: "select#state",
      value: shipping.addressLevel1,
    },
  };

  if (autocheckoutEnabled) {
    const shippingFields = [
      fields.textShippingFirstName,
      fields.textShippingLastName,
      fields.textShippingEmail,
      fields.textShippingPhone,
      fields.textShippingAddress1,
      fields.textShippingAddress2,
      fields.dropdownShippingCountry,
      fields.textShippingZip,
      fields.textShippingCity,
    ];

    switch (shipping.country) {
      case "CA":
      case "US":
        shippingFields.push(fields.dropdownShippingState);
        break;

      default:
        shippingFields.push(fields.shippingState);
        break;
    }

    for (const { selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode);
    }

    const buttonContinueCheckout = await waitForSelector(
      "button[data-talos='buttonContinueCheckout']"
    );
    buttonContinueCheckout.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }
}

async function payment(lids, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = lids;
  const { billing, contact, payment } = profile;
  const fields = {
    textCardNumber: {
      selector: "input#card_number",
      value: payment.ccNumber,
    },
    dropdownExpirationMonth: {
      selector: "select#exp_month",
      value: payment.ccExpMonth.padStart(2, "0"),
    },
    dropdownExpirationYear: {
      selector: "select#exp_year",
      value: "20" + payment.ccExpYear,
    },
    textCVV2: {
      selector: "input#cvvNumber",
      value: payment.ccCSC,
    },
    textBillingFirstName: {
      selector: "input#firstName",
      value: billing.givenName,
    },
    textBillingLastName: {
      selector: "input#lastName",
      value: billing.familyName,
    },
    textBillingEmail: {
      selector: "input#email",
      value: contact.email,
    },
    textBillingAddress1: {
      selector: "input#addressLine1",
      value: billing.addressLine1,
    },
    textBillingAddress2: {
      selector: "input#addressLine2",
      value: billing.addressLine2,
    },
    dropdownBillingCountry: {
      selector: "select#country",
      value: billing.country,
    },
    textBillingZip: {
      selector: "input#postalCode",
      value: billing.postalCode,
    },
    textBillingCity: {
      selector: "input#city",
      value: billing.addressLevel2,
    },
    textBillingState: {
      selector: "input#state",
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
    },
    dropdownBillingState: {
      selector: "select#state",
      value: billing.addressLevel1,
    },
    textBillingPhone: {
      selector: "input#phone",
      value: contact.tel,
    },
  };

  waitForSelector("#billing-address").then((checkboxShipToBillingAddress) => {
    if (checkboxShipToBillingAddress instanceof HTMLInputElement) {
      if (checkboxShipToBillingAddress.checked) {
        checkboxShipToBillingAddress.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const paymentFields = [
      fields.dropdownExpirationMonth,
      fields.dropdownExpirationYear,
      fields.textBillingFirstName,
      fields.textBillingLastName,
      fields.textBillingEmail,
      fields.textBillingAddress1,
      fields.textBillingAddress2,
      fields.dropdownBillingCountry,
      fields.textBillingZip,
      fields.textBillingCity,
      fields.dropdownBillingState,
      fields.textBillingPhone,
    ];

    switch (billing.country) {
      case "CA":
      case "US":
        paymentFields.push(fields.dropdownBillingState);
        break;

      default:
        paymentFields.push(fields.textBillingState);
        break;
    }

    for (const { selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode);
    }

    await Promise.all(
      ["#number-container > iframe", "#cvv-container > iframe"].map(
        (selector) => waitForSelector(selector)
      )
    );

    await waitForTimeout(2000);
    const buttonCompleteOrder = await waitForSelector(
      "button[data-talos='buttonCompleteOrder']"
    );
    buttonCompleteOrder.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }
}
