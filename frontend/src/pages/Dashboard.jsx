import React, { useEffect, useState } from 'react';
import API from '../api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

export default function Dashboard(){
  const [kpi, setKpi] = useState(null);

  useEffect(()=>{ async function load(){ try {
    const res = await API.get('/simulations'); // gets latest history
    if(res.data && res.data.length) setKpi(res.data[0].result);
  } catch(e){ console.error(e); }} load(); }, []);

  if(!kpi) return <div>No simulation run yet</div>;

  const pieData = [
    {name:'On-time', value: kpi.onTimeCount},
    {name:'Late', value: kpi.lateCount}
  ];

  return (
    <div>
      <h2>Dashboard</h2>
      <p>Total Profit: ₹{kpi.totalProfit}</p>
      <p>Efficiency: {kpi.efficiencyScore}%</p>

      <div style={{ display:'flex', gap:40 }}>
        <PieChart width={300} height={300}>
          <Pie data={pieData} dataKey="value" outerRadius={80} fill="#8884d8">
            <Cell/>
            <Cell/>
          </Pie>
        </PieChart>

        <BarChart width={500} height={300} data={kpi.orders}>
          <XAxis dataKey="orderId"/><YAxis/><Tooltip/><Legend/>
          <Bar dataKey="orderProfit" />
        </BarChart>
      </div>
    </div>
  );
}
