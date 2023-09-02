const toastsListDiv = /** @type {HTMLDivElement} */ (
  document.getElementById("toasts-list")
);
const toastTemplate = /** @type {HTMLTemplateElement} */ (
  document.getElementById("toast-template")
);

/**
 * Create and display a toast notification fixed on the bottom right of the
 * user's viewport in order to communicate important feedback such as an error
 * occurring or a file being successfully uploaded.
 * @param {string} theme - Class modifier used for conveying the type of
 * feedback.
 * @param {string} title - Primary subject matter of the response.
 * @param {string} message - Paragraph or sentence providing details of the
 * notification's subject.
 */
export default function createToast(theme, title, message) {
  // Create a clone of the toast template's content
  const toastFragment = /** @type {DocumentFragment} */ (
    toastTemplate.content.cloneNode(true)
  );

  // Add the theme class modifier and attach the event listener that removes it
  const toastElement = toastFragment.getElementById("toast");
  toastElement.classList.add(`toast--${theme}`);
  toastElement.addEventListener("animationend", () => {
    toastElement.remove();
  });

  // Set the title heading's textContent
  const titleHeading = /** @type {HTMLHeadingElement} */ (
    toastFragment.getElementById("toast-title")
  );
  titleHeading.textContent = title;

  // Set the message paragraph's textContent
  const messageParagraph = /** @type {HTMLParagraphElement} */ (
    toastFragment.getElementById("toast-message")
  );
  messageParagraph.textContent = message;

  // Attach an event listener that removes the toast when closed
  const closeToastButton = /** @type {HTMLButtonElement} */ (
    toastFragment.getElementById("close-toast-btn")
  );
  closeToastButton.addEventListener("click", () => {
    toastElement.remove();
  });

  // Append the toast element to the list
  toastsListDiv.appendChild(toastElement);
}
