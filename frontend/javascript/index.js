import "$styles/index.css"

// Import all JavaScript & CSS files from src/_components
import components from "$components/**/*.{js,jsx,js.rb,css}"

document.addEventListener("DOMContentLoaded", () => {
  initSearch()
  initReadingProgress()
  initBackToTop()
  initHeadingAnchors()
  initCodeCopyButtons()
  initLightbox()
  initAutoTOC()
  initExternalLinks()
  initThemeToggle()
  initFontSize()
  initKeyboardNav()
  initSmoothScroll()
  initSocialShare()
  initProjectFilter()
  initHamburgerMenu()
})

// ── Search ──────────────────────────────────────────────────
function initSearch() {
  const toggle = document.querySelector(".nav-search-toggle")
  const searchBar = document.querySelector(".nav-search-bar")
  const searchInput = searchBar?.querySelector(".search-input")
  const closeBtn = document.querySelector(".nav-search-close")

  if (!toggle || !searchBar || !searchInput) return

  let searchIndex = null

  toggle.addEventListener("click", (e) => {
    e.preventDefault()
    searchBar.hidden = !searchBar.hidden
    if (!searchBar.hidden) searchInput.focus()
  })

  closeBtn.addEventListener("click", () => {
    searchBar.hidden = true
    searchInput.value = ""
    const container = searchBar.querySelector(".search-results")
    if (container) container.innerHTML = ""
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !searchBar.hidden) {
      searchBar.hidden = true
      searchInput.value = ""
      const container = searchBar.querySelector(".search-results")
      if (container) container.innerHTML = ""
    }
    if ((e.key === "/" || (e.key === "k" && (e.metaKey || e.ctrlKey))) && searchBar.hidden) {
      e.preventDefault()
      searchBar.hidden = false
      searchInput.focus()
    }
  })

  searchInput.addEventListener("focus", async () => {
    if (searchIndex) return
    try {
      const response = await fetch(searchInput.dataset.searchUrl)
      searchIndex = await response.json()
    } catch (e) {
      console.warn("Could not load search index:", e)
    }
  })

  searchInput.addEventListener("input", () => {
    if (!searchIndex) return
    const query = searchInput.value.toLowerCase().trim()
    const container = searchBar.querySelector(".search-results")
    if (!container) return

    if (query.length < 2) {
      container.innerHTML = ""
      return
    }

    const results = searchIndex.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.categories.toLowerCase().includes(query) ||
      item.tags.toLowerCase().includes(query) ||
      (item.content && item.content.toLowerCase().includes(query))
    )

    container.innerHTML = results.slice(0, 10).map(r =>
      `<div class="post-card"><h3><a href="${r.url}">${r.title}</a></h3>
       <div class="post-card-meta"><time>${r.date}</time></div></div>`
    ).join("")
  })
}

// ── Reading Progress Bar ────────────────────────────────────
function initReadingProgress() {
  const bar = document.querySelector(".reading-progress")
  if (!bar) return

  function updateProgress() {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - window.innerHeight
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
    bar.style.width = `${Math.min(progress, 100)}%`
  }

  window.addEventListener("scroll", updateProgress, { passive: true })
  updateProgress()
}

// ── Back to Top Button ──────────────────────────────────────
function initBackToTop() {
  const btn = document.querySelector(".back-to-top")
  if (!btn) return

  window.addEventListener("scroll", () => {
    btn.hidden = window.scrollY < 400
  }, { passive: true })

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  })
}

// ── Heading Anchor Links ────────────────────────────────────
function initHeadingAnchors() {
  const content = document.querySelector(".post-content")
  if (!content) return

  content.querySelectorAll("h2[id], h3[id], h4[id]").forEach(heading => {
    const anchor = document.createElement("a")
    anchor.className = "heading-anchor"
    anchor.href = `#${heading.id}`
    anchor.textContent = "#"
    anchor.setAttribute("aria-label", `Link to ${heading.textContent}`)
    heading.appendChild(anchor)
  })
}

