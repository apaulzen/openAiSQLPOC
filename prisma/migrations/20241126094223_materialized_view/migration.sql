CREATE MATERIALIZED VIEW sales_summary AS
SELECT
  o.id AS order_id,
  o.customer AS customer_id,
  o.ordertimestamp AS order_date,
  o.total AS total_order_value,
  SUM(op.amount) AS total_items_sold,
  SUM(op.amount * op.price) AS total_sales_value
FROM
  "order" o
JOIN
  order_positions op ON o.id = op.orderid
GROUP BY
  o.id, o.customer, o.ordertimestamp, o.total;
  
-- Refresh this view periodically
REFRESH MATERIALIZED VIEW sales_summary;

CREATE MATERIALIZED VIEW product_sales_summary AS
SELECT
  a.id AS article_id,
  a.description AS article_description,
  SUM(op.amount) AS total_quantity_sold,
  SUM(op.amount * op.price) AS total_sales_value
FROM
  order_positions op
JOIN
  articles a ON op.articleid = a.id
GROUP BY
  a.id, a.description;

-- Refresh this view periodically
REFRESH MATERIALIZED VIEW product_sales_summary;

CREATE MATERIALIZED VIEW stock_summary AS
SELECT
  a.id AS article_id,
  a.description AS article_description,
  s.count AS stock_count,
  COALESCE(SUM(op.amount), 0) AS total_sold
FROM
  stock s
JOIN
  articles a ON s.articleid = a.id
LEFT JOIN
  order_positions op ON a.id = op.articleid
GROUP BY
  a.id, a.description, s.count;

-- Refresh this view periodically
REFRESH MATERIALIZED VIEW stock_summary;

CREATE MATERIALIZED VIEW customer_order_summary AS
SELECT
  c.id AS customer_id,
  c.firstname || ' ' || c.lastname AS customer_name,
  COUNT(o.id) AS total_orders,
  SUM(o.total) AS total_spent
FROM
  customer c
JOIN
  "order" o ON c.id = o.customer
GROUP BY
  c.id, c.firstname, c.lastname;

-- Refresh this view periodically
REFRESH MATERIALIZED VIEW customer_order_summary;

CREATE MATERIALIZED VIEW order_details_with_products AS
SELECT
  o.id AS order_id,
  o.ordertimestamp AS order_date,
  c.firstname || ' ' || c.lastname AS customer_name,
  a.description AS article_description,
  op.amount AS quantity,
  op.price AS unit_price,
  (op.amount * op.price) AS total_price
FROM
  "order" o
JOIN
  order_positions op ON o.id = op.orderid
JOIN
  customer c ON o.customer = c.id
JOIN
  articles a ON op.articleid = a.id;

-- Refresh this view periodically
REFRESH MATERIALIZED VIEW order_details_with_products;

CREATE MATERIALIZED VIEW product_inventory AS
SELECT
  a.id AS article_id,
  a.description AS article_description,
  a.size AS article_size,
  c.name AS color_name,
  SUM(s.count) AS total_stock
FROM
  articles a
JOIN
  stock s ON a.id = s.articleid
JOIN
  colors c ON a.colorid = c.id
GROUP BY
  a.id, a.description, a.size, c.name;

-- Refresh this view periodically
REFRESH MATERIALIZED VIEW product_inventory;

CREATE MATERIALIZED VIEW customer_gender_and_preference AS
SELECT
  c.gender AS customer_gender,
  s.category AS product_category,
  COUNT(op.id) AS product_preference_count
FROM
  order_positions op
JOIN
  articles a ON op.articleid = a.id
JOIN
  sizes s ON a.size = s.id
JOIN
  "order" o ON op.orderid = o.id
JOIN
  customer c ON o.customer = c.id
GROUP BY
  c.gender, s.category;

REFRESH MATERIALIZED VIEW customer_gender_and_preference;

CREATE MATERIALIZED VIEW product_sales_by_category AS
SELECT
  s.category AS product_category,
  SUM(op.amount) AS total_quantity_sold,
  SUM(op.amount * op.price) AS total_sales_value
FROM
  order_positions op
JOIN
  articles a ON op.articleid = a.id
JOIN
  sizes s ON a.size = s.id -- Ensure proper foreign key relationship
GROUP BY
  s.category;


-- Refresh this view periodically
REFRESH MATERIALIZED VIEW product_sales_by_category;
