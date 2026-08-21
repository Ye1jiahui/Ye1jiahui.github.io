const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelectorAll(".site-nav a");
const lightbox = document.querySelector(".lightbox");
const lightboxImage = lightbox?.querySelector("img");
const lightboxClose = document.querySelector(".lightbox-close");
const lightboxPlaceholder = "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=";
const previewButtons = document.querySelectorAll("[data-full]");

const mobileMediaQuery = window.matchMedia("(max-width: 700px)");

function getCarouselSource(image) {
  if (!image) return "";
  return mobileMediaQuery.matches
    ? image.dataset.carouselMobileSrc || image.dataset.carouselSrc
    : image.dataset.carouselDesktopSrc || image.dataset.carouselSrc;
}

// 轮播初始化只请求当前页，用户滑动后再请求新的当前页，避免首屏并发下载整组图片。
function loadCarouselImages(images, activeIndex) {
  const image = images[activeIndex];
  const source = getCarouselSource(image);
  if (image && source && image.getAttribute("src") !== source) image.src = source;
}

function loadDeferredImage(image) {
  if (!image) return;
  const mobile = mobileMediaQuery.matches;
  const source = image.closest("picture")?.querySelector("source[data-mobile-srcset]");
  const sourceSet = mobile ? source?.dataset.mobileSrcset : source?.dataset.desktopSrcset;
  if (source && sourceSet) source.srcset = sourceSet;
  const deferredSource = mobile ? image.dataset.mobileSrc || image.dataset.deferredSrc : image.dataset.desktopSrc || image.dataset.deferredSrc;
  if (deferredSource && image.getAttribute("src") !== deferredSource) image.src = deferredSource;
  image.removeAttribute("data-mobile-src");
  image.removeAttribute("data-desktop-src");
  image.removeAttribute("data-deferred-src");
}

// 让项目和思考的视觉顺序同时成为文档阅读顺序。
const notesSection = document.querySelector("#notes");
const projectsSection = document.querySelector("#projects");
const aboutSection = document.querySelector("#about");
if (notesSection && projectsSection) notesSection.before(projectsSection);
if (aboutSection && notesSection) notesSection.after(aboutSection);

function closeNav() {
  document.body.classList.remove("nav-open");
  navToggle?.setAttribute("aria-expanded", "false");
}

navToggle?.addEventListener("click", () => {
  const isOpen = document.body.classList.toggle("nav-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
});

navLinks.forEach((link) => link.addEventListener("click", closeNav));

function openLightbox(source, alt) {
  if (!lightbox || !lightboxImage) return;
  lightboxImage.src = source;
  lightboxImage.alt = alt;
  lightbox.hidden = false;
  document.body.classList.add("lightbox-open");
  lightboxClose?.focus();
}

function closeLightbox() {
  if (!lightbox || !lightboxImage) return;
  lightbox.hidden = true;
  lightboxImage.src = lightboxPlaceholder;
  lightboxImage.alt = "";
  document.body.classList.remove("lightbox-open");
}

previewButtons.forEach((button) => {
  button.addEventListener("click", () => {
    openLightbox(button.dataset.full, button.dataset.alt || "项目流程图预览");
  });
});

// 金融图集滑动时，同步右侧的交易说明。
const tradeCarousel = document.querySelector(".trade-carousel");
const tradeNotes = [...document.querySelectorAll(".trade-note")];
const tradeImages = tradeCarousel ? [...tradeCarousel.querySelectorAll("img[data-carousel-src]")] : [];
let tradeScrollTimer;

function syncTradeNote() {
  if (!tradeCarousel || tradeNotes.length === 0) return;
  const gap = Number.parseFloat(getComputedStyle(tradeCarousel).columnGap) || 0;
  const index = Math.max(0, Math.min(tradeNotes.length - 1, Math.round(tradeCarousel.scrollLeft / (tradeCarousel.clientWidth + gap))));
  loadCarouselImages(tradeImages, index);
  tradeNotes.forEach((note, noteIndex) => note.classList.toggle("is-active", noteIndex === index));
}

tradeCarousel?.addEventListener("scroll", () => {
  window.clearTimeout(tradeScrollTimer);
  tradeScrollTimer = window.setTimeout(syncTradeNote, 60);
});
syncTradeNote();

// 游戏图集滑动时，突出当前图片对应的文字介绍。
const gameGallery = document.querySelector(".game-gallery");
const gameNotes = [...document.querySelectorAll("[data-game-note]")];
const gameImages = gameGallery ? [...gameGallery.querySelectorAll("img[data-carousel-src]")] : [];
let gameScrollTimer;

function syncGameNote() {
  if (!gameGallery || gameNotes.length === 0) return;
  const gap = Number.parseFloat(getComputedStyle(gameGallery).columnGap) || 0;
  const index = Math.max(0, Math.min(gameNotes.length - 1, Math.round(gameGallery.scrollLeft / (gameGallery.clientWidth + gap))));
  loadCarouselImages(gameImages, index);
  gameNotes.forEach((note, noteIndex) => note.classList.toggle("is-active", noteIndex === index));
}

gameGallery?.addEventListener("scroll", () => {
  window.clearTimeout(gameScrollTimer);
  gameScrollTimer = window.setTimeout(syncGameNote, 60);
});
syncGameNote();

// 视口变化时切换到对应尺寸资源，旋转手机后不继续使用桌面大图。
mobileMediaQuery.addEventListener?.("change", () => {
  loadCarouselImages(tradeImages, 0);
  loadCarouselImages(gameImages, 0);
});

// 只提前约 280px 准备图片，避免浏览器默认懒加载阈值在首屏外下载过多资源。
const deferredImages = document.querySelectorAll("img[data-mobile-src], img[data-deferred-src]");
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        loadDeferredImage(entry.target);
        instance.unobserve(entry.target);
      }
    });
  }, { rootMargin: "280px 0px" });
  deferredImages.forEach((image) => imageObserver.observe(image));
} else {
  deferredImages.forEach(loadDeferredImage);
}

// 统一处理失败状态，保证加载失败时仍保留可操作的版式。
document.querySelectorAll("img").forEach((image) => {
  image.addEventListener("error", () => image.closest("button, figure")?.classList.add("image-failed"));
  image.addEventListener("load", () => image.closest("button, figure")?.classList.remove("image-failed"));
});

lightboxClose?.addEventListener("click", closeLightbox);
lightbox?.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeLightbox();
    closeNav();
  }
});

const revealItems = document.querySelectorAll(".reveal");
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, instance) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        instance.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });
  revealItems.forEach((item) => observer.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}
