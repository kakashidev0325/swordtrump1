// Trump Wif Sword — paste the real mint when the coin is live.
// ca: a Solana mint address, or "TBA" until it exists.
// twitter / telegram: full URLs, or "" to hide the buttons.
const SITE = {
  name: "Trump Wif Sword",
  ticker: "swordtrump",
  ca: "TBA",
  twitter: "https://x.com/swordtrump_x",
  telegram: "https://t.me/swordtrump_tg",
};

const ca = (SITE.ca || "").trim();
const live = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(ca);
const pumpUrl = live ? `https://pump.fun/coin/${ca}` : "https://pump.fun";

function shorten(value) {
  if (value.length <= 18) return value;
  return `${value.slice(0, 6)}…${value.slice(-6)}`;
}

function toast(message) {
  const el = document.getElementById("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toast._t);
  toast._t = setTimeout(() => el.classList.remove("show"), 2200);
}

function hydrate() {
  document.querySelectorAll("[data-buy]").forEach((el) => {
    el.href = pumpUrl;
  });

  const code = document.getElementById("caValue");
  const action = document.getElementById("caAction");
  const chip = document.getElementById("caChip");
  const footer = document.getElementById("footerMint");

  if (live) {
    code.textContent = shorten(ca);
    code.title = ca;
    action.textContent = "Copy";
    chip.setAttribute("aria-label", `Copy mint address ${ca}`);
    footer.textContent = `Mint: ${ca}`;
  } else {
    const label = ca || "TBA";
    code.textContent = label;
    code.removeAttribute("title");
    action.textContent = "Soon";
    chip.setAttribute("aria-label", `Mint address ${label}`);
    footer.textContent = `Mint: ${label}`;
  }

  const dex = document.getElementById("linkDex");
  if (live && dex) {
    dex.href = `https://dexscreener.com/solana/${ca}`;
    dex.hidden = false;
  }

  let socialsLive = false;
  [
    ["twitter", SITE.twitter],
    ["telegram", SITE.telegram],
  ].forEach(([key, url]) => {
    const link = document.querySelector(`[data-social="${key}"]`);
    const clean = (url || "").trim();
    if (!link || !clean) return;
    link.href = clean;
    link.hidden = false;
    socialsLive = true;
  });

  const soon = document.querySelector("#join .intro");
  if (socialsLive && soon) soon.hidden = true;
}

async function copyMint() {
  if (!live) {
    toast(`Mint is ${ca || "TBA"}.`);
    return;
  }
  try {
    await navigator.clipboard.writeText(ca);
    toast("Mint copied.");
  } catch {
    const code = document.getElementById("caValue");
    const range = document.createRange();
    range.selectNodeContents(code);
    const selection = window.getSelection();
    selection.removeAllRanges();
    selection.addRange(range);
    toast("Select the mint and copy it.");
  }
}

function setupNav() {
  const nav = document.getElementById("nav");
  const toggle = document.getElementById("navToggle");
  const menu = document.getElementById("navMenu");

  const onScroll = () => nav.classList.toggle("scrolled", window.scrollY > 12);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  const close = () => {
    menu.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
  };

  toggle.addEventListener("click", () => {
    const open = menu.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });

  menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", close));
  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") close();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 800) close();
  });

  const links = [...menu.querySelectorAll("a[href^='#']")];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  const spy = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.classList.toggle("is-active", link.getAttribute("href") === `#${entry.target.id}`);
        });
      });
    },
    { rootMargin: "-45% 0px -48% 0px" }
  );
  sections.forEach((section) => spy.observe(section));
}

function setupReveal() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const nodes = document.querySelectorAll(".reveal");
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.18 }
  );
  nodes.forEach((node) => io.observe(node));
}

function setupEmbers() {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const canvas = document.getElementById("embers");
  const media = document.querySelector(".hero-media");
  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const resize = () => {
    const rect = media.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.floor(rect.width * dpr));
    canvas.height = Math.max(1, Math.floor(rect.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  const spawn = (scattered) => {
    const wide = window.innerWidth > 760;
    const bias = wide ? 0.2 : 0.42;
    const spread = wide ? 0.5 : 0.55;
    return {
      x: Math.min(1, Math.max(0, bias + (Math.random() - 0.5) * spread)),
      y: scattered ? Math.random() : 0.78 + Math.random() * 0.28,
      r: Math.random() * 1.8 + 0.35,
      v: 0.05 + Math.random() * 0.1,
      drift: (Math.random() - 0.5) * 0.04,
      a: 0.25 + Math.random() * 0.7,
      tw: Math.random() * Math.PI * 2,
    };
  };

  const sparks = Array.from({ length: 54 }, () => spawn(true));
  let last = 0;
  let raf = 0;

  const draw = (time) => {
    raf = requestAnimationFrame(draw);
    if (!last) last = time;
    const dt = Math.min(0.034, (time - last) / 1000);
    last = time;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    sparks.forEach((spark) => {
      spark.y -= spark.v * dt;
      spark.x += spark.drift * dt;
      spark.tw += dt * 3;
      if (spark.y < -0.03 || spark.x < -0.05 || spark.x > 1.05) Object.assign(spark, spawn(false));
      const alpha = spark.a * (0.62 + 0.38 * Math.sin(spark.tw));
      ctx.beginPath();
      ctx.fillStyle = `rgba(255, ${190 + Math.floor(spark.a * 50)}, 110, ${alpha})`;
      ctx.shadowBlur = 12;
      ctx.shadowColor = "rgba(255, 170, 50, 0.9)";
      ctx.arc(spark.x * w, spark.y * h, spark.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.shadowBlur = 0;
  };

  resize();
  const observer = new ResizeObserver(resize);
  observer.observe(media);

  const play = () => {
    if (raf || document.hidden) return;
    last = 0;
    raf = requestAnimationFrame(draw);
  };
  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
  };

  document.addEventListener("visibilitychange", () => (document.hidden ? stop() : play()));
  play();
}

document.getElementById("caChip").addEventListener("click", copyMint);
hydrate();
setupNav();
setupReveal();
setupEmbers();
