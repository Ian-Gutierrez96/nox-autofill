"use strict";

(async () => {
  if (self !== top) {
    const {
      profiles,
      scripts: { shopDisney },
      settings: { blacklistedSites },
    } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

    if (
      !blacklistedSites.includes(location.ancestorOrigins[0]) &&
      (shopDisney.autocheckoutEnabled || shopDisney.autofillEnabled) &&
      Object.hasOwn(profiles, shopDisney.profileKey)
    ) {
      const profile = profiles[shopDisney.profileKey];

      switch (location.pathname) {
        case "/embedded/web":
          payment(shopDisney, profile);
          break;
      }
    }
  }
})();

async function payment(shopDisney, profile) {
  const { autocheckoutEnabled, autofillEnabled, mode } = shopDisney;
  const { billing, payment } = profile;
  const fields = {
    cardNumber: {
      selector: "paycore-input-text[formcontrolname='cardNumber'] input",
      value: payment.ccNumber,
    },
    cardExpiration: {
      selector: "paycore-input-text[formcontrolname='expiration'] input",
      value: payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
    },
    cardSecurityCode: {
      selector: "paycore-input-text[formcontrolname='securityCode'] input",
      value: payment.ccCSC,
    },
    cardHolderName: {
      selector: "paycore-input-text[formcontrolname='cardholderName'] input",
      value: payment.ccGivenName + " " + payment.ccFamilyName,
    },
    billingCountry: {
      selector: "paycore-input-select[formcontrolname='country'] ul",
      value: countries.get(billing.country),
    },
    billingLine1: {
      selector: "paycore-input-text[formcontrolname='line1'] input",
      value: billing.addressLine1,
    },
    billingLine2: {
      selector: "paycore-input-text[formcontrolname='line2'] input",
      value: billing.addressLine2,
    },
    billingPostalCode: {
      selector: "paycore-input-text[formcontrolname='postalCode'] input",
      value: billing.postalCode,
    },
    billingCity: {
      selector: "paycore-input-text[formcontrolname='city'] input",
      value: billing.addressLevel2,
    },
    billingStateInput: {
      selector: "paycore-input-text[formcontrolname='state'] input",
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
    },
    billingStateSelect: {
      selector: "paycore-input-select[formcontrolname='state'] ul",
      value: firstAdministrativeLevels.has(billing.country)
        ? firstAdministrativeLevels
            .get(billing.country)
            .get(billing.addressLevel1)
        : billing.addressLevel1,
    },
  };

  waitForSelector(
    "paycore-input-radio[formcontrolname='primaryCard'] input"
  ).then((creditCardRadio) => creditCardRadio.click());

  waitForSelector("a.add-line-two").then((addLineTwoAnchor) =>
    addLineTwoAnchor.click()
  );

  waitForSelector("a.change-staged-address-button").then(
    (changeStagedAddressAnchor) => changeStagedAddressAnchor.click()
  );

  waitForSelector(
    "paycore-input-checkbox[formcontrolname='useShipping'] input"
  ).then((useAsShippingCheckbox) => {
    if (
      useAsShippingCheckbox instanceof HTMLInputElement &&
      useAsShippingCheckbox.checked
    ) {
      if (useAsShippingCheckbox.checked) {
        useAsShippingCheckbox.click();
      }
    }
  });

  if (autocheckoutEnabled) {
    const ccContent = await waitForSelector(".cc-content");

    if (ccContent.querySelector("payui-credit")) {
      const cardFields = [
        fields.cardNumber,
        fields.cardExpiration,
        fields.cardSecurityCode,
        fields.cardHolderName,
      ];

      for (const { selector, value } of cardFields) {
        await autofillSelector(selector, value, mode);
      }

      await fillCountryField(
        "payui-input-billing-address[formcontrolname='newAddress']",
        fields.billingCountry
      );

      const billingFields = [
        fields.billingLine1,
        fields.billingLine2,
        fields.billingPostalCode,
        fields.billingCity,
      ];

      switch (billing.country) {
        case "CA":
        case "US":
          billingFields.push(fields.billingStateSelect);
          break;

        default:
          billingFields.push(fields.billingStateInput);
          break;
      }

      for (const { selector, value } of billingFields) {
        await autofillSelector(selector, value, mode);
      }
    } else if (ccContent.querySelector("payui-staged-card")) {
      const savedCardFields = [fields.cardSecurityCode];

      for (const { selector, value } of savedCardFields) {
        await autofillSelector(selector, value, mode);
      }
    }
  } else if (autofillEnabled || enabled) {
    const cardFields = [
      fields.cardNumber,
      fields.cardExpiration,
      fields.cardSecurityCode,
      fields.cardHolderName,
    ];
    const billingFields = [
      fields.billingLine1,
      fields.billingLine2,
      fields.billingPostalCode,
      fields.billingCity,
    ];

    switch (billing.country) {
      case "CA":
      case "US":
        billingFields.push(fields.billingStateSelect);
        break;

      default:
        billingFields.push(fields.billingStateInput);
        break;
    }

    await Promise.all([
      Promise.all(
        cardFields.map(({ selector, value }) =>
          autofillSelector(selector, value, mode)
        )
      ),
      fillCountryField(
        "payui-input-billing-address[formcontrolname='newAddress']",
        fields.billingCountry
      ).then(() =>
        Promise.all(
          billingFields.map(({ selector, value }) =>
            autofillSelector(selector, value, mode)
          )
        )
      ),
    ]);
  }
}