// ── Code Copy Buttons ───────────────────────────────────────
function initCodeCopyButtons() {
  document.querySelectorAll("pre").forEach(pre => {
    const code = pre.querySelector("code")
    if (!code) return

    const btn = document.createElement("button")
    btn.className = "code-copy-btn"
    btn.textContent = "Copy"
    btn.setAttribute("aria-label", "Copy code to clipboard")

    btn.addEventListener("click", async () => {
      try {
        await navigator.clipboard.writeText(code.textContent)
        btn.textContent = "Copied!"
        btn.classList.add("copied")
        setTimeout(() => {
          btn.textContent = "Copy"
          btn.classList.remove("copied")
        }, 2000)
      } catch (e) {
        btn.textContent = "Failed"
        setTimeout(() => { btn.textContent = "Copy" }, 2000)
      }
    })

    pre.appendChild(btn)
  })
}

// ── Image Lightbox ──────────────────────────────────────────
function initLightbox() {
  const content = document.querySelector(".post-content")
  if (!content) return

  content.querySelectorAll("img").forEach(img => {
    img.addEventListener("click", () => {
      const overlay = document.createElement("div")
      overlay.className = "lightbox-overlay"
      const clone = document.createElement("img")
      clone.src = img.src
      clone.alt = img.alt
      overlay.appendChild(clone)
      document.body.appendChild(overlay)
      requestAnimationFrame(() => overlay.classList.add("active"))

      const close = () => {
        overlay.classList.remove("active")
        setTimeout(() => overlay.remove(), 200)
      }
      overlay.addEventListener("click", close)
      document.addEventListener("keydown", function handler(e) {
        if (e.key === "Escape") {
          close()
          document.removeEventListener("keydown", handler)
        }
      })
    })
  })
}

// ── Auto Table of Contents ──────────────────────────────────
function initAutoTOC() {
  const sidebar = document.getElementById("toc-sidebar")
  const content = document.querySelector(".post-content")
  if (!sidebar || !content) return

  const headings = content.querySelectorAll("h2[id], h3[id], h4[id]")
  if (headings.length < 3) return

  const nav = document.createElement("nav")
  nav.className = "auto-toc"
  const title = document.createElement("h3")
  title.className = "toc-title"
  title.textContent = "Contents"
  nav.appendChild(title)

  const ul = document.createElement("ul")
  headings.forEach(h => {
    const li = document.createElement("li")
    li.className = `toc-${h.tagName.toLowerCase()}`
    const a = document.createElement("a")
    a.href = `#${h.id}`
    a.textContent = h.textContent.replace(/#$/, "").trim()
    li.appendChild(a)
    ul.appendChild(li)
  })
  nav.appendChild(ul)
  sidebar.appendChild(nav)

  // Highlight active heading on scroll
  const tocLinks = nav.querySelectorAll("a")
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        tocLinks.forEach(l => l.classList.remove("active"))
        const active = nav.querySelector(`a[href="#${entry.target.id}"]`)
        if (active) active.classList.add("active")
      }
    })
  }, { rootMargin: "0px 0px -70% 0px", threshold: 0 })

  headings.forEach(h => observer.observe(h))
}

// ── External Link Indicators ────────────────────────────────
function initExternalLinks() {
  const content = document.querySelector(".post-content")
  if (!content) return

  const siteHost = window.location.hostname
  content.querySelectorAll("a[href]").forEach(link => {
    try {
      const url = new URL(link.href)
      if (url.hostname && url.hostname !== siteHost) {
        link.classList.add("external-link")
        link.setAttribute("target", "_blank")
        link.setAttribute("rel", "noopener noreferrer")
      }
    } catch (e) { /* relative URLs, anchors */ }
  })
}

// ── Theme Toggle (Light/Dark) ──────────────────────────────
function initThemeToggle() {
  const btn = document.querySelector(".theme-toggle")
  if (!btn) return

  const saved = localStorage.getItem("theme")
  if (saved === "light") document.documentElement.classList.add("light-theme")

  btn.addEventListener("click", () => {
    document.documentElement.classList.toggle("light-theme")
    const isLight = document.documentElement.classList.contains("light-theme")
    localStorage.setItem("theme", isLight ? "light" : "dark")
  })
}

