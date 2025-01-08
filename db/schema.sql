CREATE TABLE category (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (DATETIME())
);

CREATE TABLE item (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES category(id),
  description TEXT,
  price INTEGER NOT NULL,
  stock INTEGER,
  created_at TEXT DEFAULT (DATETIME()),
  updated_at TEXT DEFAULT (DATETIME()),
  deleted_at TEXT
);