async function fillCountryField(formSelector, countryField) {
  const [addressForm, countrySelectElement] = await Promise.all([
    [formSelector, countryField.selector].map((selector) =>
      waitForSelector(selector)
    ),
  ]);

  if (countrySelectElement instanceof HTMLUListElement) {
    await Promise.all([
      autofillSelector(countryField.selector, countryField.value, "fast"),
      countrySelectElement.firstChild.textContent !== "United States"
        ? waitForAddedNodes(addressForm)
        : null,
    ]);
  }
}

/**
 * Automatically type in the HTMLInputElement's value or select an HTMLOptionElement's
 * option depending on the value passed in. Will autofill the form control in a nature
 * depending on the mode passed in, along with prescribing to the additional options
 * provided.
 * @param {HTMLElement} element - Automatically type in the HTMLInputElement's value
 * or select an HTMLOptionElement's option depending on the value passed in. Will
 * autofill the form control in a nature depending on the mode passed in, along with
 * prescribing to the additional options provided.
 * @param {string} value - HTMLInputElement's new value or the value of the
 * HTMLOptionElement to select.
 * @param {'click' | 'fast' | 'hover'} mode - Qualifier determining whether to
 * automatically change the HTMLElement's value or wait for the user to click or
 * hover over the Element.
 * @param {AutofillOptions} [options] - Optional autofilling parameters.
 */
async function autofillHTMLElement(element, value, mode, options = {}) {
  switch (mode) {
    case "click":
      await new Promise((resolve) =>
        element.addEventListener("click", resolve, { once: true })
      );
      return autofill();

    case "hover":
      await new Promise((resolve) =>
        element.addEventListener("mouseover", resolve, { once: true })
      );
      return autofill();

    default:
      return autofill();
  }

  async function autofill() {
    if (element instanceof HTMLButtonElement) {
      element.click();
    } else if (element instanceof HTMLInputElement) {
      typeText(element, value, options.type);
    } else if (element instanceof HTMLUListElement) {
      await selectOption(element, value);
    }

    return element;
  }
}

/**
 * Select an HTMLSelectElement's option with a corresponding value, along with
 * dispatching additional input and change Events. Can optionally choose to select
 * an HTMLOptionElement based off its textContent instead of value.
 * @param {HTMLUListElement} element - The select element to choose from.
 * @param {string} value - Value or text of option to select.
 * @return {Promise<HTMLElement>} HTMLOptionElement selected based off its
 * value.
 */
async function selectOption(element, value) {
  element.focus();

  return (
    select() ??
    new Promise((resolve) => {
      new MutationObserver((_mutations, observer) => {
        const selectedOption = select();

        if (selectedOption) {
          observer.disconnect();
          resolve(selectedOption);
        }
      }).observe(element, {
        childList: true,
        subtree: true,
        attributes: true,
      });
    })
  );

  function select() {
    for (const child of element.children) {
      if (child instanceof HTMLElement) {
        if (child.textContent === value) {
          child.click();
          return child;
        }
      }
    }

    return null;
  }
}
