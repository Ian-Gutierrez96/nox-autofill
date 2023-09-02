/**
 * A notice displayed on the user's announcement feed containing important
 * information such as their checkouts or upcoming dates.
 * @typedef Announcement
 * @property {string[]} lines - Each paragraph displayed and separated by a
 * line break.
 * @property {string} theme - Color scheme applied to the announcement.
 * @property {string} title - Text bolded and displayed above the paragraphs.
 */

/**
 * Information of a checkout used for displaying in the dashboard's
 * announcement feed.
 * @typedef {Object} Checkout
 * @prop {number} productPrice - Checkout order's subtotal price.
 * @prop {string} purchaseDate - Date the order was purchased in ISO format.
 * @prop {boolean} wasSuccessful - Boolean indicating whether the purchase was
 * successful.
 */

/**
 * Address information of the user.
 * @typedef {Object} Address
 * @property {String} addressLevel1 - The first administrative level in the
 * address. This is typically the province in which the address is located. In
 * the United States, this would be the state. In Switzerland, the canton. In
 * the United Kingdom, the post town.
 * @property {String} addressLevel2 - The second administrative level, in
 * addresses with at least two of them. In countries with two administrative
 * levels, this would typically be the city, town, village, or other locality in
 * which the address is located.
 * @property {String} addressLine1 - First line of the street address.
 * @property {String} addressLine2 - Second line of the street adress.
 * @property {String} country - A country or territory name.
 * @property {String} givenName - The given (or "first") name.
 * @property {String} familyName - The family (or "last") name.
 * @property {String} postalCode - A postal code (in the United States, this is
 * the ZIP code).
 */

/**
 * Contact information of the user.
 * @typedef {Object} Contact
 * @property {string} email - An email address.
 * @property {string} tel - A full telephone number, including the country code.
 * @property {string} username - A username or profile name.
 */

/**
 * Payment information of the user.
 * @typedef {Object} Payment
 * @property {string} ccCSC - The security code for the payment instrument; on
 * credit cards, this is the 3-digit verification number on the back of the
 * card.
 * @property {string} ccExpMonth - The month in which the payment method
 * expires.
 * @property {string} ccExpYear - The year in which the payment method expires.
 * @property {string} ccFamilyName - A family name, as given on a credit card.
 * @property {string} ccGivenName - A given (first) name as given on a payment
 * instrument like a credit card.
 * @property {string} ccNumber - A credit card number or other number
 * identifying a payment method, such as an account number.
 * @property {string} ccType - The type of payment instrument (such as "Visa" or
 * "Master Card").
 */

/**
 * A profile used for storing information required during the checkout process
 * of e-commerce sites.
 * @typedef {Object} Profile
 * @property {Address} billing - Billing address of the user.
 * @property {Contact} contact - Contact information of the user.
 * @property {Address} shipping - Shipping address of the user.
 * @property {Payment} payment - Payment information of the user.
 */

/**
 * Settings used during the autofill/autocheckout process of a specific site.
 * @typedef {Object} Script
 * @prop {boolean} [autocheckoutEnabled] - Whether the page automatically fills
 * in the information and clicks the continue/submit buttons.
 * @prop {boolean} [autofillEnabled] - Whether the page automatically fills in
 * the information
 * @prop {boolean} [enabled] - Whether the universal feature is performed.
 * @prop {'click' | 'fast' | 'hover'} [mode] - Defines whether form fields are
 * filled in automatically, during a click event, or when hovered over.
 * @prop {string} [origin] - The e-commerce site's URL's origin.
 * @prop {string} [profileKey] - Key mapped to the profile used for
 * automatically filling in the information.
 */

/**
 * Global settings used to configure functionalities of NOX.
 * @typedef {Object} Settings
 * @property {string[]} blacklistedSites - List of sites which NOX shouldn't
 * autofill information.
 * @property {boolean} darkMode - Whether the NOX dashboard adopts a dark mode
 * UI.
 * @property {boolean} notifications - Whether NOX displays a message on a
 * site's front page indicating autofill/autocheckout is enabled for the page.
 */

/**
 * Information for a proxy which acts as an intermediary between a client
 * requesting a resource and the site's server.
 * @typedef {object} Proxy
 * @property {string} host - String containing the host, that is the hostname.
 * @property {boolean} isActive - Boolean indicating whether the proxy is
 * currently active on the browser.
 * @property {string} [password] - The password used for authenticating a proxy.
 * @property {number} port - Proxy's port.
 * @property {string} name - Custom name for the proxy defined by the user.
 * @property {string} scheme - Scheme (protocol) of the proxy server itself.
 * Defaults to 'http'.
 * @property {string} [username] - The username used for authenticating a proxy.
 */
