/**
 * Enum for address field names.
 * @enum {string}
 */
export const AddressFieldName = Object.freeze({
  ADDRESS_LEVEL1: "address-level1",
  ADDRESS_LEVEL2: "address-level2",
  ADDRESS_LINE1: "address-line1",
  ADDRESS_LINE2: "address-line2",
  COUNTRY: "country",
  FAMILY_NAME: "family-name",
  GIVEN_NAME: "given-name",
  POSTAL_CODE: "postal-code",
});

/**
 * Enum for format of address fields
 * @enum {{ disabled: boolean, name: AddressFieldName, label: string, required:
 *  boolean
 * }[][]}
 */
export const AddressFieldSetFormat = Object.freeze({
  AREA: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "Area",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
      {
        disabled: true,
        name: AddressFieldName.POSTAL_CODE,
        label: "",
        required: false,
      },
    ],
  ],

  CITY: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
      {
        disabled: true,
        name: AddressFieldName.POSTAL_CODE,
        label: "",
        required: false,
      },
    ],
  ],

  CITY_COUNTY_POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "County",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
    ],
  ],

  CITY_DEPARTMENT_POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Department",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
    ],
  ],

  CITY_DISTRICT: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "District",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.POSTAL_CODE,
        label: "",
        required: false,
      },
    ],
  ],

  CITY_EMIRATE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Emirate",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.POSTAL_CODE,
        label: "",
        required: false,
      },
    ],
  ],

  CITY_GOVERNORATE_POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Governorate",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code (optional)",
        required: false,
      },
    ],
  ],

  CITY_ISLAND: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Island",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.POSTAL_CODE,
        label: "",
        required: false,
      },
    ],
  ],

  CITY_OPTPOSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code (optional)",
        required: false,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
    ],
  ],

  CITY_OPTPOSTAL_ISLAND: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code (optional)",
        required: false,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Island",
        required: true,
      },
    ],
  ],

  CITY_PARISH: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Parish",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.POSTAL_CODE,
        label: "",
        required: false,
      },
    ],
  ],

  CITY_PARISH_POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Parish",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
    ],
  ],

  CITY_POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
    ],
  ],

  CITY_POSTAL_PROVINCE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Province",
        required: true,
      },
    ],
  ],

  CITY_POSTAL_REGION: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Region",
        required: true,
      },
    ],
  ],

  CITY_POSTAL_STATE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "State",
        required: true,
      },
    ],
  ],

  CITY_POSTCODE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postcode",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
    ],
  ],

  CITY_PROVINCE_POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Province",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
    ],
  ],

  CITY_REGION_POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Region",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
    ],
  ],

  CITY_STATE_OPTPOSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "State",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code (optional)",
        required: false,
      },
    ],
  ],

  CITY_STATE_PINCODE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "State",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "PIN code",
        required: true,
      },
    ],
  ],

  CITY_STATE_ZIPCODE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "State",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "ZIP code",
        required: true,
      },
    ],
  ],

  DISTRICT_POSTAL_REGION: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "District",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Region",
        required: true,
      },
    ],
  ],

  DISTRICT_REGION: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "District",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Region",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.POSTAL_CODE,
        label: "",
        required: false,
      },
    ],
  ],

  NAME_PROVINCE_CITY_ADDRESS: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Province",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
  ],

  OPTPOSTAL_CITY: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code (optional)",
        required: false,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
    ],
  ],

  OPTPOSTAL_CITY_PROVINCE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code (optional)",
        required: false,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Province",
        required: true,
      },
    ],
  ],

  POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "",
        required: false,
      },
    ],
  ],

  POSTAL_CITY: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
    ],
  ],

  POSTAL_CITY_ADDRESS_NAME: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
    ],
  ],

  POSTAL_CITY_COUNTY: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "County",
        required: true,
      },
    ],
  ],

  POSTAL_CITY_DEPARTMENT: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Department",
        required: true,
      },
    ],
  ],

  POSTAL_CITY_ISLAND: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Island",
        required: true,
      },
    ],
  ],

  POSTAL_CITY_LAND: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Land",
        required: true,
      },
    ],
  ],

  POSTAL_CITY_NAME_ADDRESS: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
    ],
  ],

  POSTAL_CITY_OBLAST: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Oblast",
        required: true,
      },
    ],
  ],

  POSTAL_CITY_PROVINCE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Province",
        required: true,
      },
    ],
  ],

  POSTAL_CITY_REGION: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Region",
        required: true,
      },
    ],
  ],

  POSTAL_CITY_STATE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "State",
        required: true,
      },
    ],
  ],

  POSTAL_CITY_VOIVODSHIP: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Voivodship",
        required: true,
      },
    ],
  ],

  POSTAL_PREFECTURE_CITY_ADDRESS: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "Prefecture",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City/ward/town/village",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
  ],

  CITY_STATE_POSTAL: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "State",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
    ],
  ],

  POSTAL_WARD: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postal code",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "Ward",
        required: true,
      },
      {
        disabled: true,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "",
        required: false,
      },
    ],
  ],

  POSTCODE_CITY_STATE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postcode",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "City",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "State/territory",
        required: true,
      },
    ],
  ],

  SUBURB_STATE_POSTCODE: [
    [
      {
        disabled: false,
        name: AddressFieldName.COUNTRY,
        label: "Country/region",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.GIVEN_NAME,
        label: "First name",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.FAMILY_NAME,
        label: "Last name",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE1,
        label: "Street address",
        required: true,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LINE2,
        label: "Apartment, suite, etc. (optional)",
        required: false,
      },
    ],
    [
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL2,
        label: "Surburb",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.ADDRESS_LEVEL1,
        label: "State/territory",
        required: true,
      },
      {
        disabled: false,
        name: AddressFieldName.POSTAL_CODE,
        label: "Postcode",
        required: true,
      },
    ],
  ],
});
