"use strict";

// ============================================================================
// Main
// ============================================================================

autofillShopify();

// ============================================================================
// Functions
// ============================================================================

async function autofillShopify() {
  const {
    announcements,
    checkouts,
    profiles,
    scripts: { shopify },
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
    (shopify.autocheckoutEnabled || shopify.autofillEnabled) &&
    Object.hasOwn(profiles, shopify.profileKey)
  ) {
    const dataStepElement = document.querySelector("[data-step]");
    const profile = profiles[shopify.profileKey];

    if (dataStepElement instanceof HTMLElement) {
      switch (dataStepElement.dataset.step) {
        case "contact_information":
          contactInformation(shopify, profile);
          break;

        case "shipping_method":
          shippingMethod(shopify);
          break;

        case "payment_method":
          paymentMethod(shopify, profile);
          break;

        case "review":
          review(shopify);
          break;

        case "thank_you":
          thankYou(announcements, checkouts);
          break;
      }
    }
  }
}

/**
 * Autofill the fields displayed in Shopify's contact information step of the
 * checkout process. If autocheckout is enabled, the content script will wait
 * for every field to be autofilled or 0.25 seconds has passed; after doing so,
 * the continue button will be pressed so the user is transferred to the
 * shipping method step.
 * @param {Script} shopify - Object holding information regarding how Shopify's
 * content script should function, such as whether autofill/autocheckout are
 * enabled or how each field should be autofilled (click, fast, hover).
 * @param {Profile} profile - Object containing the personal information of the
 * profile selected for Shopify. The profile's information such as the
 * addresses or payment credentials are autofilled into Shopify's fields.
 */
