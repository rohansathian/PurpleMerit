import React, { useEffect, useState } from 'react';
import API from '../api';

export default function Drivers(){
  const [drivers, setDrivers] = useState([]);
  const [name, setName] = useState('');

  useEffect(()=>{ load(); }, []);
  async function load(){ const res = await API.get('/drivers'); setDrivers(res.data); }

  async function add(){ await API.post('/drivers', { name }); setName(''); load(); }

  async function remove(id){ await API.delete(`/drivers/${id}`); load(); }

  return (
    <div>
      <h2>Drivers</h2>
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Name"/>
      <button onClick={add}>Add</button>
      <ul>{drivers.map(d=> <li key={d._id}>{d.name} <button onClick={()=>remove(d._id)}>Del</button></li>)}</ul>
    </div>
  );
}