// ── Font Size Controls ─────────────────────────────────────
function initFontSize() {
  const buttons = document.querySelectorAll(".font-size-btn")
  if (!buttons.length) return

  const saved = localStorage.getItem("fontSize")
  if (saved) document.documentElement.style.fontSize = saved

  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      const current = parseFloat(getComputedStyle(document.documentElement).fontSize)
      const action = btn.dataset.action
      let next = action === "increase" ? current + 2 : current - 2
      next = Math.max(12, Math.min(24, next))
      document.documentElement.style.fontSize = `${next}px`
      localStorage.setItem("fontSize", `${next}px`)
    })
  })
}

// ── Keyboard Navigation ────────────────────────────────────
function initKeyboardNav() {
  document.addEventListener("keydown", (e) => {
    if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return

    if (e.key === "j" || e.key === "ArrowRight") {
      const next = document.querySelector(".post-nav .btn:last-child")
      if (next) next.click()
    }
    if (e.key === "k" || e.key === "ArrowLeft") {
      const prev = document.querySelector(".post-nav .btn:first-child")
      if (prev) prev.click()
    }
    if (e.key === "h") {
      window.location.href = document.querySelector(".site-logo")?.href || "/"
    }
  })
}

// ── Smooth Scroll for Anchor Links ─────────────────────────
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener("click", (e) => {
      const target = document.querySelector(anchor.getAttribute("href"))
      if (!target) return
      e.preventDefault()
      target.scrollIntoView({ behavior: "smooth", block: "start" })
      history.pushState(null, "", anchor.getAttribute("href"))
    })
  })
}

// ── Project Filter & Sort ──────────────────────────────────
function initProjectFilter() {
  const input = document.getElementById("project-filter")
  const sortSelect = document.getElementById("project-sort-select")
  const grid = document.getElementById("projects-grid")
  if (!grid) return

  if (input) {
    input.addEventListener("input", () => {
      const query = input.value.toLowerCase().trim()
      grid.querySelectorAll(".project-card").forEach(card => {
        const text = card.textContent.toLowerCase()
        card.classList.toggle("filter-hidden", query.length > 0 && !text.includes(query))
      })
    })
  }

  if (sortSelect) {
    sortSelect.addEventListener("change", () => {
      const cards = [...grid.querySelectorAll(".project-card")]
      const sortBy = sortSelect.value

      cards.sort((a, b) => {
        if (sortBy === "downloads") {
          return parseInt(b.dataset.downloads || 0) - parseInt(a.dataset.downloads || 0)
        } else if (sortBy === "updated") {
          return (b.dataset.updated || "").localeCompare(a.dataset.updated || "")
        } else {
          return (a.dataset.name || "").localeCompare(b.dataset.name || "")
        }
      })

      cards.forEach(card => grid.appendChild(card))
    })
  }
}

// ── Hamburger Menu ────────────────────────────────────────
function initHamburgerMenu() {
  const btn = document.querySelector(".nav-hamburger")
  if (!btn) return

  const nav = btn.closest(".site-nav")
  const ul = nav?.querySelector("ul")
  if (!ul) return

  btn.addEventListener("click", () => {
    const expanded = btn.getAttribute("aria-expanded") === "true"
    btn.setAttribute("aria-expanded", !expanded)
    ul.classList.toggle("nav-open")
  })
}

// ── Social Share Buttons ───────────────────────────────────
function initSocialShare() {
  document.querySelectorAll(".share-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      e.preventDefault()
      const url = encodeURIComponent(window.location.href)
      const title = encodeURIComponent(document.title)
      const type = btn.dataset.share

      if (type === "x") {
        window.open(`https://x.com/intent/tweet?url=${url}&text=${title}`, "_blank", "width=550,height=420")
      } else if (type === "linkedin") {
        window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank", "width=550,height=420")
      } else if (type === "email") {
        window.location.href = `mailto:?subject=${title}&body=${url}`
      } else if (type === "copy") {
        navigator.clipboard.writeText(window.location.href).then(() => {
          btn.classList.add("copied")
          setTimeout(() => btn.classList.remove("copied"), 2000)
        })
      }
    })
  })
}
