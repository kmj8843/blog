ALTER TABLE comments ADD COLUMN parent_id TEXT REFERENCES comments(id);

CREATE INDEX IF NOT EXISTS idx_comments_parent
  ON comments (parent_id, status, created_at);
