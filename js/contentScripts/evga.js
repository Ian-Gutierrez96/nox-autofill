"use strict";

// ============================================================================
// Main
// ============================================================================

autofillEVGA();

// ============================================================================
// Functions
// ============================================================================

async function autofillEVGA() {
  const {
    profiles,
    scripts: { evga },
    settings: { blacklistedSites, notifications },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (evga.autocheckoutEnabled || evga.autofillEnabled) &&
    Object.hasOwn(profiles, evga.profileKey)
  ) {
    const profile = profiles[evga.profileKey];

    switch (location.hostname) {
      case "www.evga.com":
        switch (location.pathname) {
          case "/":
            if (notifications) {
              displayNotification(evga);
            }
            break;

          case "/products/shoppingcart.aspx":
          case "/products/ShoppingCart.aspx":
          case "/Products/ShoppingCart.aspx":
            shoppingCart(evga);
            break;
        }
        break;

      case "secure.evga.com":
        switch (location.pathname) {
          case "/Cart/Checkout_Shipping.aspx":
            checkoutShipping(evga, profile);
            confirmShipping(evga);
            break;

          case "/Cart/Checkout_Payment.aspx":
            checkoutPayment(evga);
            break;

          case "/Cart/Checkout_PlaceOrder.aspx":
            checkoutPlaceOrder(evga);
            break;
        }
    }
  }
}

function displayNotification(evga) {
  const { autocheckoutEnabled } = evga;

  chrome.runtime.sendMessage({
    command: "display-notification",
    notificationContent: autocheckoutEnabled
      ? "Caution: Autocheckout is enabled for EVGA. Ensure prerequisites are met."
      : "Reminder: Autofill is enabled for EVGA.",
  });
}

async function shoppingCart(evga) {
  const { autocheckoutEnabled } = evga;

  if (autocheckoutEnabled) {
    const checkoutButton = await waitForSelector("#LFrame_CheckoutButton");
    checkoutButton.click();
  }
}

