try {
  if (sessionStorage.getItem("zyra-open-white") || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("skip-open");
  }
} catch (e) {}
