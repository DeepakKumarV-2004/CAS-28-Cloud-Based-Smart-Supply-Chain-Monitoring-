const { faker } = require("@faker-js/faker");

let warehouses = [
  { id: 1, name: "Warehouse A", location: "New York", stocks: [] },
  { id: 2, name: "Warehouse B", location: "Los Angeles", stocks: [] },
  { id: 3,name: "Warehouse c",Location:"India",stocks:[]}
];

function generateFakeData() {
  warehouses.forEach((warehouse) => {
    warehouse.stocks = Array.from({ length: 10 }, (_, i) => ({
      item: `Item ${i + 1}`,
      stock: faker.number.int({ min: 20, max: 100 }),
      humidity: faker.number.int({ min: 30, max: 80 }),
      temperature: faker.number.int({ min: 15, max: 35 }),
      energy: faker.number.int({ min: 50, max: 200 }),
    }));
  });
}

module.exports = { generateFakeData, warehouses };