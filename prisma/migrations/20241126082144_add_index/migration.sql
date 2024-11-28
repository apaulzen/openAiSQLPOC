-- CreateIndex
CREATE INDEX "address_customerid_idx" ON "address"("customerid");

-- CreateIndex
CREATE INDEX "address_created_idx" ON "address"("created");

-- CreateIndex
CREATE INDEX "articles_productid_idx" ON "articles"("productid");

-- CreateIndex
CREATE INDEX "articles_colorid_idx" ON "articles"("colorid");

-- CreateIndex
CREATE INDEX "articles_size_idx" ON "articles"("size");

-- CreateIndex
CREATE INDEX "articles_created_idx" ON "articles"("created");

-- CreateIndex
CREATE INDEX "colors_name_idx" ON "colors"("name");

-- CreateIndex
CREATE INDEX "customer_email_idx" ON "customer"("email");

-- CreateIndex
CREATE INDEX "customer_dateofbirth_idx" ON "customer"("dateofbirth");

-- CreateIndex
CREATE INDEX "customer_created_idx" ON "customer"("created");

-- CreateIndex
CREATE INDEX "customer_updated_idx" ON "customer"("updated");

-- CreateIndex
CREATE INDEX "customer_gender_idx" ON "customer"("gender");

-- CreateIndex
CREATE INDEX "order_customer_idx" ON "order"("customer");

-- CreateIndex
CREATE INDEX "order_ordertimestamp_idx" ON "order"("ordertimestamp");

-- CreateIndex
CREATE INDEX "order_total_idx" ON "order"("total");

-- CreateIndex
CREATE INDEX "order_positions_orderid_idx" ON "order_positions"("orderid");

-- CreateIndex
CREATE INDEX "order_positions_articleid_idx" ON "order_positions"("articleid");

-- CreateIndex
CREATE INDEX "order_positions_created_idx" ON "order_positions"("created");

-- CreateIndex
CREATE INDEX "sizes_size_idx" ON "sizes"("size");

-- CreateIndex
CREATE INDEX "sizes_gender_idx" ON "sizes"("gender");

-- CreateIndex
CREATE INDEX "sizes_category_idx" ON "sizes"("category");

-- CreateIndex
CREATE INDEX "stock_articleid_idx" ON "stock"("articleid");

-- CreateIndex
CREATE INDEX "stock_count_idx" ON "stock"("count");
