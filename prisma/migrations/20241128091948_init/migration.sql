-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female', 'unisex');

-- CreateEnum
CREATE TYPE "category" AS ENUM ('Apparel', 'Footwear');

-- CreateTable
CREATE TABLE "articles" (
    "id" SERIAL NOT NULL,
    "productid" INTEGER,
    "ean" TEXT,
    "colorid" INTEGER,
    "size" INTEGER,
    "description" TEXT,
    "originalprice" MONEY,
    "reducedprice" MONEY,
    "taxrate" DECIMAL,
    "discountinpercent" INTEGER,
    "currentlyactive" BOOLEAN,
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6),

    CONSTRAINT "articles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "colors" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "rgb" TEXT,

    CONSTRAINT "colors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer" (
    "id" SERIAL NOT NULL,
    "firstname" TEXT,
    "lastname" TEXT,
    "gender" "gender",
    "email" TEXT,
    "dateofbirth" DATE,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6),

    CONSTRAINT "customer_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER,
    "ordertimestamp" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "shippingaddressid" INTEGER,
    "total" MONEY,
    "shippingcost" MONEY,
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6),

    CONSTRAINT "order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_positions" (
    "id" SERIAL NOT NULL,
    "orderid" INTEGER,
    "articleid" INTEGER,
    "amount" SMALLINT,
    "price" MONEY,
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6),

    CONSTRAINT "order_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sizes" (
    "id" SERIAL NOT NULL,
    "gender" "gender",
    "category" "category",
    "size" TEXT,
    "size_us" INTEGER,
    "size_uk" INTEGER,
    "size_eu" INTEGER,

    CONSTRAINT "sizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock" (
    "id" SERIAL NOT NULL,
    "articleid" INTEGER,
    "count" INTEGER,
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6),

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

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

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_colorid_fkey" FOREIGN KEY ("colorid") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customer"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_positions" ADD CONSTRAINT "order_positions_articleid_fkey" FOREIGN KEY ("articleid") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_positions" ADD CONSTRAINT "order_positions_orderid_fkey" FOREIGN KEY ("orderid") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_articleid_fkey" FOREIGN KEY ("articleid") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
