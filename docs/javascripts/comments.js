;(() => {
  const roots = new WeakMap()
  let turnstileLoading = null
  const core = window.AhaCommentsCore

  function setMessage(state, message) {
    state.message.textContent = message
  }

  function renderCommentNode(node) {
    const item = core.createElement("article", "aha-comments__item")
    if (node.comment.status === "deleted") {
      item.classList.add("aha-comments__item--deleted")
    }
    item.id = `comment-${node.comment.id}`
    const meta = core.createElement("div", "aha-comments__meta")
    meta.append(
      core.createElement("span", "aha-comments__author", node.comment.authorName),
      core.createElement("time", "", core.formatDate(node.comment.createdAt)),
    )
    const body = core.createElement("p", "aha-comments__body", node.comment.body)
    item.append(meta, body)
    if (node.replies.length > 0) {
      const replies = core.createElement("div", "aha-comments__replies")
      for (const child of node.replies) {
        replies.append(renderCommentNode(child))
      }
      item.append(replies)
    }
    return item
  }

  async function loadComments(state) {
    setMessage(state, "댓글을 불러오는 중이에요.")
    const url = new URL("/api/comments", window.location.origin)
    url.searchParams.set("page_path", core.pagePath())
    const result = await core.requestJson(url)
    state.list.replaceChildren()
    if (!result.response.ok) {
      setMessage(state, "댓글을 불러오지 못했어요. 잠시 뒤 다시 시도해주세요.")
      return
    }
    const comments = Array.isArray(result.body.comments) ? result.body.comments : []
    const tree = core.buildCommentTree(comments)
    for (const node of tree.roots) {
      state.list.append(renderCommentNode(node))
    }
    setMessage(state, comments.length === 0 ? "아직 댓글이 없어요." : "")
  }

  function loadTurnstile() {
    if (window.turnstile) {
      return Promise.resolve(window.turnstile)
    }
    if (turnstileLoading) {
      return turnstileLoading
    }
    turnstileLoading = new Promise((resolve, reject) => {
      const script = document.createElement("script")
      script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit"
      script.async = true
      script.defer = true
      script.addEventListener("load", () => {
        if (window.turnstile) {
          resolve(window.turnstile)
          return
        }
        reject(new Error("turnstile unavailable"))
      })
      script.addEventListener("error", reject)
      document.head.append(script)
    })
    return turnstileLoading
  }

  async function renderTurnstile(root, state) {
    const siteKey = root.dataset.turnstileSiteKey
    if (!siteKey || siteKey.startsWith("<REPLACE_")) {
      state.formMessage.textContent = "댓글 작성 전에 Turnstile 사이트 키를 설정해야 해요."
      return
    }
    try {
      const turnstile = await loadTurnstile()
      state.turnstileWidget = turnstile.render(state.challenge, {
        sitekey: siteKey,
        callback: (token) => {
          state.turnstileToken = token
          state.submit.disabled = false
        },
        "expired-callback": () => {
          state.turnstileToken = ""
          state.submit.disabled = true
        },
      })
    } catch (_error) {
      state.formMessage.textContent = "스팸 방지 확인을 불러오지 못했어요."
    }
  }

  function resetTurnstile(state) {
    state.turnstileToken = ""
    state.submit.disabled = true
    if (window.turnstile && state.turnstileWidget) {
      window.turnstile.reset(state.turnstileWidget)
    }
  }

  function buildInput(labelText, name, required) {
    const label = core.createElement("label", "aha-comments__field")
    const caption = core.createElement("span", "", labelText)
    const input = document.createElement("input")
    input.name = name
    input.autocomplete = "name"
    input.required = required
    label.append(caption, input)
    return label
  }

  function buildForm(root, state) {
    const form = core.createElement("form", "aha-comments__form")
    const row = core.createElement("div", "aha-comments__row")
    row.append(buildInput("이름", "authorName", true))

    const bodyLabel = core.createElement("label", "aha-comments__field")
    bodyLabel.append(core.createElement("span", "", "댓글"))
    const body = document.createElement("textarea")
    body.name = "body"
    body.required = true
    body.maxLength = 2000
    bodyLabel.append(body)

    const trapLabel = core.createElement("label", "aha-comments__field aha-comments__field--trap")
    trapLabel.append(core.createElement("span", "", "Website"))
    const trap = document.createElement("input")
    trap.name = "website"
    trap.tabIndex = -1
    trap.autocomplete = "off"
    trapLabel.append(trap)

    state.challenge = core.createElement("div", "aha-comments__challenge")
    state.formMessage = core.createElement("p", "aha-comments__message")
    state.submit = core.createElement("button", "aha-comments__submit", "댓글 등록")
    state.submit.type = "submit"
    state.submit.disabled = true
    const actions = core.createElement("div", "aha-comments__actions")
    actions.append(state.submit, state.challenge)

    form.append(row, bodyLabel, trapLabel, actions, state.formMessage)
    form.addEventListener("submit", async (event) => {
      event.preventDefault()
      state.submit.disabled = true
      setMessage(state, "댓글을 보내는 중이에요.")
      const formData = new FormData(form)
      const payload = {
        pagePath: core.pagePath(),
        pageUrl: core.pageUrl(),
        pageTitle: core.pageTitle(),
        authorName: String(formData.get("authorName") || ""),
        body: String(formData.get("body") || ""),
        website: String(formData.get("website") || ""),
        turnstileToken: state.turnstileToken,
      }
      const result = await core.requestJson("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      if (result.response.status === 201 || result.response.status === 202) {
        form.reset()
        resetTurnstile(state)
        setMessage(
          state,
          result.body.status === "pending"
            ? "댓글이 접수됐어요. 승인되면 글 아래에 보여요."
            : "댓글이 등록됐어요.",
        )
        await loadComments(state)
        return
      }
      resetTurnstile(state)
      if (result.response.status === 429) {
        setMessage(state, "짧은 시간에 댓글을 너무 많이 남겼어요. 잠시 뒤 다시 시도해주세요.")
        return
      }
      setMessage(state, "댓글을 저장하지 못했어요. 입력 내용을 확인하고 다시 시도해주세요.")
    })
    renderTurnstile(root, state)
    return form
  }

  function initRoot(root) {
    const mount = root.querySelector("[data-comments-app]")
    if (!mount || roots.get(root) === core.pagePath()) {
      return
    }
    roots.set(root, core.pagePath())
    const state = {
      list: core.createElement("div", "aha-comments__list"),
      message: core.createElement("p", "aha-comments__message"),
      turnstileToken: "",
      turnstileWidget: "",
      challenge: null,
      submit: null,
    }
    mount.replaceChildren(state.list, state.message, buildForm(root, state))
    loadComments(state)
  }

  function initComments() {
    document.querySelectorAll("[data-comments-root]").forEach(initRoot)
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initComments, { once: true })
  } else {
    initComments()
  }

  if (window.document$ && typeof window.document$.subscribe === "function") {
    window.document$.subscribe(initComments)
  }
})()
