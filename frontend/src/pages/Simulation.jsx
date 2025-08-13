import React, { useState } from 'react';
import API from '../api';

export default function Simulation(){
  const [availableDrivers, setAvailableDrivers] = useState(1);
  const [routeStartTime, setRouteStartTime] = useState('09:00');
  const [maxHoursPerDriver, setMaxHoursPerDriver] = useState(8);
  const [result, setResult] = useState(null);

  const run = async () => {
    try {
      const res = await API.post('/simulate/run', { availableDrivers, routeStartTime, maxHoursPerDriver });
      setResult(res.data);
    } catch (err) { alert(err?.response?.data?.message || 'Simulation failed'); }
  };

  return (
    <div>
      <h2>Run Simulation</h2>
      <label>Available drivers: <input type="number" value={availableDrivers} onChange={e=>setAvailableDrivers(Number(e.target.value))}/></label>
      <label>Start time: <input type="time" value={routeStartTime} onChange={e=>setRouteStartTime(e.target.value)}/></label>
      <label>Max hours/day: <input type="number" value={maxHoursPerDriver} onChange={e=>setMaxHoursPerDriver(Number(e.target.value))}/></label>
      <button onClick={run}>Run</button>

      {result && (
        <div>
          <h3>Result</h3>
          <p>Total Profit: ₹{result.totalProfit}</p>
          <p>Efficiency: {result.efficiencyScore}%</p>
        </div>
      )}
    </div>
  );
}