async function contactInformation(shopify, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = shopify;
  const { billing, contact, shipping } = profile;
  const fields = [
    {
      options: { polling: { visible: true } },
      selector: "#checkout_email, #checkout_email_or_phone",
      value: contact.email,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_country",
      value: countries.get(shipping.country),
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_first_name",
      value: shipping.givenName,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_last_name",
      value: shipping.familyName,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_address1",
      value: shipping.addressLine1,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_address2",
      value: shipping.addressLine2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_city",
      value: shipping.addressLevel2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_province",
      value: shipping.addressLevel1,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_zip",
      value: shipping.postalCode,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_shipping_address_phone",
      value: contact.tel,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_country",
      value: countries.get(billing.country),
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_first_name",
      value: billing.givenName,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_last_name",
      value: billing.familyName,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_address1",
      value: billing.addressLine1,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_address2",
      value: billing.addressLine2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_city",
      value: billing.addressLevel2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_province",
      value: billing.addressLevel1,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_zip",
      value: billing.postalCode,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_phone",
      value: contact.tel,
    },
  ];

  if (autocheckoutEnabled) {
    // Wait until every field has been autofilled or 0.25 seconds has passed
    await Promise.race([
      ...fields.map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      ),
      waitForTimeout(250),
    ]);

    // Click the continue button once it's enabled
    const continueButton = await waitForSelector(
      "#continue_button:not(:disabled)"
    );
    continueButton.click();
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
 * Clicks the continue button displayed in Shopify's shipping method step of
 * the checkout process if autocheckout is enabled.
 * @param {Script} shopify - Object holding information regarding how Shopify's
 * content script should function, such as whether autofill/autocheckout are
 * enabled or how each field should be autofilled (click, fast, hover).
 */
async function shippingMethod(shopify) {
  const { autocheckoutEnabled } = shopify;

  if (autocheckoutEnabled) {
    // Click the continue button once it's enabled
    const continueButton = await waitForSelector(
      "#continue_button:not(:disabled)"
    );
    continueButton.click();
  }
}

/**
 * Autofill the fields displayed in Shopify's payment method step of the
 * checkout process if autocheckout or autofill are enabled. Rather than
 * clicking the continue button, an event handler attached to the window
 * presses the button once a "complete_payment" event has been fired from
 * the payment gateway.
 * @param {Script} shopify - Object holding information regarding how Shopify's
 * content script should function, such as whether autofill/autocheckout are
 * enabled or how each field should be autofilled (click, fast, hover).
 * @param {Profile} profile - Object containing the personal information of the
 * profile selected for Shopify. The profile's information such as the
 * addresses or payment credentials are autofilled into Shopify's fields.
 */
async function paymentMethod(shopify, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = shopify;
  const { billing, contact } = profile;
  const fields = [
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_country",
      value: countries.get(billing.country),
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_first_name",
      value: billing.givenName,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_last_name",
      value: billing.familyName,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_address1",
      value: billing.addressLine1,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_address2",
      value: billing.addressLine2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_city",
      value: billing.addressLevel2,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_province",
      value: billing.addressLevel1,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_zip",
      value: billing.postalCode,
    },
    {
      options: { polling: { visible: true } },
      selector: "#checkout_billing_address_phone",
      value: contact.tel,
    },
  ];

  // Check the billing is different than shipping checkbox
  waitForSelector("#checkout_different_billing_address_true").then(
    (billingAddressCheckbox) => {
      if (billingAddressCheckbox instanceof HTMLInputElement) {
        if (!billingAddressCheckbox.checked) {
          billingAddressCheckbox.click();
        }
      }
    }
  );

  // Check the custom billing address checkbox
  waitForSelector("#billing_address_selector-custom_billing_address").then(
    (customBillingAddress) => {
      if (customBillingAddress instanceof HTMLInputElement) {
        if (!customBillingAddress.checked) {
          customBillingAddress.click();
        }
      }
    }
  );

  // Check the agree to terms and services checkbox
  waitForSelector("#i-agree-terms__checkbox").then((iAgreeTermsCheckbox) => {
    if (iAgreeTermsCheckbox instanceof HTMLInputElement) {
      if (!iAgreeTermsCheckbox.checked) {
        iAgreeTermsCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const iframeSelectors = [
      "iframe[id^='card-fields-number']",
      "iframe[id^='card-fields-name']",
      "iframe[id^='card-fields-verification_value']",
    ];

    // Wait until every field's been autofilled or 0.25 seconds has passed
    await Promise.race([
      ...fields.map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      ),
      waitForTimeout(250),
    ]);

    // Click the continue button once it's enabled and if no iframes exist
    if (!iframeSelectors.some((selector) => document.querySelector(selector))) {
      const continueButton = await waitForSelector(
        "#continue_button:not(:disabled)"
      );
      continueButton.click();
    }
  } else if (autofillEnabled) {
    // Wait until every field's been autofilled
    await Promise.all(
      fields.map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }
}

/**
 *
 * @param {MessageEvent<{ command: string }>} event - Message sent from
 * Shopify's payment gateway iframe indicating it has been autofilled.
 */
async function completePayment(event) {
  // Click the continue button once it's enabled and the iframe's autofilled
  if (event.data.command === "complete_payment") {
    await waitForTimeout(250);
    const continueButton = await waitForSelector(
      "#continue_button:not(:disabled)",
      { visible: true }
    );
    continueButton.click();
  }
}

/**
 *
 * @param {Script} shopify
 */
async function review(shopify) {
  const { autocheckoutEnabled } = shopify;

  if (autocheckoutEnabled) {
    // Click the continue button once it's enabled
    const continueButton = await waitForSelector(
      "#continue_button:not(:disabled)"
    );
    continueButton.click();
  }
}

/**
 *
 * @param {Announcement[]} announcements
 * @param {Checkout[]} checkouts
 */
async function thankYou(announcements, checkouts) {
  const [finalPriceElement, vendorNameElement] = await Promise.all([
    waitForSelector(".total-recap__final-price"),
    waitForSelector(".logo__text"),
  ]);
  const currentDate = new Date();

  // Create and push a new successful announcement and checkout
  announcements.unshift({
    lines: [
      `A Shopify purchase was made on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}, congratulations!`,
      `The transaction was processed for ${vendorNameElement.textContent} costing a total price of ${finalPriceElement.textContent}. Remember to check your spamfolder for your order number.`,
    ],
    theme: "success",
    title: "Checkout",
  });
  checkouts.push({
    productPrice: Number(finalPriceElement.textContent.replace(/[^0-9.]/g, "")),
    purchaseDate: currentDate.toISOString(),
    wasSuccessful: true,
  });

  // Update the checkout and announcements array in Chrome's storage
  await chrome.storage.local.set({ announcements, checkouts });
}

// ============================================================================
// Event Listeners
// ============================================================================

window.addEventListener("message", completePayment);