async function checkoutShipping(evga, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = evga;
  const { billing, contact, shipping } = profile;
  const fields = {
    shippingFirstName: {
      options: { polling: { visible: true } },
      selector: "#txtShipFName",
      value: shipping.givenName,
    },
    shippingLastName: {
      options: { polling: { visible: true } },
      selector: "#txtShipLName",
      value: shipping.familyName,
    },
    shippingCountry: {
      options: { polling: { visible: true } },
      selector: "#ddlShipCountry",
      value: shipping.country,
    },
    shippingAddress1: {
      options: { polling: { visible: true } },
      selector: "#txtShipAddr1",
      value: shipping.addressLine1,
    },
    shippingAddress2: {
      options: { polling: { visible: true } },
      selector: "#txtShipAddr2",
      value: shipping.addressLine2,
    },
    shippingCity: {
      options: { polling: { visible: true } },
      selector: "#txtShipCity",
      value: shipping.addressLevel2,
    },
    shippingState: {
      options: { polling: { visible: true } },
      selector: "#ddlShipState",
      value: shipping.addressLevel1,
    },
    shippingZip: {
      options: { polling: { visible: true } },
      selector: "#txtShipZip",
      value: shipping.postalCode,
    },
    shippingPhone: {
      options: { polling: { visible: true } },
      selector: "#txtShipPhone",
      value: contact.tel,
    },
    shippingEmail: {
      options: { polling: { visible: true } },
      selector: "#txtShipEmail",
      value: contact.email,
    },
    billingFirstName: {
      options: { polling: { visible: true } },
      selector: "#txtBillFName",
      value: billing.givenName,
    },
    billingLastName: {
      options: { polling: { visible: true } },
      selector: "#txtBillLName",
      value: billing.familyName,
    },
    billingCountry: {
      options: { polling: { visible: true } },
      selector: "#ddlBillCountry",
      value: billing.country,
    },
    billingAddress1: {
      options: { polling: { visible: true } },
      selector: "#txtBillAddr1",
      value: billing.addressLine1,
    },
    billingAddress2: {
      options: { polling: { visible: true } },
      selector: "#txtBillAddr2",
      value: billing.addressLine2,
    },
    billingCity: {
      options: { polling: { visible: true } },
      selector: "#txtBillCity",
      value: billing.addressLevel2,
    },
    billingState: {
      options: { polling: { visible: true } },
      selector: "#ddlBillState",
      value: billing.addressLevel1,
    },
    billingZip: {
      options: { polling: { visible: true } },
      selector: "#txtBillZip",
      value: billing.postalCode,
    },
    billingPhone: {
      options: { polling: { visible: true } },
      selector: "#txtBillPhone",
      value: contact.tel,
    },
    billingEmail: {
      options: { polling: { visible: true } },
      selector: "#txtBillEmail",
      value: contact.email,
    },
  };

  waitForSelector("input[name='rdoAddressChoice'][value='original']", {
    visible: true,
  })
    .then((rdoAddressChoice) => {
      if (
        rdoAddressChoice instanceof HTMLInputElement &&
        !rdoAddressChoice.checked
      ) {
        rdoAddressChoice.click();
      }

      return waitForSelector("#modalSuggestAddress .btnCheckoutContinue", {
        visible: true,
      });
    })
    .then((continueButton) => continueButton.click());

  if (autocheckoutEnabled) {
    const shippingFields = [
      fields.shippingFirstName,
      fields.shippingLastName,
      fields.shippingCountry,
      fields.shippingAddress1,
      fields.shippingAddress2,
      fields.shippingCity,
      fields.shippingState,
      fields.shippingZip,
      fields.shippingPhone,
      fields.shippingEmail,
      fields.billingFirstName,
      fields.billingLastName,
      fields.billingCountry,
      fields.billingAddress1,
      fields.billingAddress2,
      fields.billingCity,
      fields.billingState,
      fields.billingZip,
      fields.billingPhone,
      fields.billingEmail,
    ];

    for (const { options, selector, value } of shippingFields) {
      await autofillSelector(selector, value, mode, options);
    }

    await waitForTimeout(1000);
    const shippingContinueBtn = await waitForSelector(
      ".js-ship-buttons .btnCheckoutContinue",
      { visible: true }
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

async function confirmShipping(evga) {
  const { autocheckoutEnabled } = evga;

  if (autocheckoutEnabled) {
    const termsConditionsCheckbox = await waitForSelector("#cbAgree", {
      visible: true,
    });

    if (termsConditionsCheckbox instanceof HTMLInputElement) {
      if (!termsConditionsCheckbox.checked) {
        termsConditionsCheckbox.click();
      }
    }

    await waitForTimeout(1000);
    const btnCheckoutContinue = await waitForSelector(
      "#ctl00_LFrame_btncontinue",
      { visible: true }
    );
    btnCheckoutContinue.click();
  }
}

async function checkoutPayment(evga) {
  const { autocheckoutEnabled } = evga;

  if (autocheckoutEnabled) {
    const payWithCcRadio = await waitForSelector("#rdoCreditCard", {
      visible: true,
    });
    payWithCcRadio.click();

    await waitForTimeout(1000);
    const btnCheckoutContinue = await waitForSelector(
      "#ctl00_LFrame_btncontinue",
      { visible: true }
    );
    btnCheckoutContinue.click();

    await waitForTimeout(1000);
    const cardModalContinueBtn = await waitForSelector(
      "#btnCreditCardContinue",
      { visible: true }
    );
    cardModalContinueBtn.click();
  }
}

async function checkoutPlaceOrder(evga) {
  const { autocheckoutEnabled } = evga;

  if (autocheckoutEnabled) {
    const termsConditionsCheckbox = await waitForSelector(
      "#ctl00_LFrame_cbAgree",
      { visible: true }
    );

    if (termsConditionsCheckbox instanceof HTMLInputElement) {
      if (!termsConditionsCheckbox.checked) {
        termsConditionsCheckbox.click();
      }
    }

    await waitForTimeout(1000);
    const placeOrderBtn = await waitForSelector("#ctl00_LFrame_btncontinue", {
      visible: true,
    });
    placeOrderBtn.click();
  }
}
