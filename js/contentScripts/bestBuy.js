"use strict";

// ============================================================================
// Variables
// ============================================================================

let isCartActive = false;
let isFullfillmentActive = false;
let isDeliveryActive = false;
let isPaymentProcessing = false;
let isSignInActive = false;

// ============================================================================
// Functions
// ============================================================================

async function autofillBestBuy(message) {
  if (message.event === "tab-update") {
    const {
      profiles,
      scripts: { bestBuy },
      settings: { blacklistedSites, notifications },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.origin) &&
      (bestBuy.autocheckoutEnabled || bestBuy.autofillEnabled) &&
      Object.hasOwn(profiles, bestBuy.profileKey)
    ) {
      const profile = profiles[bestBuy.profileKey];

      switch (location.pathname) {
        case "/":
          if (notifications) {
            displayNotification(bestBuy);
          }
          break;

        case "/cart":
          if (!isCartActive) {
            cart(bestBuy);
          }
          break;

        case "/identity/signin":
          if (!isSignInActive) {
            signIn(bestBuy);
          }
          break;

        case "/checkout/r/fulfillment":
          if (!isFullfillmentActive) {
            fullfillment(bestBuy, profile);
          }
          break;

        case "/checkout/r/delivery":
          if (!isDeliveryActive) {
            delivery(bestBuy);
          }
          break;

        case "/checkout/r/payment":
          if (!isPaymentProcessing) {
            payment(bestBuy, profile);
          }
          break;
      }
    }
  }
}

function displayNotification(bestBuy) {
  const { autocheckoutEnabled } = bestBuy;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Best Buy. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Best Buy.",
  });
}

async function cart(bestBuy) {
  isCartActive = true;

  const { autocheckoutEnabled } = bestBuy;

  if (autocheckoutEnabled) {
    const checkoutButton = await waitForSelector(
      ".checkout-buttons__checkout > button"
    );
    checkoutButton.click();
  }

  isCartActive = false;
}

async function signIn(bestBuy) {
  isSignInActive = true;

  const { autocheckoutEnabled } = bestBuy;

  if (autocheckoutEnabled) {
    const continueAsGuest = await waitForSelector(
      "button.cia-guest-content__continue"
    );
    continueAsGuest.click();
  }

  isSignInActive = false;
}

async function fullfillment(bestBuy, profile) {
  isFullfillmentActive = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = bestBuy;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector: ".address-form input[name='firstName']",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector: ".address-form input[name='lastName']",
      value: shipping.familyName,
    },
    shippingStreet: {
      selector: ".address-form input[name='street']",
      value: shipping.addressLine1,
    },
    shippingStreet2: {
      selector: ".address-form input[name='street2']",
      value: shipping.addressLine2,
    },
    shippingCity: {
      selector: ".address-form input[name='city']",
      value: shipping.addressLevel2,
    },
    shippingState: {
      selector: ".address-form select[name='state']",
      value: shipping.addressLevel1,
    },
    shippingZipcode: {
      selector: ".address-form input[name='zipcode']",
      value: shipping.postalCode,
    },
    contactEmailAddress: {
      selector: ".contact-information input[id='user.emailAddress']",
      value: contact.email,
    },
    contactPhone: {
      selector: ".contact-information input[id='user.phone']",
      value: contact.tel,
    },
  };

  if (autocheckoutEnabled) {
    // Iterate through every single address manager on the page
    for (const addressesManager of document.querySelectorAll(
      ".addresses-manager"
    )) {
      if (addressesManager.querySelector(".address-form")) {
        // Click the button to show the address line 2 input
        waitForSelector("button.address-form__showAddress2Link", {
          parent: addressesManager,
        }).then((showAddress2Link) => showAddress2Link.click());

        // Autofill every single shipping field in the address form
        const shippingFields = [
          fields.shippingFirstName,
          fields.shippingLastName,
          fields.shippingStreet,
          fields.shippingStreet2,
          fields.shippingCity,
          fields.shippingState,
          fields.shippingZipcode,
        ];

        for (const { selector, value } of shippingFields) {
          await autofillSelector(selector, value, mode, {
            polling: { parent: addressesManager },
          });
        }

        // Make sure that the billing is not the same as the shipping
        const useAsBillingAddress = await waitForSelector(
          ".save-for-billing-address input",
          { parent: addressesManager }
        );

        if (useAsBillingAddress instanceof HTMLInputElement) {
          if (useAsBillingAddress.checked) {
            useAsBillingAddress.click();
          }
        }

        // Apply the shipping and wait for the address manager to update
        const applyShipping = await waitForSelector(
          "button.new-address-form__button",
          { parent: addressesManager }
        );
        applyShipping.click();

        await waitForAddedNodes(addressesManager);
      } else if (addressesManager.querySelector(".saved-addresses")) {
        // Determine whether a saved address is already selected
        if (
          !addressesManager.querySelector(
            "a[href^='#saved-address'] > .saved-address"
          )
        ) {
          // Click the first saved address option if a current one isn't selected
          const firstSavedAddressOption = await waitForSelector(
            "button.saved-addresses__option",
            { parent: addressesManager }
          );
          firstSavedAddressOption.click();
        }
      }
    }

    // Determine which contact fields are neccessary and autofill them
    const contactFields = [fields.contactPhone];

    if (document.querySelector(fields.contactEmailAddress.selector)) {
      contactFields.push(fields.contactEmailAddress);
    }

    for (const { selector, value } of contactFields) {
      await autofillSelector(selector, value, mode);
    }

    // Wait for roughly 2 seconds before continuing to payment
    await waitForTimeout(2000);
    const continueToPayment = await waitForSelector(
      ".button--continue > button"
    );
    continueToPayment.click();
  } else if (autofillEnabled) {
    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingStreet,
      fields.shippingStreet2,
      fields.shippingCity,
      fields.shippingState,
      fields.shippingZipcode,
    ];
    const contactFields = [fields.contactPhone, fields.contactEmailAddress];

    // Wait for every address manager to be autofilled
    await Promise.all([
      // Iterate through every single addresses manager on the page
      ...Array.from(document.querySelectorAll(".addresses-manager")).map(
        (addressesManager) => {
          // Click the button to show the address line 2 input
          waitForSelector("button.address-form__showAddress2Link", {
            parent: addressesManager,
          }).then((showAddress2Link) => showAddress2Link.click());

          // Make sure that the billing is not the same as the shipping
          waitForSelector(".save-for-billing-address input", {
            parent: addressesManager,
          }).then((useAsBillingAddress) => {
            if (
              useAsBillingAddress instanceof HTMLInputElement &&
              useAsBillingAddress.checked
            ) {
              useAsBillingAddress.click();
            }
          });

          return Promise.all(
            shippingFields.map(({ selector, value }) =>
              autofillSelector(selector, value, mode, {
                polling: { parent: addressesManager },
              })
            )
          );
        }
      ),
      ...contactFields.map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      ),
    ]);
  }

  isFullfillmentActive = false;
}

