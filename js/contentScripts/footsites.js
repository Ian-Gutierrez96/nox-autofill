"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isContactInfoActive = false;
let isPackageOptionsActive = false;
let isPaymentActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillFootsite(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts,
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);
    const footsite = Object.values(scripts).find(
      (script) => script.origin === location.origin
    );

    if (
      !blacklistedSites.includes(location.origin) &&
      (footsite.autocheckoutEnabled || footsite.autofillEnabled) &&
      Object.hasOwn(profiles, footsite.profileKey)
    ) {
      const profile = profiles[footsite.profileKey];

      switch (location.pathname) {
        case "/":
          if (notifications) {
            displayNotification(footsite);
          }
          break;

        case "/cart":
          if (!isCartActive) {
            cart(footsite);
          }
          break;

        case "/checkout":
        case "/checkout.html":
          if (!isContactInfoActive) {
            contactInformation(footsite, profile);
          }

          if (!isPackageOptionsActive) {
            packageOptions(footsite, profile);
          }

          if (!isPaymentActive) {
            payment(footsite, profile);
          }
          break;
      }
    }
  }
}

function displayNotification(footsite) {
  const { autocheckoutEnabled } = footsite;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for this Footsite. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for this Footsite.",
  });
}

async function cart(footsite) {
  isCartActive = true;

  const { autocheckoutEnabled } = footsite;

  if (autocheckoutEnabled) {
    const checkoutBtn = await waitForSelector("a[href='/checkout']");
    checkoutBtn.click();
  }

  isCartActive = false;
}

