const addressSchema = joi.object({
  addressLevel1: joi.string().allow("", null),
  addressLevel2: joi.string().allow("", null),
  addressLine1: joi.string(),
  addressLine2: joi.string().allow(""),
  country: joi.string(),
  familyName: joi.string(),
  givenName: joi.string(),
  postalCode: joi.string().allow("", null),
});

const paymentSchema = joi.object({
  ccCSC: joi.string().pattern(/\d{3,4}/, "credit card security code"),
  ccExpMonth: joi.string().pattern(/^(?:[1-9]|1[0-2])$/, "expiration month"),
  ccExpYear: joi.string().pattern(/^\d{2}$/, "expiration year"),
  ccFamilyName: joi.string(),
  ccGivenName: joi.string(),
  ccNumber: joi.string().pattern(/^\d+$/, "credit card number"),
  ccType: joi.string().allow(""),
});

const contactSchema = joi.object({
  email: joi.string(),
  tel: joi.string().pattern(/^\d+$/, "phone number"),
  username: joi.string(),
});

export default joi.object({
  billing: addressSchema,
  contact: contactSchema,
  payment: paymentSchema,
  shipping: addressSchema,
});
