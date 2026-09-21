CREATE TABLE IF NOT EXISTS app_meta (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO app_meta (key, value, updated_at)
VALUES ('schema_version', '1', CURRENT_TIMESTAMP)
ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP;

CREATE TABLE IF NOT EXISTS calculation_history (
  id TEXT PRIMARY KEY,
  device_id TEXT NOT NULL,
  expression TEXT NOT NULL,
  operation TEXT NOT NULL,
  result_text TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calculation_history_device_created
ON calculation_history(device_id, created_at DESC);
