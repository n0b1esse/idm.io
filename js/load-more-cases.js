(function () {
  "use strict";

  const btn = document.querySelector("[data-load-more-cases]");
  if (!(btn instanceof HTMLButtonElement)) {
    return;
  }

  btn.addEventListener("click", () => {
    document.querySelectorAll(".portfolio-card.is-hidden-load").forEach((el) => {
      el.classList.remove("is-hidden-load");
    });
    btn.hidden = true;
  });
})();
