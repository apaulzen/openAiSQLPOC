const { PrismaClient } = require("@prisma/client");
const { faker } = require("@faker-js/faker");

const prisma = new PrismaClient();

async function seedDatabase() {
  console.log("Seeding database...");

  try {
    // Seed `customer`
    for (let i = 0; i < 1000; i++) {
      await prisma.customer.create({
        data: {
          firstname: faker.person.firstName(),
          lastname: faker.person.lastName(),
          gender: faker.helpers.arrayElement(["male", "female", "unisex"]),
          email: faker.internet.email(),
          address1: faker.location.streetAddress(),
          address2: faker.location.secondaryAddress(),
          city: faker.location.city(),
          zip: faker.location.zipCode(),
          dateofbirth: faker.date.past({ years: 30, refDate: new Date("2000-01-01") }),
        },
      });
    }
    console.log("Seeded `customer` table.");

    const colorIds = [];
    // Seed `colors`
    for (let i = 0; i < 1000; i++) {
      const color = await prisma.colors.create({
        data: {
          name: faker.color.human(),
          rgb: faker.color.rgb(),
        },
      });
      colorIds.push(color.id);
    }
    console.log("Seeded `colors` table.");

    // Seed `articles`
    for (let i = 0; i < 1000; i++) {
      await prisma.articles.create({
        data: {
          productid: faker.number.int({ min: 1, max: 100 }),
          ean: faker.string.alphanumeric({ length: 13 }), // Adjusted
          colorid: faker.helpers.arrayElement(colorIds),
          size: faker.number.int({ min: 1, max: 50 }),
          description: faker.commerce.productDescription(),
          originalprice: parseFloat(faker.commerce.price()),
          reducedprice: parseFloat(faker.commerce.price()),
          taxrate: faker.number.float({ min: 0, max: 0.2 }),
          discountinpercent: faker.number.int({ min: 0, max: 50 }),
          currentlyactive: faker.datatype.boolean(),
        },
      });
    }
    console.log("Seeded `articles` table.");

    // Seed `order`
    for (let i = 0; i < 1000; i++) {
      await prisma.order.create({
        data: {
          customerId: faker.number.int({ min: 1, max: 1000 }),
          total: parseFloat(faker.commerce.price()),
          shippingcost: parseFloat(faker.commerce.price()),
        },
      });
    }
    console.log("Seeded `order` table.");

    // Seed `order_positions`
    for (let i = 0; i < 1000; i++) {
      await prisma.order_positions.create({
        data: {
          orderid: faker.number.int({ min: 1, max: 1000 }),
          articleid: faker.number.int({ min: 1, max: 1000 }),
          amount: faker.number.int({ min: 1, max: 100 }),
          price: parseFloat(faker.commerce.price()),
        },
      });
    }
    console.log("Seeded `order_positions` table.");

    // Seed `sizes`
    for (let i = 0; i < 1000; i++) {
      await prisma.sizes.create({
        data: {
          gender: faker.helpers.arrayElement(["male", "female", "unisex"]),
          category: faker.helpers.arrayElement(["Apparel", "Footwear"]),
          size: faker.number.int({ min: 1, max: 50 }).toString(),
          size_us: faker.number.int({ min: 1, max: 15 }),
          size_uk: faker.number.int({ min: 1, max: 15 }),
          size_eu: faker.number.int({ min: 30, max: 50 }),
        },
      });
    }
    console.log("Seeded `sizes` table.");

    // Seed `stock`
    for (let i = 0; i < 1000; i++) {
      await prisma.stock.create({
        data: {
          articleid: faker.number.int({ min: 1, max: 1000 }),
          count: faker.number.int({ min: 1, max: 500 }),
        },
      });
    }
    console.log("Seeded `stock` table.");

    console.log("Seeding complete!");
  } catch (error) {
    console.error("Error while seeding database:", error);
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
