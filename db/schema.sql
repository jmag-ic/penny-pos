CREATE TABLE category (
  id TEXT NOT NULL PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT DEFAULT (DATETIME())
);

CREATE TABLE product (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category_id INTEGER REFERENCES category(id),
  description TEXT,
  price DOUBLE NOT NULL,
  cost DOUBLE NOT NULL,
  stock INTEGER,
  stock_min INTEGER,
  created_at TEXT DEFAULT (DATETIME()),
  updated_at TEXT DEFAULT (DATETIME()),
  deleted_at TEXT
);

CREATE VIRTUAL TABLE product_fts USING fts5(
  name,
  tokenize='unicode61 remove_diacritics 1'
);

CREATE TRIGGER product_fts_insert AFTER INSERT ON product 
BEGIN
  INSERT INTO product_fts (rowid, name) 
  VALUES (new.id, new.name);
END;

CREATE TRIGGER product_fts_update AFTER UPDATE ON product 
BEGIN
  UPDATE product_fts 
  SET name = new.name 
  WHERE rowid = new.id;
END;

CREATE TRIGGER product_fts_delete AFTER DELETE ON product 
BEGIN
  DELETE FROM product_fts WHERE rowid = old.id;
END;

CREATE TABLE sale (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  total_amount DOUBLE NOT NULL,
  payment_amount DOUBLE NOT NULL,
  customer_name TEXT,
  payment_method TEXT,
  sale_date TEXT DEFAULT (DATETIME())
);

CREATE TABLE sale_item (
  id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
  sale_id INTEGER REFERENCES sale(id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES product(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL,
  price DOUBLE NOT NULL,
  cost DOUBLE NOT NULL
);