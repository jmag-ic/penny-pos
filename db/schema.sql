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
  cost INTEGER NOT NULL,
  stock INTEGER,
  created_at TEXT DEFAULT (DATETIME()),
  updated_at TEXT DEFAULT (DATETIME()),
  deleted_at TEXT
);

CREATE VIRTUAL TABLE item_fts USING fts5(
  name,
  tokenize='unicode61 remove_diacritics 1'
);

CREATE TRIGGER item_fts_insert AFTER INSERT ON item 
BEGIN
  INSERT INTO item_fts (rowid, name) 
  VALUES (new.id, new.name);
END;

CREATE TRIGGER item_fts_update AFTER UPDATE ON item 
BEGIN
  UPDATE item_fts 
  SET name = new.name 
  WHERE rowid = new.id;
END;

CREATE TRIGGER item_fts_delete AFTER DELETE ON item 
BEGIN
  DELETE FROM item_fts WHERE rowid = old.id;
END;

CREATE TABLE sale (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  sale_date TEXT DEFAULT (DATETIME()),
  total_amount INTEGER NOT NULL,
  payment_amount INTEGER NOT NULL,
  customer_name TEXT,
  payment_method TEXT
);

CREATE TABLE sale_item (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER REFERENCES sale(id) ON DELETE CASCADE,
  item_id INTEGER REFERENCES item(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price INTEGER NOT NULL,
  cost INTEGER NOT NULL
);