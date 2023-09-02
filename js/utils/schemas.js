const addressSchema = joi.object({
  addressLevel1: joi.string().optional().allow("").empty(""),
  addressLevel2: joi.string().optional().allow("").empty(""),
  addressLine1: joi.string(),
  addressLine2: joi.string().allow(""),
  country: joi.string(),
  familyName: joi.string(),
  givenName: joi.string(),
  postalCode: joi.string().optional().allow("").empty(""),
});

const paymentSchema = joi.object({
  ccCSC: joi.string(),
  ccExpMonth: joi.string().pattern(/^(?:0?[1-9]|1[0-2])$/),
  ccExpYear: joi.string().pattern(/^\d{2}$/),
  ccFamilyName: joi.string(),
  ccGivenName: joi.string(),
  ccNumber: joi.string(),
  ccType: joi.string().allow(null),
});

const contactSchema = joi.object({
  email: joi.string().email({ tlds: { allow: false } }),
  tel: joi
    .string()
    .pattern(
      /^\s*(?:\+?(\d{1,3}))?[-. (]*(\d{3})[-. )]*(\d{3})[-. ]*(\d{4})(?: *x(\d+))?\s*$/
    ),
  username: joi.string(),
});

export const profileSchema = joi.object({
  billing: addressSchema,
  contact: contactSchema,
  payment: paymentSchema,
  shipping: addressSchema,
});
