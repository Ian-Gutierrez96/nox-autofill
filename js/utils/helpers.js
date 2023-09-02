/**
 * Retrieve an object's first property name found directly upon the object. Will
 * return null if the object has no properties.
 * @param {Object} obj - An object.
 */
export function getFirstKey(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return key;
    }
  }

  return null;
}

/**
 * Join a series of valid proxy properties with a semicolon.
 * @param  {...(string | number)} props - Proxy properties in specific order.
 */
export function createProxyDetails(...props) {
  return props.filter((prop) => Boolean(prop)).join(":");
}

/**
 * Convert a camelCase string to kebab-case.
 * @param {string} str - A camelCase string.
 */
export function kebabize(str) {
  return str.replace(
    /[A-Z]+(?![a-z])|[A-Z]/g,
    ($, ofs) => (ofs ? "-" : "") + $.toLowerCase()
  );
}
