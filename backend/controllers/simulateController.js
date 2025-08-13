const Driver = require('../models/Driver');
const Route = require('../models/Route');
const Order = require('../models/Order');
const SimulationResult = require('../models/SimulationResult');

function parseHHMMToMinutes(hhmm) {
  const [hh, mm] = hhmm.split(':').map(Number);
  return hh * 60 + mm;
}

async function runSimulation(input) {
  const { availableDrivers, routeStartTime, maxHoursPerDriver } = input;

  if (!availableDrivers || availableDrivers < 1) throw { status: 400, message: 'Invalid driver count' };

  const [driversAll, routes, orders] = await Promise.all([
    Driver.find().lean(),
    Route.find().lean(),
    Order.find().lean()
  ]);

  if (routes.length === 0) throw { status: 400, message: 'No routes in DB' };
  if (orders.length === 0) throw { status: 400, message: 'No orders in DB' };

  let drivers = driversAll.slice(0, availableDrivers);
  while (drivers.length < availableDrivers) {
    drivers.push({ _id: `virtual-${drivers.length}`, name: `VirtualDriver${drivers.length}`, currentShiftHours: 0, past7DaysHours: [] });
  }

  const routeMap = new Map(routes.map(r => [r.routeId, r]));
  const ordersCopy = orders.map(o => ({ ...o }));

  const driverState = drivers.map(d => ({
    id: d._id,
    name: d.name,
    workedToday: d.currentShiftHours || 0,
    past7: d.past7DaysHours || [],
    nextStartMin: parseHHMMToMinutes(routeStartTime),
    assignedOrders: []
  }));

  const LATE_PENALTY = 50;
  const FATIGUE_THRESHOLD_HOURS = 8;
  const FATIGUE_SPEED_INCREASE = 1.3;
  const HIGH_VALUE_THRESHOLD = 1000;
  const HIGH_VALUE_BONUS_PERCENT = 0.10;
  const FUEL_BASE_PER_KM = 5;
  const FUEL_HIGH_TRAFFIC_SURCHARGE = 2;

  for (const ord of ordersCopy) {
    const route = routeMap.get(ord.routeId);
    if (!route) {
      ord.skipReason = 'No route found';
      continue;
    }

    let assigned = false;
    for (let di = 0; di < driverState.length; di++) {
      const d = driverState[di];
      let deliveryTime = route.baseTimeMinutes;
      const wasFatigued = (d.past7 || []).some(h => h > FATIGUE_THRESHOLD_HOURS);
      if (wasFatigued) deliveryTime *= FATIGUE_SPEED_INCREASE;
      const addHours = deliveryTime / 60;
      if ((d.workedToday + addHours) <= maxHoursPerDriver) {
        d.assignedOrders.push({
          orderId: ord.orderId,
          route,
          valueRs: ord.valueRs,
          scheduledStartMin: d.nextStartMin,
          deliveryTimeMin: deliveryTime
        });
        d.nextStartMin += Math.ceil(deliveryTime) + 5;
        d.workedToday += addHours;
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      let minIdx = 0;
      for (let i = 1; i < driverState.length; i++) if (driverState[i].workedToday < driverState[minIdx].workedToday) minIdx = i;
      const d = driverState[minIdx];
      const deliveryTime = route.baseTimeMinutes * ((d.past7 || []).some(h => h > FATIGUE_THRESHOLD_HOURS) ? FATIGUE_SPEED_INCREASE : 1);
      const addHours = deliveryTime / 60;
      d.assignedOrders.push({
        orderId: ord.orderId,
        route,
        valueRs: ord.valueRs,
        scheduledStartMin: d.nextStartMin,
        deliveryTimeMin: deliveryTime,
        overtimeAssigned: true
      });
      d.nextStartMin += Math.ceil(deliveryTime) + 5;
      d.workedToday += addHours;
    }
  }

  let totalProfit = 0;
  let onTimeCount = 0;
  let lateCount = 0;
  const perOrderResults = [];

  for (const d of driverState) {
    for (const a of d.assignedOrders) {
      const route = a.route;
      const basePlus10 = route.baseTimeMinutes + 10;
      const isLate = (a.deliveryTimeMin > basePlus10);
      if (isLate) lateCount++; else onTimeCount++;

      const penalty = isLate ? LATE_PENALTY : 0;
      const bonus = (!isLate && a.valueRs > HIGH_VALUE_THRESHOLD) ? a.valueRs * HIGH_VALUE_BONUS_PERCENT : 0;
      const perKm = FUEL_BASE_PER_KM + (route.trafficLevel === 'High' ? FUEL_HIGH_TRAFFIC_SURCHARGE : 0);
      const fuelCost = route.distanceKm * perKm;

      const orderProfit = a.valueRs + bonus - penalty - fuelCost;
      totalProfit += orderProfit;

      perOrderResults.push({
        orderId: a.orderId,
        driverId: d.id,
        driverName: d.name,
        routeId: route.routeId,
        valueRs: a.valueRs,
        bonus: Math.round(bonus * 100) / 100,
        penalty,
        fuelCost: Math.round(fuelCost * 100) / 100,
        orderProfit: Math.round(orderProfit * 100) / 100,
        isLate
      });
    }
  }

  const totalDeliveries = onTimeCount + lateCount;
  const efficiencyScore = totalDeliveries === 0 ? 0 : (onTimeCount / totalDeliveries) * 100;
  const fuelBreakdown = { totalFuelCost: perOrderResults.reduce((s, p) => s + p.fuelCost, 0) };

  const result = {
    totalProfit: Math.round(totalProfit * 100) / 100,
    efficiencyScore: Math.round(efficiencyScore * 100) / 100,
    onTimeCount,
    lateCount,
    totalDeliveries,
    fuelBreakdown,
    orders: perOrderResults
  };

  await SimulationResult.create({ input, result });

  return result;
}

module.exports = { runSimulation };
