"use strict";

// ============================================================================
// Main
// ============================================================================

autofillStripeCheckout();

// ============================================================================
// Functions
// ============================================================================

async function autofillStripeCheckout() {
  const {
    announcements,
    checkouts,
    profiles,
    scripts: { stripe },
    settings: { blacklistedSites },
  } = await chrome.storage.local.get([
    "announcements",
    "checkouts",
    "profiles",
    "scripts",
    "settings",
  ]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (stripe.autocheckoutEnabled || stripe.autofillEnabled) &&
    Object.hasOwn(profiles, stripe.profileKey)
  ) {
    const profile = profiles[stripe.profileKey];

    switch (location.pathname) {
      default:
        checkout(stripe, profile);
        webhook(announcements, checkouts);
        break;
    }
  }
}

/**
 *
 * @param {Script} stripe - Object holding information regarding how Stripe's
 * content script should function, such as whether autofill/autocheckout are
 * enabled or how each field should be autofilled (click, fast, hover).
 * @param {Profile} profile - Object containing the personal information of the
 * profile selected for Stripe. The profile's information such as the addresses
 * or payment credentials are autofilled into Stripe's fields.
 */
async function checkout(stripe, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = stripe;
  const { contact, billing, payment, shipping } = profile;
  const fields = [
    {
      options: { polling: { visible: true } },
      selector: "#email",
      value: contact.email,
    },
    {
      options: { polling: { visible: true } },
      selector: "#shippingName",
      value: shipping.givenName + " " + shipping.familyName,
    },
    {
      options: { polling: { visible: true } },
      selector: "#shippingCountry",
      value: shipping.country,
    },
    {
      options: { polling: { visible: true } },
      selector: "#shippingAddressLine1",
      value: shipping.addressLine1,
    },
    {
      options: { polling: { visible: true } },
      selector: "#shippingAddressLine2",
      value: shipping.addressLine2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#shippingLocality",
      value: shipping.addressLevel2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#shippingPostalCode",
      value: shipping.postalCode,
    },
    {
      options: { polling: { visible: true } },
      selector: "#shippingAdministrativeArea",
      value: getAddressLevel1Value(shipping.country, shipping.addressLevel1),
    },
    {
      options: { polling: { visible: true } },
      selector: "#phoneNumber",
      value: contact.tel,
    },
    {
      options: { polling: { visible: true } },
      selector: "#cardNumber",
      value: payment.ccNumber,
    },
    {
      options: { polling: { visible: true } },
      selector: "#cardExpiry",
      value: payment.ccExpMonth.padStart(2, "0") + " / " + payment.ccExpYear,
    },
    {
      options: { polling: { visible: true } },
      selector: "#cardCvc",
      value: payment.ccCSC,
    },
    {
      options: { polling: { visible: true } },
      selector: "#billingName",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    {
      options: { polling: { visible: true } },
      selector: "#billingCountry",
      value: billing.country,
    },
    {
      options: { polling: { visible: true } },
      selector: "#billingAddressLine1",
      value: billing.addressLine1,
    },
    {
      options: { polling: { visible: true } },
      selector: "#billingAddressLine2",
      value: billing.addressLine2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#billingLocality",
      value: billing.addressLevel2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#billingPostalCode",
      value: billing.postalCode,
    },
    {
      options: { polling: { visible: true } },
      selector: "#billingAdministrativeArea",
      value: getAddressLevel1Value(billing.country, billing.addressLevel1),
    },
  ];

  // Click the button to open the shipping's 2nd address line
  waitForSelector(".ShippingForm .AddressAutocomplete-manual-entry > button", {
    visible: true,
  }).then((manualShippingAddressButton) => manualShippingAddressButton.click());

  // Click the button to open the billing's 2nd address line
  waitForSelector(
    ".BillingAddressForm-addressInput .AddressAutocomplete-manual-entry > button",
    { visible: true }
  ).then((manualBillingAddressButton) => manualBillingAddressButton.click());

  // Uncheck the billing is the same as shipping checkbox
  waitForSelector("#cardUseShippingAsBilling", { visible: true }).then(
    (cardUseShippingAsBilling) => {
      if (cardUseShippingAsBilling instanceof HTMLInputElement) {
        if (cardUseShippingAsBilling.checked) {
          cardUseShippingAsBilling.click();
        }
      }
    }
  );

  if (autocheckoutEnabled) {
    // Wait until every field's been autofilled or 1.5 seconds has passed
    await Promise.race([
      ...fields.map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      ),
      waitForTimeout(1500),
    ]);

    // Click the submit payment button once it's enabled
    const paymentSubmitButton = await waitForSelector(
      ".SubmitButton:not(.SubmitButton--incomplete)"
    );
    paymentSubmitButton.click();
  } else if (autofillEnabled) {
    // Wait until every field has been autofilled
    await Promise.all(
      fields.map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

/**
 *
 * @param {Announcement[]} announcements
 * @param {Checkout[]} checkouts
 */
async function webhook(announcements, checkouts) {
  // Wait until the item has been successfully checked out
  await waitForSelector(".SubmitButton--success");

  const totalAmountElement = await waitForSelector(
    "#ProductSummary-totalAmount"
  );
  const currentDate = new Date();

  // Create and push a new successful announcement and checkout
  announcements.unshift({
    lines: [
      `A Stripe purchase was made on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}, congratulations!`,
      `The transaction was processed for ${document.title} costing a total price ${totalAmountElement.textContent}. Remember to check your spamfolder for your order number.`,
    ],
    theme: "success",
    title: "Checkout",
  });
  checkouts.push({
    productPrice: Number(
      totalAmountElement.textContent.replace(/[^0-9.]/g, "")
    ),
    purchaseDate: currentDate.toISOString(),
    wasSuccessful: true,
  });

  // Update the checkout and announcements array in Chrome's storage
  await chrome.storage.local.set({ announcements, checkouts });
}

/**
 *
 * @param {string} country
 * @param {string} addressLevel1
 * @returns {string}
 */
function getAddressLevel1Value(country, addressLevel1) {
  return ["HK", "IN", "IE", "MY", "MX"].includes(country)
    ? firstAdministrativeLevels.get(country).get(addressLevel1)
    : addressLevel1;
}
