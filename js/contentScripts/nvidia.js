"use strict";

// ============================================================================
// Main
// ============================================================================

autofillNVIDIA();

// ============================================================================
// Functions
// ============================================================================

async function autofillNVIDIA() {
  const {
    profiles,
    scripts: { nvidia },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (nvidia.autocheckoutEnabled || nvidia.autofillEnabled) &&
    Object.hasOwn(profiles, nvidia.profileKey)
  ) {
    const profile = profiles[nvidia.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) {
          displayNotification(nvidia);
        }
        break;

      case "/cart.php":
        cart(nvidia);
        break;

      case "/checkout":
        customer(nvidia, profile);
        shipping(nvidia, profile);
        billing(nvidia, profile);
        payment(nvidia);
        break;
    }
  }
}

function displayNotification(nvidia) {
  const { autocheckoutEnabled } = nvidia;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for NVIDIA. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for NVIDIA.",
  });
}

async function cart(nvidia) {
  const { autocheckoutEnabled } = nvidia;

  if (autocheckoutEnabled) {
    const checkoutButton = await waitForSelector(
      ".sidebar-container a[href='/checkout']"
    );
    checkoutButton.click();
  }
}

async function customer(nvidia, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = nvidia;
  const { contact } = profile;
  const fields = {
    customerEmail: {
      selector: "#checkout-customer-guest input[name='email']",
      value: contact.email,
    },
  };

  if (autocheckoutEnabled) {
    const customerFields = [fields.customerEmail];

    for (const { selector, value } of customerFields) {
      await autofillSelector(selector, value, mode);
    }

    const checkoutCustomerContinue = await waitForSelector(
      "#checkout-customer-continue:not(:disabled)"
    );
    checkoutCustomerContinue.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ selector, value }) =>
        autofillSelector(selector, value, mode)
      )
    );
  }
}

async function shipping(nvidia, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = nvidia;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector:
        "#checkoutShippingAddress input[name='shippingAddress.firstName']",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector:
        "#checkoutShippingAddress input[name='shippingAddress.lastName']",
      value: shipping.familyName,
    },
    shippingPhone: {
      selector: "#checkoutShippingAddress input[name='shippingAddress.phone']",
      value: contact.tel,
    },
    shippingAddress1: {
      selector:
        "#checkoutShippingAddress input[name='shippingAddress.address1']",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      selector:
        "#checkoutShippingAddress input[name='shippingAddress.address2']",
      value: shipping.addressLine2,
    },
    shippingCity: {
      selector: "#checkoutShippingAddress input[name='shippingAddress.city']",
      value: shipping.addressLevel2,
    },
    shippingCountryCode: {
      selector:
        "#checkoutShippingAddress select[name='shippingAddress.countryCode']",
      value: shipping.country,
    },
    shippingStateOrProvinceCodeInput: {
      selector:
        "#checkoutShippingAddress input[name='shippingAddress.stateOrProvinceCode']",
      value: shipping.addressLevel1,
    },
    shippingStateOrProvinceCodeSelect: {
      options: { select: { text: true } },
      selector:
        "#checkoutShippingAddress select[name='shippingAddress.stateOrProvinceCode']",
      value: shipping.addressLevel1,
    },
    shippingPostalCode: {
      selector:
        "#checkoutShippingAddress input[name='shippingAddress.postalCode']",
      value: shipping.postalCode,
    },
  };

  waitForSelector("#sameAsBilling").then((sameAsBillingCheckbox) => {
    if (sameAsBillingCheckbox instanceof HTMLInputElement) {
      if (sameAsBillingCheckbox.checked) {
        sameAsBillingCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingPhone,
      fields.shippingAddress1,
      fields.shippingAddress2,
      fields.shippingCity,
      fields.shippingCountryCode,
      fields.shippingPostalCode,
    ];

    switch (shipping.country) {
      case "AR":
      case "AU":
      case "AT":
      case "CA":
      case "DE":
      case "IN":
      case "ID":
      case "IE":
      case "MY":
      case "MX":
      case "ZA":
      case "ES":
      case "CH":
      case "AE":
      case "US":
        shippingFields.push(fields.shippingStateOrProvinceCodeSelect);
        break;

      default:
        shippingFields.push(fields.shippingStateOrProvinceCodeInput);
        break;
    }

    for (const { options, selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const checkoutShippingContinue = await waitForSelector(
      "#checkout-shipping-continue:not(:disabled)"
    );
    checkoutShippingContinue.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function billing(nvidia, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = nvidia;
  const { billing, contact } = profile;
  const fields = {
    billingFirstName: {
      selector: "#checkoutBillingAddress input[name='firstName']",
      value: billing.givenName,
    },
    billingLastName: {
      selector: "#checkoutBillingAddress input[name='lastName']",
      value: billing.familyName,
    },
    billingPhone: {
      selector: "#checkoutBillingAddress input[name='phone']",
      value: contact.tel,
    },
    billingAddress1: {
      selector: "#checkoutBillingAddress input[name='address1']",
      value: billing.addressLine1,
    },
    billingAddress2: {
      selector: "#checkoutBillingAddress input[name='address2']",
      value: billing.addressLine2,
    },
    billingCity: {
      selector: "#checkoutBillingAddress input[name='city']",
      value: billing.addressLevel2,
    },
    billingCountryCode: {
      selector: "#checkoutBillingAddress select[name='countryCode']",
      value: billing.country,
    },
    billingStateOrProvinceCodeInput: {
      selector: "#checkoutBillingAddress input[name='stateOrProvinceCode']",
      value: billing.addressLevel1,
    },
    billingStateOrProvinceCodeSelect: {
      options: { select: { text: true } },
      selector: "#checkoutBillingAddress select[name='stateOrProvinceCode']",
      value: billing.addressLevel1,
    },
    billingPostalCode: {
      selector: "#checkoutBillingAddress input[name='postalCode']",
      value: billing.postalCode,
    },
  };

  if (autocheckoutEnabled) {
    const billingFields = [
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingPhone,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCity,
      fields.billingCountryCode,
      fields.billingPostalCode,
    ];

    switch (billing.country) {
      case "AR":
      case "AU":
      case "AT":
      case "CA":
      case "DE":
      case "IN":
      case "ID":
      case "IE":
      case "MY":
      case "MX":
      case "ZA":
      case "ES":
      case "CH":
      case "AE":
      case "US":
        billingFields.push(fields.billingStateOrProvinceCodeSelect);
        break;

      default:
        billingFields.push(fields.billingStateOrProvinceCodeInput);
        break;
    }

    for (const { options, selector, value } of billingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const checkoutBillingContinue = await waitForSelector(
      "#checkout-billing-continue:not(:disabled)"
    );
    checkoutBillingContinue.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function payment(nvidia) {
  const { autocheckoutEnabled } = nvidia;

  waitForSelector("#terms").then((termsCheckbox) => {
    if (termsCheckbox instanceof HTMLInputElement) {
      if (!termsCheckbox.checked) {
        termsCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    await Promise.all([
      waitForSelector(".form-field--ccNumber iframe"),
      waitForSelector(".form-field--ccExpiry iframe"),
      waitForSelector(".form-field--ccName iframe"),
      waitForSelector(".form-ccFields-field--ccCvv iframe"),
    ]);

    await waitForTimeout(1000);
    const checkoutPaymentContinue = await waitForSelector(
      "#checkout-payment-continue:not(:disabled)"
    );
    checkoutPaymentContinue.click();
  }
}
