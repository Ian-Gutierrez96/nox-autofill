"use strict";

// ============================================================================
// Main
// ============================================================================

autofillShopDisney();

// ============================================================================
// Functions
// ============================================================================

async function autofillShopDisney() {
  const {
    profiles,
    scripts: { shopDisney },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (shopDisney.autocheckoutEnabled || shopDisney.autofillEnabled) &&
    Object.hasOwn(profiles, shopDisney.profileKey)
  ) {
    const profile = profiles[shopDisney.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) {
          displayNotification(shopDisney);
        }
        break;

      case "/my-bag":
        myBag(shopDisney);
        break;

      case "/checkout":
        shipping(shopDisney, profile);
        payment(shopDisney);
        contact(shopDisney, profile);
        break;
    }
  }
}

function displayNotification(shopDisney) {
  const { autocheckoutEnabled } = shopDisney;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for shopDisney. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for shopDisney.",
  });
}

async function myBag(shopDisney) {
  const { autocheckoutEnabled } = shopDisney;

  if (autocheckoutEnabled) {
    const guestCheckout = await waitForSelector(
      ".cart-summary__checkout:not(.cart--mobile) a[data-events='scCheckout']:last-of-type:not(.disabledOnLoad)",
      { visible: true }
    );
    await waitForTimeout(1000);
    guestCheckout.click();
  }
}

async function shipping(shopDisney, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = shopDisney;
  const { contact, shipping } = profile;
  const fields = {
    shippingCountry: {
      options: { polling: { visible: true } },
      selector: ".shipping-form select[name$='_country']",
      value: shipping.country,
    },
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: ".shipping-form input[name$='_firstName']",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: ".shipping-form input[name$='_lastName']",
      value: shipping.familyName,
    },
    shippingAddress1: {
      options: { polling: { visible: true } },
      selector: ".shipping-form input[name$='_address1']",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: ".shipping-form input[name$='_address2']",
      value: shipping.addressLine2,
    },
    shippingPostalCode: {
      options: { polling: { visible: true } },
      selector: ".shipping-form input[name$='_postalCode']",
      value: shipping.postalCode,
    },
    shippingCity: {
      options: { polling: { visible: true } },
      selector: ".shipping-form input[name$='_city']",
      value: shipping.addressLevel2,
    },
    shippingStateCodeInput: {
      options: { polling: { visible: true } },
      selector: ".shipping-form input[name$='_stateCode']",
      value: firstAdministrativeLevels.has(shipping.country)
        ? firstAdministrativeLevels
            .get(shipping.country)
            .get(shipping.addressLevel1)
        : shipping.addressLevel1,
    },
    shippingStateCodeSelect: {
      options: { polling: { visible: true } },
      selector: ".shipping-form select[name$='_stateCode']",
      value: shipping.addressLevel1,
    },
    shippingPhone: {
      options: { polling: { visible: true } },
      selector: ".shipping-form input[name$='_phone']",
      value: contact.tel,
    },
  };

  waitForSelector("#address__confirm").then((confirmAddressButton) =>
    confirmAddressButton.click()
  );

  if (autocheckoutEnabled) {
    const shippingForm = await waitForSelector("#dwfrm_shipping", {
      visible: true,
    });

    if (shippingForm.querySelector(".shipping-address-block:not(.d-none)")) {
      const shippingFields = [
        fields.shippingCountry,
        fields.shippingFirstName,
        fields.shippingLastName,
        fields.shippingAddress1,
        fields.shippingAddress2,
        fields.shippingPostalCode,
        fields.shippingCity,
        fields.shippingPhone,
      ];

      switch (shipping.country) {
        case "CA":
        case "US":
          shippingFields.push(fields.shippingStateCodeSelect);
          break;

        default:
          shippingFields.push(fields.shippingStateCodeInput);
          break;
      }

      await waitForTimeout(500);
      for (const { options, selector, value } of shippingFields) {
        await autofillSelector(selector, value, mode, options);
      }
    }

    await waitForTimeout(500);
    const submitShipping = await waitForSelector(
      ".submit-shipping:not(:disabled)",
      { visible: true }
    );
    submitShipping.click();
  } else if (autofillEnabled) {
    await waitForTimeout(500);
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function payment(shopDisney) {
  const { autocheckoutEnabled } = shopDisney;

  if (autocheckoutEnabled) {
    const submitPayment = await waitForSelector(
      ".submit-payment:not(:disabled)",
      { visible: true }
    );
    submitPayment.click();
  }
}

async function contact(shopDisney, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = shopDisney;
  const { billing, contact } = profile;
  const fields = {
    contactFirstName: {
      options: { polling: { visible: true } },
      selector: ".contact-form input[name$='_firstName']",
      value: billing.givenName,
    },
    contactLastName: {
      options: { polling: { visible: true } },
      selector: ".contact-form input[name$='_lastName']",
      value: billing.familyName,
    },
    contactPhone: {
      options: { polling: { visible: true } },
      selector: ".contact-form input[name$='_phone']",
      value: contact.tel,
    },
    contactEmail: {
      options: { polling: { visible: true } },
      selector: ".contact-form input[name$='_email']",
      value: contact.email,
    },
  };

  if (autocheckoutEnabled) {
    const contactFields = [
      fields.contactFirstName,
      fields.contactLastName,
      fields.contactPhone,
      fields.contactEmail,
    ];

    for (const { options, selector, value } of contactFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const checkoutButton = await waitForSelector(
      ".checkout-button:not(:disabled)",
      { visible: true }
    );
    checkoutButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}
