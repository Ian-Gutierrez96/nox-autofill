"use strict";

/**
 * Optional autofilling parameters.
 * @typedef {object} AutofillOptions
 * @prop {PollingOptions} [polling] - Optional polling parameters.
 * @prop {TypeOptions} [type] - Optional typing parameters.
 * @prop {SelectOptions} [select] - Optional selecting parameters.
 */

/**
 * Optional polling parameters.
 * @typedef {Object} PollingOptions
 * @prop {Document | Element} [parent] - Query for the Element contained within
 * this Node.
 * @prop {boolean} [visible] - Wait for element to be present in DOM and to be
 * visible, i.e. to not have display: none or visibility: hidden CSS properties.
 */

/**
 * Optional selecting parameters.
 * @typedef {Object} SelectOptions
 * @prop {boolean} [text] - Select an option based upon its text content rather
 * than its value property.
 */

/**
 * Optional typing parameters.
 * @typedef {Object} TypeOptions
 * @prop {boolean} [keys] - Dispatch additional keyboard events such as keydown
 * and keyup while typing.
 */

/**
 * Automatically fill in an HTMLInputElement's value and dispatch an input and change
 * Event. Can optionally dispatch additional KeyboardEvents in sequential order in
 * the scenario where Events linked to typing are neccessary.
 * @param {HTMLInputElement} element - Form control to perform on.
 * @param {string} text - HTMLInputElement's new value.
 * @param {TypeOptions} [options] - Optional autofilling parameters.
 */
function typeText(element, text, options = {}) {
  const { keys: dispatchKeyboardEvents = false } = options;
  element.focus();

  if (dispatchKeyboardEvents) {
    element.dispatchEvent(
      new KeyboardEvent("keydown", { bubbles: true, cancelable: true })
    );
  }

  element.value = text;
  element.dispatchEvent(
    new Event("input", { bubbles: true, cancelable: true })
  );

  if (dispatchKeyboardEvents) {
    element.dispatchEvent(
      new KeyboardEvent("keyup", { bubbles: true, cancelable: true })
    );
  }

  element.dispatchEvent(
    new Event("change", { bubbles: true, cancelable: true })
  );
  element.blur();
}

/**
 * Get an Element's CSSStyleDeclaration and ensure that the visibility CSS property
 * is not set to hidden, along with making sure an Element is visible within the
 * viewport.
 * @param {Element} element - Element to determine visibility on.
 */
function isElementVisible(element) {
  const rect = element.getBoundingClientRect();
  return (
    getComputedStyle(element).visibility !== "hidden" &&
    !!(rect.top || rect.bottom || rect.width || rect.height)
  );
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

    case "fast":
      return autofill();

    case "hover":
      await new Promise((resolve) =>
        element.addEventListener("mouseover", resolve, { once: true })
      );
      return autofill();
  }

  async function autofill() {
    if (element instanceof HTMLButtonElement) {
      element.click();
    } else if (element instanceof HTMLInputElement) {
      if (element.value !== value) {
        typeText(element, value, options.type);
      }
    } else if (element instanceof HTMLSelectElement) {
      if (element.value !== value) {
        await selectOption(element, value, options.select);
      }
    }

    return element;
  }
}

/**
 * Wait for an HTMLElement with the selector to appear on the DOM and perform the
 * autofilling procedure.
 * @param {string} selector - CSS selector of the HTMLElement.
 * @param {string} value - HTMLInputElement's new value or the value of the
 * HTMLOptionElement to select.
 * @param {'click' | 'fast' | 'hover'} mode - Qualifier determining whether to
 * automatically change the HTMLElement's value or wait for the user to click or
 * hover over the Element.
 * @param {AutofillOptions} [options] - Optional autofilling parameters.
 * @returns {Promise<HTMLElement>} HTMLElement which autofilling was performed on.
 */
function autofillSelector(selector, value, mode, options) {
  return autofillSelectorOrXPath(selector, true, value, mode, options);
}

/**
 * Wait for an HTMLElement with the selector or XPath to appear on the DOM and
 * perform the autofill procedure.
 * @param {string} selectorOrXPath - CSS selector or XPath of the HTMLElement.
 * @param {boolean} isSelector - Whether to search for the field's HTMLInputElement
 * based off a CSS selector.
 * @param {string} value - HTMLInputElement's new value or the value of the
 * HTMLOptionElement to select.
 * @param {'click' | 'fast' | 'hover'} mode - Qualifier determining whether to
 * automatically change the HTMLElement's value or wait for the user to click or
 * hover over the Element.
 * @param {AutofillOptions} [options] - Optional autofilling parameters.
 * @returns {Promise<HTMLElement>} HTMLElement which autofilling was performed on.
 */
async function autofillSelectorOrXPath(
  selectorOrXPath,
  isSelector,
  value,
  mode,
  options = {}
) {
  const element = await waitForSelectorOrXPath(
    selectorOrXPath,
    isSelector,
    options.polling
  );
  return autofillHTMLElement(element, value, mode, options);
}

