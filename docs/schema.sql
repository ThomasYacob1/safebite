CREATE TABLE IF NOT EXISTS recent_searches (
  id          BIGSERIAL PRIMARY KEY,
  term        TEXT        NOT NULL,
  searched_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_recent_searches_time ON recent_searches (searched_at DESC);