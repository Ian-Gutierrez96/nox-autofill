export default class NoxCollapsible extends HTMLButtonElement {
  static observedAttributes = ["aria-expanded"];

  #resizeObserver = new ResizeObserver(this.#resizeObserverCallback.bind(this));
  #controllees = this.getAttribute("aria-controls")
    .split(" ")
    .map((id) => document.getElementById(id));

  constructor() {
    super();

    this.addEventListener("click", this.#toggleExpandedAttribute);
    this.#controllees.forEach((controllee) =>
      controllee.addEventListener(
        "transitionend",
        this.#toggleHiddenAttribute.bind(this)
      )
    );
  }

  connectedCallback() {
    this.#controllees.forEach((controllee) =>
      this.#resizeObserver.observe(controllee, {
        box: "border-box",
      })
    );
  }

  #toggleHiddenAttribute({ currentTarget }) {
    currentTarget.hidden = currentTarget.offsetHeight === 0;
  }

  #resizeObserverCallback(entries) {
    if (this.ariaExpanded === "false") return;

    entries.forEach((entry) => {
      entry.target.style.maxHeight = entry.target.scrollHeight + "px";
    });
  }

  #toggleExpandedAttribute() {
    this.ariaExpanded = this.ariaExpanded === "true" ? "false" : "true";
  }

  attributeChangedCallback() {
    this.#controllees.forEach((controllee) => {
      if (this.ariaExpanded === "true") {
        controllee.style.maxHeight = controllee.scrollHeight + "px";
        controllee.hidden = false;
      } else {
        controllee.style.maxHeight = "0px";
      }
    });
  }

  set ariaControls(value) {
    this.setAttribute("aria-controls", value);
  }

  get ariaControls() {
    return this.getAttribute("aria-controls");
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#toggleExpandedAttribute);
    this.#resizeObserver.disconnect();
  }
}

window.customElements.define("nox-collapsible", NoxCollapsible, {
  extends: "button",
});
