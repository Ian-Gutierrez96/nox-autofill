"use strict";

(async () => {
  const {
    profiles,
    scripts: {
      stripe: { autocheckoutEnabled, autofillEnabled, mode, profileKey },
    },
    settings: { blacklistedSites },
  } = await chrome.storage.local.get(["profiles", "scripts", "settings"]);

  if (
    !blacklistedSites.includes(location.origin) &&
    (autocheckoutEnabled || autofillEnabled) &&
    Object.hasOwn(profiles, profileKey)
  ) {
    const { contact, billing, payment } = profiles[profileKey];
    const fields = [
      {
        options: { polling: { visible: true } },
        selector: "input[name='cardnumber'], input[name='number']",
        value: payment.ccNumber,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='exp-date'], input[name='expiry']",
        value: payment.ccExpMonth.padStart(2, "0") + "/" + payment.ccExpYear,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='cvc']",
        value: payment.ccCSC,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='name']",
        value: billing.givenName + " " + billing.familyName,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='email']",
        value: contact.email,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='phone']",
        value: contact.tel,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='addressLine1']",
        value: billing.addressLine1,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='addressLine2']",
        value: billing.addressLine2,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='locality']",
        value: billing.addressLevel2,
      },
      {
        options: { polling: { visible: true } },
        selector: "select[name='administrativeArea']",
        value: getAddressLevel1Value(billing.country, billing.addressLevel1),
      },
      {
        options: { polling: { visible: true } },
        selector: "select[name='country']",
        value: billing.country,
      },
      {
        options: { polling: { visible: true } },
        selector: "input[name='postalCode']",
        value: billing.postalCode,
      },
    ];

    await Promise.all(
      fields.map(({ options, selector, value }) =>
        autofillSelector(selector, value, mode, options)
      )
    );
  }
})();

function getAddressLevel1Value(country, addressLevel1) {
  const fullAdministrativeAreas = [
    "AR",
    "BS",
    "BB",
    "BY",
    "CV",
    "CL",
    "CR",
    "SV",
    "HN",
    "HK",
    "IN",
    "ID",
    "IQ",
    "IE",
    "JM",
    "KZ",
    "KI",
    "MY",
    "MZ",
    "NR",
    "NI",
    "NG",
    "PA",
    "PG",
    "PE",
    "PH",
    "SO",
    "KN",
    "SR",
    "TR",
    "TV",
    "UA",
    "AE",
    "UY",
    "UZ",
    "VE",
    "VN",
  ];

  return fullAdministrativeAreas.includes(country)
    ? firstAdministrativeLevels.get(country).get(addressLevel1)
    : addressLevel1;
}