async function delivery(bestBuy) {
  isDeliveryActive = true;

  const { autocheckoutEnabled } = bestBuy;

  if (autocheckoutEnabled) {
    const continueToPayment = await waitForSelector(
      ".button--continue > button"
    );
    continueToPayment.click();
  }

  isDeliveryActive = false;
}

async function payment(bestBuy, profile) {
  isPaymentProcessing = true;

  const { autocheckoutEnabled, autofillEnabled, mode } = bestBuy;
  const { billing, payment } = profile;
  const fields = {
    ccCardNumber: {
      selector: "input[name='number']",
      value: payment.ccNumber,
    },
    expirationMonth: {
      selector: "select[name='expMonth']",
      value: payment.ccExpMonth.padStart(2, "0"),
    },
    expirationYear: {
      selector: "select[name='expYear']",
      value: "20" + payment.ccExpYear,
    },
    creditCardCvv: {
      selector: "input[name='cvv']",
      value: payment.ccCSC,
    },
    billingFirstName: {
      selector: ".billing-address-wrapper input[name='firstName']",
      value: billing.givenName,
    },
    billingLastName: {
      selector: ".billing-address-wrapper input[name='lastName']",
      value: billing.familyName,
    },
    billingAddressLine1: {
      selector: ".billing-address-wrapper input[name='addressLine1']",
      value: billing.addressLine1,
    },
    billingAddressLine2: {
      selector: ".billing-address-wrapper input[name='addressLine2']",
      value: billing.addressLine2,
    },
    billingCity: {
      selector: ".billing-address-wrapper input[name='city']",
      value: billing.addressLevel2,
    },
    billingState: {
      selector: ".billing-address-wrapper select[name='state']",
      value: billing.addressLevel1,
    },
    billingPostalCode: {
      selector: ".billing-address-wrapper input[name='postalCode']",
      value: billing.postalCode,
    },
  };

  if (autocheckoutEnabled) {
    // Autofill the credit card field depending whether the user's credit card information is saved
    const paymentCollapse = await waitForSelector(".payment-collapse-mode");
    const paymentFields = paymentCollapse.querySelector(
      ".credit-card-summary__card-info"
    )
      ? [fields.creditCardCvv]
      : [
          fields.ccCardNumber,
          fields.expirationMonth,
          fields.expirationYear,
          fields.creditCardCvv,
        ];

    for (const { selector, value } of paymentFields) {
      await autofillSelector(selector, value, mode);
    }

    // Autofill the billing address form if present
    if (document.querySelector(".billing-address-wrapper")) {
      // Show the billing address' addressLine2
      waitForSelector(".margin-between-form-elements > button").then(
        (addAddressLine2) => addAddressLine2.click()
      );

      // Autofill each billing field
      const billingFields = [
        fields.billingFirstName,
        fields.billingLastName,
        fields.billingAddressLine1,
        fields.billingAddressLine2,
        fields.billingCity,
        fields.billingState,
        fields.billingPostalCode,
      ];

      for (const { selector, value } of billingFields) {
        await autofillSelector(selector, value, mode);
      }
    }

    // Wait 2 seconds before pressing the button to place the order
    await waitForTimeout(2000);
    const placeOrderButton = await waitForSelector(
      ".payment__order-summary > button"
    );
    placeOrderButton.click();
  } else if (autofillEnabled) {
    waitForSelector(".margin-between-form-elements > button").then(
      (addAddressLine2) => addAddressLine2.click()
    );

    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }

  isPaymentProcessing = false;
}

// ============================================================================
// Event Listeners
// ============================================================================

chrome.runtime.onMessage.addListener(autofillBestBuy);
