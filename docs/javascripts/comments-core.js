;(() => {
  function createElement(tagName, className, text) {
    const element = document.createElement(tagName)
    if (className) {
      element.className = className
    }
    if (text !== undefined) {
      element.textContent = text
    }
    return element
  }

  function pagePath() {
    return window.location.pathname
  }

  function pageUrl() {
    const canonical = document.querySelector("link[rel='canonical']")
    if (canonical instanceof HTMLLinkElement && canonical.href) {
      return canonical.href
    }
    return window.location.href.split("#")[0]
  }

  function pageTitle() {
    const heading = document.querySelector("h1")
    return cleanPageTitle(heading?.textContent ? heading.textContent : document.title)
  }

  function cleanPageTitle(value) {
    return value.replace(/\s*¶+\s*$/u, "").trim()
  }

  async function requestJson(url, options) {
    const response = await fetch(url, options)
    const body = await response.json().catch(() => ({}))
    return { response, body }
  }

  function formatDate(value) {
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) {
      return value
    }
    return new Intl.DateTimeFormat("ko-KR", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(date)
  }

  function buildCommentTree(comments) {
    const byId = new Map()
    const roots = []
    for (const comment of comments) {
      byId.set(comment.id, { comment, replies: [] })
    }
    for (const node of byId.values()) {
      const parentId = node.comment.parentId
      const parent = parentId ? byId.get(parentId) : undefined
      if (parent) {
        parent.replies.push(node)
      } else {
        roots.push(node)
      }
    }
    return { roots, byId }
  }

  window.AhaCommentsCore = {
    buildCommentTree,
    createElement,
    formatDate,
    pagePath,
    pageTitle,
    pageUrl,
    requestJson,
  }
})()
