window.DomUtils = Object.freeze({
  selectElement(selector, root = document) {
    return root.querySelector(selector);
  },

  setHtml(element, html) {
    if (!element) {
      return;
    }

    element.innerHTML = html;
  }
});

