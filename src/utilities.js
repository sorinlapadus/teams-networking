export function $(selector) {
  return document, document.querySelector(selector);
}
export function mask(element) {
  if (typeof element === "string") {
    element = $(element);
  }
  element && element.classList.add("loading-mask");
}
export function unmask(element) {
  if (typeof element === "string") {
    element = $(element);
  }
  element && element.classList.remove("loading-mask");
}
export function filterElements(elements, search) {
  search = search.toLowerCase();
  return elements.filter(element => {
    return Object.entries(element).some(([key, value]) => {
      if (key !== "id") {
        return value.toLowerCase().includes(search);
      }
    });
  });
}
export function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, ms);
  });
}
export function debounce(fn, msec) {
  let timer;
  return function (e) {
    const context = this;
    const args = arguments;
    clearTimeout(timer);
    setTimeout(function () {
      fn.apply(context, args);
    }, msec);
  };
}
