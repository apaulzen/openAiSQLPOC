-- CreateEnum
CREATE TYPE "gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "category" AS ENUM ('Apparel', 'Footwear');

-- CreateTable
CREATE TABLE "address" (
    "id" SERIAL NOT NULL,
    "customerid" INTEGER,
    "firstname" TEXT,
    "lastname" TEXT,
    "address1" TEXT,
    "address2" TEXT,
    "city" TEXT,
    "zip" TEXT,
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6),

    CONSTRAINT "address_pkey" PRIMARY KEY ("id")
);

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
    "currentaddressid" INTEGER,
    "created" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "updated" TIMESTAMPTZ(6),

    CONSTRAINT "customer_pkey1" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "labels" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "slugname" TEXT,
    "icon" BYTEA,

    CONSTRAINT "labels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order" (
    "id" SERIAL NOT NULL,
    "customer" INTEGER,
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

-- AddForeignKey
ALTER TABLE "articles" ADD CONSTRAINT "articles_colorid_fkey" FOREIGN KEY ("colorid") REFERENCES "colors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order" ADD CONSTRAINT "order_shippingaddressid_fkey" FOREIGN KEY ("shippingaddressid") REFERENCES "address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_positions" ADD CONSTRAINT "order_positions_articleid_fkey" FOREIGN KEY ("articleid") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "order_positions" ADD CONSTRAINT "order_positions_orderid_fkey" FOREIGN KEY ("orderid") REFERENCES "order"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_articleid_fkey" FOREIGN KEY ("articleid") REFERENCES "articles"("id") ON DELETE NO ACTION ON UPDATE NO ACTION;
