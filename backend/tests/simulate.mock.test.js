jest.mock('../models/Driver');
jest.mock('../models/Route');
jest.mock('../models/Order');
jest.mock('../models/SimulationResult');

const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');

const { runSimulation } = require('../controllers/simulateController');

beforeEach(() => {
  jest.resetAllMocks();
});

test('runSimulation basic success and persistence', async () => {
  Driver.find.mockResolvedValue([{ _id: 'd1', name: 'D1', currentShiftHours:0, past7DaysHours:[2,3] }]);
  Route.find.mockResolvedValue([{ routeId:'R1', distanceKm:10, trafficLevel:'Low', baseTimeMinutes:30 }]);
  Order.find.mockResolvedValue([{ orderId:'O1', valueRs:1500, routeId:'R1' }]);
  SimulationResult.create.mockResolvedValue({});

  const res = await runSimulation({ availableDrivers:1, routeStartTime:'09:00', maxHoursPerDriver:8 });
  expect(res).toHaveProperty('totalProfit');
  expect(res.orders.length).toBeGreaterThan(0);
  expect(SimulationResult.create).toHaveBeenCalled();
});

test('invalid driver count throws', async () => {
  await expect(runSimulation({ availableDrivers:0, routeStartTime:'09:00', maxHoursPerDriver:8 })).rejects.toMatchObject({ status:400 });
});

test('fatigue increases delivery time', async () => {
  Driver.find.mockResolvedValue([{ _id: 'd1', name:'D1', currentShiftHours:0, past7DaysHours:[9,0] }]); // fatigued
  Route.find.mockResolvedValue([{ routeId:'R1', distanceKm:5, trafficLevel:'Low', baseTimeMinutes:60 }]);
  Order.find.mockResolvedValue([{ orderId:'O1', valueRs:100, routeId:'R1' }]);
  SimulationResult.create.mockResolvedValue({});

  const res = await runSimulation({ availableDrivers:1, routeStartTime:'09:00', maxHoursPerDriver:12 });
  // Because baseTime=60 and fatigue multiplier=1.3 => deliveryTime=78 > base+10(70) so it's late
  const o = res.orders[0];
  expect(o.isLate).toBe(true);
});

test('high traffic fuel surcharge', async () => {
  Driver.find.mockResolvedValue([{ _id: 'd1', name:'D1', currentShiftHours:0, past7DaysHours:[] }]);
  Route.find.mockResolvedValue([{ routeId:'R1', distanceKm:10, trafficLevel:'High', baseTimeMinutes:10 }]);
  Order.find.mockResolvedValue([{ orderId:'O1', valueRs:200, routeId:'R1' }]);
  SimulationResult.create.mockResolvedValue({});

  const res = await runSimulation({ availableDrivers:1, routeStartTime:'09:00', maxHoursPerDriver:5 });
  const o = res.orders[0];
  // fuel cost should include surcharge: perKm=5+2=7 => fuelCost=70
  expect(o.fuelCost).toBe(70);
});

test('high-value bonus applied when on time', async () => {
  Driver.find.mockResolvedValue([{ _id: 'd1', name:'D1', currentShiftHours:0, past7DaysHours:[] }]);
  Route.find.mockResolvedValue([{ routeId:'R1', distanceKm:1, trafficLevel:'Low', baseTimeMinutes:1 }]);
  Order.find.mockResolvedValue([{ orderId:'O1', valueRs:2000, routeId:'R1' }]);
  SimulationResult.create.mockResolvedValue({});

  const res = await runSimulation({ availableDrivers:1, routeStartTime:'09:00', maxHoursPerDriver:8 });
  const o = res.orders[0];
  // on a 1 minute base time, it will be on time so bonus should be 10% = 200
  expect(o.bonus).toBe(200);
});
