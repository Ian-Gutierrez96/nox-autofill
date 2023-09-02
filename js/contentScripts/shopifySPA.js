"use strict";

// ============================================================================
// Variables
// ============================================================================

let isInformationActive = false;
let isShippingActive = false;
let isPaymentActive = false;
let isThankYouActive = false;

// ============================================================================
// Functions
// ============================================================================

/**
 * Evaluates which step of the Shopify checkout process the user is currently
 * on and runs the corresponding script if it isn't running already. The
 * current step is evaluated by retrieving the URL's pathname and stripping
 * the preceding backslash.
 * @param {any} message - String sent from either an extension process or a
 * content script.
 */
async function autofillShopify(message) {
  if (message.event === "tab-update") {
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
      const profile = profiles[shopify.profileKey];

      switch (
        location.pathname.substring(location.pathname.lastIndexOf("/") + 1)
      ) {
        case "information":
          if (!isInformationActive) {
            information(shopify, profile);
          }
          break;

        case "shipping":
          if (!isShippingActive) {
            shipping(shopify);
          }
          break;

        case "payment":
          if (!isPaymentActive) {
            payment(shopify, profile);
          }
          break;

        case "thank_you":
          if (!isThankYouActive) {
            thankYou(announcements, checkouts);
          }
          break;
      }
    }
  }
}

/**
 *
 * @param {Script} shopify - Object holding information regarding how Shopify's
 * content script should function, such as whether autofill/autocheckout are
 * enabled or how each field should be autofilled (click, fast, hover).
 * @param {Profile} profile - Object containing the personal information of the
 * profile selected for Shopify. The profile's information such as the
 * addresses or payment credentials are autofilled into Shopify's fields.
 */
async function information(shopify, profile) {
  isInformationActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = shopify;
  const { billing, contact, shipping } = profile;
  const fields = [
    {
      selector: "input[name='email']:not([data-honeypot])",
      value: contact.email,
    },
    {
      selector: "input[name='phone']:not([data-honeypot])",
      value: contact.tel,
    },
    {
      selector:
        "select[autocomplete*='shipping'][name='countryCode']:not([data-honeypot])",
      value: shipping.country,
    },
    {
      selector:
        "input[autocomplete*='shipping'][name='firstName']:not([data-honeypot])",
      value: shipping.givenName,
    },
    {
      selector:
        "input[autocomplete*='shipping'][name='lastName']:not([data-honeypot])",
      value: shipping.familyName,
    },
    {
      selector:
        "input[autocomplete*='shipping'][name='address1']:not([data-honeypot])",
      value: shipping.addressLine1,
    },
    {
      selector:
        "input[autocomplete*='shipping'][name='address2']:not([data-honeypot])",
      value: shipping.addressLine2,
    },
    {
      selector:
        "input[autocomplete*='shipping'][name='city']:not([data-honeypot])",
      value: shipping.addressLevel2,
    },
    {
      selector:
        "select[autocomplete*='shipping'][name='zone']:not([data-honeypot])",
      value: shipping.addressLevel1,
    },
    {
      selector:
        "input[autocomplete*='shipping'][name='postalCode']:not([data-honeypot])",
      value: shipping.postalCode,
    },
    {
      selector:
        "select[autocomplete*='billing'][name='countryCode']:not([data-honeypot])",
      value: billing.country,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='firstName']:not([data-honeypot])",
      value: billing.givenName,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='lastName']:not([data-honeypot])",
      value: billing.familyName,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='address1']:not([data-honeypot])",
      value: billing.addressLine1,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='address2']:not([data-honeypot])",
      value: billing.addressLine2,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='city']:not([data-honeypot])",
      value: billing.addressLevel2,
    },
    {
      selector:
        "select[autocomplete*='billing'][name='zone']:not([data-honeypot])",
      value: billing.addressLevel1,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='postalCode']:not([data-honeypot])",
      value: billing.postalCode,
    },
  ];

  if (autocheckoutEnabled) {
    // Wait until every field's been autofilled or 0.25 seconds has passed
    await Promise.race([
      ...fields.map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      ),
      waitForTimeout(250),
    ]);

    // Click the continue button once it's enabled
    const continueButton = await waitForSelector(
      "button[type='submit']:not(:disabled, [tabindex='-1'])"
    );
    continueButton.click();
  } else if (autofillEnabled) {
    // Wait until every field has been autofilled
    await Promise.all(
      fields.map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isInformationActive = false;
}

/**
 * Clicks the continue button if autocheckout is enabled for Shopify.
 * @param {Script} shopify - Object holding information regarding how Shopify's
 * content script should function, such as whether autofill/autocheckout are
 * enabled or how each field should be autofilled (click, fast, hover).
 */
async function shipping(shopify) {
  isShippingActive = true;

  const { autocheckoutEnabled } = shopify;

  if (autocheckoutEnabled) {
    // Click the continue button once it's enabled
    const continueButton = await waitForSelector(
      "button[type='submit']:not(:disabled, [tabindex='-1'])"
    );
    continueButton.click();
  }

  isShippingActive = false;
}

/**
 *
 * @param {Script} shopify
 * @param {Profile} profile
 */
async function payment(shopify, profile) {
  isPaymentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = shopify;
  const { billing, contact } = profile;
  const fields = [
    {
      selector: "input[name='phone']:not([data-honeypot])",
      value: contact.tel,
    },
    {
      selector:
        "select[autocomplete*='billing'][name='countryCode']:not([data-honeypot])",
      value: billing.country,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='firstName']:not([data-honeypot])",
      value: billing.givenName,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='lastName']:not([data-honeypot])",
      value: billing.familyName,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='address1']:not([data-honeypot])",
      value: billing.addressLine1,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='address2']:not([data-honeypot])",
      value: billing.addressLine2,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='city']:not([data-honeypot])",
      value: billing.addressLevel2,
    },
    {
      selector:
        "select[autocomplete*='billing'][name='zone']:not([data-honeypot])",
      value: billing.addressLevel1,
    },
    {
      selector:
        "input[autocomplete*='billing'][name='postalCode']:not([data-honeypot])",
      value: billing.postalCode,
    },
  ];

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
      const payNowButton = await waitForSelector(
        "button[type='submit']:not(:disabled, [tabindex='-1'])"
      );
      payNowButton.click();
    }
  } else if (autofillEnabled) {
    // Wait until every field's been autofilled
    await Promise.all(
      fields.map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isPaymentActive = false;
}

/**
 *
 * @param {MessageEvent<{ command: string }>} event - Message sent from
 * Shopify's payment gateway iframe indicating it has been autofilled.
 */
async function completePayment(event) {
  // Click the pay now button once it's enabled and the iframe's autofilled
  if (event.data.command === "complete_payment") {
    await waitForTimeout(250);
    const payNowButton = await waitForSelector(
      "button[type='submit']:not(:disabled, [tabindex='-1'])"
    );
    payNowButton.click();
  }
}

/**
 *
 * @param {Announcement[]} announcements
 * @param {Checkout[]} checkouts
 */
async function thankYou(announcements, checkouts) {
  const finalPriceElement = await waitForSelector(".total-recap__final-price");
  const currentDate = new Date();

  // Create and push a new successful announcement and checkout
  announcements.unshift({
    lines: [
      `A Shopify purchase was made on ${currentDate.toLocaleDateString()} at ${currentDate.toLocaleTimeString()}, congratulations!`,
      `The transaction was processed for ${location.hostname} costing a total price of ${finalPriceElement.textContent}. Remember to check your spamfolder for your order number.`,
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
chrome.runtime.onMessage.addListener(autofillShopify);