async function contactInformation(footsite, profile) {
  isContactInfoActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = footsite;
  const { contact, shipping } = profile;
  const fields = {
    contactFirstName: {
      selector: "#ContactInfo_text_firstName, #ContactInfo #firstName",
      value: shipping.givenName,
    },
    contactLastName: {
      selector: "#ContactInfo_text_lastName, #ContactInfo #lastName",
      value: shipping.familyName,
    },
    contactEmail: {
      selector: "#ContactInfo_email_email, #ContactInfo #email",
      value: contact.email,
    },
    contactPhone: {
      selector: "#ContactInfo_tel_phone, #ContactInfo #phone",
      value: contact.tel,
    },
    contactCountry: {
      selector: "#ContactInfo_select_country, #ContactInfo #phoneCountry",
      value: shipping.country,
    },
  };

  if (autocheckoutEnabled) {
    const contactInfoFields = [
      fields.contactFirstName,
      fields.contactLastName,
      fields.contactEmail,
      fields.contactPhone,
      fields.contactCountry,
    ];

    for (const { selector, value } of contactInfoFields) {
      await autofillSelector(selector, value, mode);
    }

    const continueBtn = await waitForSelector(
      "#ContactInfo button[type='submit']"
    );
    continueBtn.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isContactInfoActive = false;
}

async function packageOptions(footsite, profile) {
  isPackageOptionsActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = footsite;
  const { shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector: "#ShippingAddress_text_firstName, #ShippingProducts #firstName",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector: "#ShippingAddress_text_lastName, #ShippingProducts #lastName",
      value: shipping.familyName,
    },
    shippingLine1: {
      selector: "#ShippingAddress_text_line1, #ShippingProducts #line1",
      value: shipping.addressLine1,
    },
    shippingLine2: {
      selector: "#ShippingAddress_text_line2, #ShippingProducts #line2",
      value: shipping.addressLine2,
    },
    shippingPostalCode: {
      selector:
        "#ShippingAddress_text_postalCode, #ShippingProducts #postalCode",
      value: shipping.postalCode,
    },
    shippingTown: {
      selector: "#ShippingAddress_text_town, #ShippingProducts #city",
      value: shipping.addressLevel2,
    },
    shippingRegion: {
      selector:
        "#ShippingAddress_select_region, #ShippingProducts #regionIsocodeShort",
      value: shipping.addressLevel1,
    },
    pickupFirstName: {
      selector: "#PickupPerson_text_firstName, #PickupProducts #firstName",
      value: shipping.givenName,
    },
    pickupLastName: {
      selector: "#PickupPerson_text_lastName, #PickupProducts #lastName",
      value: shipping.familyName,
    },
  };

  if (autocheckoutEnabled) {
    const packageOptions = await waitForSelector(
      "#ShippingProducts, #PickupProducts"
    );

    switch (packageOptions.id) {
      case "ShippingProducts":
        const shippingProductsFields = [
          fields.shippingFirstName,
          fields.shippingLastName,
          fields.shippingLine1,
          fields.shippingLine2,
          fields.shippingPostalCode,
          fields.shippingTown,
          fields.shippingRegion,
        ];

        for (const { selector, value } of shippingProductsFields) {
          await autofillSelector(selector, value, mode);
        }
        break;

      case "PickupProducts":
        const pickupProductsFields = [
          fields.pickupFirstName,
          fields.pickupLastName,
        ];

        for (const { selector, value } of pickupProductsFields) {
          await autofillSelector(selector, value, mode);
        }
        break;
    }

    await waitForTimeout(500);
    const continueButton = await waitForSelector(
      ":is(#ShippingProducts, #PickupProducts) + div button"
    );
    continueButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isPackageOptionsActive = false;
}

async function payment(footsite, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = footsite;
  const { billing } = profile;
  const fields = {
    billingCountry: {
      selector:
        "#BillingAddress_select_country, #step3_payment #countryIsocode",
      value: billing.country,
    },
    billingFirstName: {
      selector: "#BillingAddress_text_firstName, #step3_payment #firstName",
      value: billing.givenName,
    },
    billingLastName: {
      selector: "#BillingAddress_text_lastName, #step3_payment #lastName",
      value: billing.familyName,
    },
    billingLogateSearch: {
      selector: "#BillingAddress_search_LoqateSearch",
      value: billing.addressLine1,
    },
    billingLine1: {
      selector: "#BillingAddress_text_line1, #step3_payment #line1",
      value: billing.addressLine1,
    },
    billingLine2: {
      selector: "#BillingAddress_text_line2, #step3_payment #line2",
      value: billing.addressLine2,
    },
    billingPostalCode: {
      selector: "#BillingAddress_text_postalCode, #step3_payment #postalCode",
      value: billing.postalCode,
    },
    billingTown: {
      selector: "#BillingAddress_text_town, #step3_payment #city",
      value: billing.addressLevel2,
    },
    billingRegion: {
      selector:
        "#BillingAddress_select_region, #step3_payment #regionIsocodeShort",
      value: billing.addressLevel1,
    },
  };

  waitForSelector(
    "#SetBillingAsShipping_checkbox_sameAsShipping, #isBilling"
  ).then((billingCheckbox) => {
    if (billingCheckbox instanceof HTMLInputElement) {
      if (billingCheckbox.checked) {
        billingCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const checkoutPayments = await waitForSelector(".Checkout-payments");

    if (checkoutPayments.querySelector(".Heading ~ form")) {
      const billingFields = [
        fields.billingCountry,
        fields.billingFirstName,
        fields.billingLastName,
        fields.billingLine1,
        fields.billingLine2,
        fields.billingPostalCode,
        fields.billingTown,
      ];

      switch (billing.country) {
        case "CA":
        case "US":
          billingFields.push(fields.billingRegion);
          break;
      }

      for (const { selector, value } of billingFields) {
        await autofillSelector(selector, value, mode);
      }

      await waitForTimeout(500);
      const submitBillingButton = await waitForSelector(
        ":is(#BillingAddress, #step3_payment form) button[type='submit']"
      );
      submitBillingButton.click();
    }

    const placeOrderButton = await waitForSelector(
      ".PlaceOrder > button:enabled"
    );
    placeOrderButton.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isPaymentActive = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillFootsite);
