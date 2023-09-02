"use strict";

// ============================================================================
// Main
// ============================================================================

autofillFinishline();

// ============================================================================
// Functions
// ============================================================================

async function autofillFinishline() {
  const {
    profiles,
    scripts: { finishline },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (finishline.autocheckoutEnabled || finishline.autofillEnabled) &&
    Object.hasOwn(profiles, finishline.profileKey)
  ) {
    const profile = profiles[finishline.profileKey];

    switch (location.pathname) {
      case "/":
        if (notifications) {
          displayNotification(finishline);
        }
        break;

      case "/store/cart/cart.jsp":
        cart(finishline);
        break;

      case "/store/checkout/shipping.jsp":
        shipping(finishline, profile);
        break;

      case "/store/checkout/billing.jsp":
        paymentAndBilling(finishline, profile);
        break;

      case "/store/checkout/review.jsp":
        orderReview(finishline);
        break;
    }
  }
}

function displayNotification(finishline) {
  const { autocheckoutEnabled } = finishline;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for Finishline. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for Finishline.",
  });
}

async function cart(finishline) {
  const { autocheckoutEnabled } = finishline;

  if (autocheckoutEnabled) {
    const cartProceedBtn = await waitForSelector(".js-cart-proceed-btn");
    cartProceedBtn.click();
  }
}

async function shipping(finishline, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = finishline;
  const { contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      selector: "#firstName",
      value: shipping.givenName,
    },
    shippingLastName: {
      selector: "#shippingLastName",
      value: shipping.familyName,
    },
    shippingAddress1: {
      selector: "#shippingAddress1",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: "#shippingAddress2",
      value: shipping.addressLine2,
    },
    shippingCity: {
      selector: "#shippingCity",
      value: shipping.addressLevel2,
    },
    shippingState: {
      selector: "#shippingState",
      value: shipping.addressLevel1,
    },
    shippingZip: {
      selector: "#shippingZip",
      value: shipping.postalCode,
    },
    shippingPhone: {
      selector: "#shippingPhone",
      value: contact.tel,
    },
    shippingEmail: {
      selector: "#email",
      value: contact.email,
    },
    formChangeEmailAddress: {
      selector: "#formChangeEmailAddress",
      value: contact.email,
    },
  };

  waitForSelector("#shipToHomeTab .addline span[role='button']").then(
    (addLineButton) => addLineButton.click()
  );

  if (autocheckoutEnabled) {
    if (isElementVisible(document.querySelector("#shipToHomeTab"))) {
      const shippingFields = [
        fields.shippingFirstName,
        fields.shippingLastName,
        fields.shippingAddress1,
        fields.shippingAddress2,
        fields.shippingCity,
        fields.shippingState,
        fields.shippingZip,
        fields.shippingPhone,
        fields.shippingEmail,
      ];

      for (const { options, selector, value } of shippingFields) {
        await autofillSelector(selector, value, mode, options);
      }
    } else if (isElementVisible(document.querySelector("#storePickupTab"))) {
      const contactFields = [fields.formChangeEmailAddress];

      for (const { selector, value } of contactFields) {
        await autofillSelector(selector, value, mode);
      }
    }

    const shippingContinueBtn = await waitForSelector(
      "#shippingContinueButton"
    );
    shippingContinueBtn.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function paymentAndBilling(finishline, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = finishline;
  const { billing, contact, payment } = profile;
  const fields = {
    billingCardNumber: {
      options: { polling: { visible: true } },
      selector: "#billingCardNumber",
      value: payment.ccNumber,
    },
    billingCardNumberCheckout: {
      options: { polling: { visible: true } },
      selector: "#billingCardNumberCheckout",
      value: payment.ccNumber,
    },
    billingExpirationMonth: {
      options: { polling: { visible: true } },
      selector: "#billingExpirationMonth",
      value: payment.ccExpMonth.padStart(2, "0"),
    },
    billingExpirationMonthCheckout: {
      options: { polling: { visible: true } },
      selector: "#billingExpirationMonthCheckout",
      value: payment.ccExpMonth.padStart(2, "0"),
    },
    billingExpirationYear: {
      options: { polling: { visible: true } },
      selector: "#billingExpirationYear",
      value: "20" + payment.ccExpYear,
    },
    billingExpirationYearCheckout: {
      options: { polling: { visible: true } },
      selector: "#billingExpirationYearCheckout",
      value: "20" + payment.ccExpYear,
    },
    billingSecurityCode: {
      options: { polling: { visible: true } },
      selector: "[id^='billingSecurityCode']",
      value: payment.ccCSC,
    },
    billingSecurityCodeCheckout: {
      options: { polling: { visible: true } },
      selector: "#billingSecurityCodeCheckout",
      value: payment.ccCSC,
    },
    billingCardType: {
      selector: "#billingCardType",
      value: payment.ccType.toUpperCase(),
    },
    billingFirstName: {
      options: { polling: { visible: true } },
      selector: "#billingFirstName",
      value: billing.givenName,
    },
    billingLastName: {
      options: { polling: { visible: true } },
      selector: "#billingLastName",
      value: billing.familyName,
    },
    billingAddress1: {
      options: { polling: { visible: true } },
      selector: "#billingAddress1",
      value: billing.addressLine1,
    },
    billingAddress2: {
      options: { polling: { visible: true } },
      selector: "#billingAddress2",
      value: billing.addressLine2,
    },
    billingCity: {
      options: { polling: { visible: true } },
      selector: "#billingCity",
      value: billing.addressLevel2,
    },
    billingState: {
      options: { polling: { visible: true } },
      selector: "#billingState",
      value: billing.addressLevel1,
    },
    billingZip: {
      options: { polling: { visible: true } },
      selector: "#billingZip",
      value: billing.postalCode,
    },
    billingPhone: {
      options: { polling: { visible: true } },
      selector: "#billingPhone",
      value: contact.tel,
    },
    billingEmail: {
      options: { polling: { visible: true } },
      selector: "#email",
      value: contact.email,
    },
  };

  waitForSelector("#sameAsShippingCheckbox").then((sameAsShippingCheckbox) => {
    if (sameAsShippingCheckbox instanceof HTMLInputElement) {
      if (sameAsShippingCheckbox.checked) {
        sameAsShippingCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const paymentBillingFields = [
      fields.billingCardNumber,
      fields.billingExpirationMonth,
      fields.billingExpirationYear,
      fields.billingSecurityCode,
      fields.billingCardType,
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCity,
      fields.billingState,
      fields.billingZip,
      fields.billingPhone,
      fields.billingEmail,
    ];

    for (const { options, selector, value } of paymentBillingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    const billingContinueBtn = await waitForSelector("#billingContinueButton");
    billingContinueBtn.click();
  } else if (autofillEnabled) {
    await Promise.all(
      Object.values(fields).map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
}

async function orderReview(finishline) {
  const { autocheckoutEnabled } = finishline;

  if (autocheckoutEnabled) {
    const submitOrderBtn = await waitForSelector("#submitOrder");
    submitOrderBtn.click();
  }
}
