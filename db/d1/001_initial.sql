CREATE TABLE IF NOT EXISTS key_configs (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  base_url TEXT NOT NULL,
  api_key TEXT NOT NULL,
  model TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  source_meta_json TEXT,
  probe_json TEXT,
  last_test_json TEXT,
  benchmarks_json TEXT
);