/**
 * Wait for an HTMLElement with the XPath to appear on the DOM and automatically
 * type in the HTMLInputElement's value or select an HTMLOptionElement's option
 * depending on the value passed in. Will autofill the form control in a nature
 * depending on the mode passed in, along with prescribing to the additional
 * options provided.
 * @param {string} xpath - XPath of the HTMLElement.
 * @param {string} value - HTMLInputElement's new value or the value of the
 * HTMLOptionElement to select.
 * @param {'click' | 'fast' | 'hover'} mode - Qualifier determining whether to
 * automatically change the HTMLElement's value or wait for the user to click or
 * hover over the Element.
 * @param {AutofillOptions} [options] - Optional autofilling parameters.
 * @returns {Promise<HTMLElement>} HTMLElement which autofilling was performed on.
 */
function autofillXPath(xpath, value, mode, options) {
  return autofillSelectorOrXPath(xpath, false, value, mode, options);
}

/**
 * Selects an element based on the XPath expression given in parameters.
 * @param {string} expression - A string representing the xpath to be
 * evaluated.
 * @param {Node} [contextNode] - The context node for the query. Will default
 * to the document.
 * @returns {Node | null} A Node representing the value of the single node
 * result, which may be null.
 */
function getElementByXPath(expression, contextNode = document) {
  return document.evaluate(
    expression,
    contextNode,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;
}

/**
 * Select an HTMLSelectElement's option with a corresponding value, along with
 * dispatching additional input and change Events. Can optionally choose to select
 * an HTMLOptionElement based off its textContent instead of value.
 * @param {HTMLSelectElement} element - The select element to choose from.
 * @param {string} value - Value or text of option to select.
 * @param {SelectOptions} [options] - Optional selecting parameters.
 * @return {Promise<HTMLOptionElement>} HTMLOptionElement selected based off its
 * value.
 */
async function selectOption(element, value, options = {}) {
  const { text: selectByText = false } = options;
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
    for (const option of element.options) {
      if (selectByText ? option.text === value : option.value === value) {
        option.selected = true;
        element.dispatchEvent(
          new InputEvent("input", { bubbles: true, cancelable: true })
        );
        element.dispatchEvent(
          new Event("change", { bubbles: true, cancelable: true })
        );
        element.blur();
        return option;
      }
    }

    return null;
  }
}

/**
 * Wait for changes to be made on a DOM node.
 * @param {Node} target - DOM node within the DOM tree to watch for changes, or
 * to be the root of a subtree of nodes to be watched.
 */
function waitForAddedNodes(target) {
  return new Promise((resolve) => {
    new MutationObserver((mutations, observer) => {
      for (const mutation of mutations) {
        if (mutation.addedNodes) {
          observer.disconnect();
          return resolve();
        }
      }
    }).observe(target, {
      subtree: true,
      childList: true,
    });
  });
}

/**
 * Wait until  an Element specified by a selector appears on the page. If at the
 * moment of calling the method the Element already exists, the method will return
 * immediately.
 * @param {string} selector - The selector to query for the Element from the parent
 * Node.
 * @param {PollingOptions} [options] - Optional waiting parameters.
 * @returns {Promise<HTMLElement>} Promise which resolves then the HTMLElement
 * specified by the selector is found in the DOM.
 */
function waitForSelector(selector, options) {
  return waitForSelectorOrXPath(selector, true, options);
}

/**
 * Wait until an HTMLElement specified by a selector or XPath appears on the page. If
 * at the moment of calling the method the HTMLElement already exists, the method will
 * return immediately.
 * @param {string} selectorOrXPath - The selector or XPath to query for the Element
 * from the parent Node.
 * @param {boolean} isSelector - Indicate whether the query string is a selector.
 * @param {PollingOptions} [options] - Optional waiting parameters.
 * @returns {Promise<HTMLElement>} Promise which resolves then the HTMLElement
 * specified by the selector or XPath is found in the DOM.
 */
async function waitForSelectorOrXPath(
  selectorOrXPath,
  isSelector,
  options = {}
) {
  const { parent: parentNode = document, visible: waitForVisible = false } =
    options;

  return (
    getElement() ??
    new Promise((resolve) => {
      if (waitForVisible) {
        onRaf();

        function onRaf() {
          const element = getElement();

          if (element instanceof HTMLElement) {
            resolve(element);
          } else {
            requestAnimationFrame(onRaf);
          }
        }
      } else {
        new MutationObserver((_mutations, observer) => {
          const element = getElement();

          if (element instanceof HTMLElement) {
            observer.disconnect();
            resolve(element);
          }
        }).observe(parentNode, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      }
    })
  );

  function getElement() {
    const element = isSelector
      ? parentNode.querySelector(selectorOrXPath)
      : getElementByXPath(selectorOrXPath, parentNode);

    return element instanceof HTMLElement
      ? waitForVisible
        ? waitForVisible === isElementVisible(element)
          ? element
          : null
        : element
      : null;
  }
}

/**
 * Pause script execution for the given number of milliseconds before continuing.
 * @param {number} milliseconds - The number of milliseconds to wait for.
 * @returns {Promise} Promise which resolves after the timeout has been completed.
 */
function waitForTimeout(milliseconds) {
  return new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });
}

/**
 * Wait until an Element specified by a XPath appears on the page. If at the moment
 * of calling the method the Element already exists, the method will return
 * immediately.
 * @param {string} xPath - The XPath to query for the Element from the parent Node.
 * @param {PollingOptions} [options] - Optional waiting parameters.
 * @returns {Promise<HTMLElement>} Promise which resolves then the HTMLElement
 * specified by the XPath is found in the DOM.
 */
function waitForXPath(xPath, options) {
  return waitForSelectorOrXPath(xPath, false, options);
}
