export const REPLY_FORM_TEMPLATE = `<!doctype html>
<html lang="ko">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>대댓글</title>
    <style>
      body { margin: 0; font-family: system-ui, sans-serif; color: #1f1f1f; background: #fafafa; }
      main { max-width: 38rem; margin: 3rem auto; padding: 0 1rem; }
      h1 { margin: 0 0 0.75rem; font-size: 1.4rem; }
      p { color: #666; }
      form { display: grid; gap: 0.75rem; margin-top: 1.25rem; }
      input, textarea { width: 100%; box-sizing: border-box; padding: 0.7rem; border: 1px solid #ddd; border-radius: 0.25rem; font: inherit; background: #fff; }
      textarea { min-height: 11rem; resize: vertical; }
      button { justify-self: start; padding: 0.6rem 0.9rem; border: 0; border-radius: 0.25rem; background: #526cfe; color: #fff; font-weight: 700; cursor: pointer; }
      .target { font-size: 0.85rem; }
    </style>
  </head>
  <body>
    <main>
      <h1>대댓글</h1>
      <p>{{PAGE_TITLE}}</p>
      <form method="post">
        <input name="authorName" value="Zensical" aria-label="작성자">
        <textarea name="body" maxlength="2000" required autofocus aria-label="대댓글"></textarea>
        <button type="submit">대댓글 등록</button>
      </form>
      <p class="target">대상 댓글: {{COMMENT_ID}}</p>
    </main>
  </body>
</html>`
