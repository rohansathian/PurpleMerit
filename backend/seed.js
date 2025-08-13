require('dotenv').config();
const mongoose = require('mongoose');
const Driver = require('./models/Driver');
const Route = require('./models/Route');
const Order = require('./models/Order');
const fs = require('fs');
const path = require('path');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('connected');

  const dataDir = path.join(__dirname, 'data');
  const drivers = JSON.parse(fs.readFileSync(path.join(dataDir, 'drivers.json')));
  const routes = JSON.parse(fs.readFileSync(path.join(dataDir, 'routes.json')));
  const orders = JSON.parse(fs.readFileSync(path.join(dataDir, 'orders.json')));

  await Driver.deleteMany({});
  await Route.deleteMany({});
  await Order.deleteMany({});

  await Driver.insertMany(drivers);
  await Route.insertMany(routes);
  await Order.insertMany(orders);

  console.log('seeded');
  process.exit(0);
}

run().catch(err => { console.error(err); process.exit(1); });
