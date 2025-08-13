import React, { useState } from 'react';
import API, { setAuth } from '../api';
export default function Login(){
  const [email,setEmail]=useState(''); const [pw,setPw]=useState('');
  const submit = async e => {
    e.preventDefault();
    try {
      const res = await API.post('/auth/login', { email, password: pw });
      localStorage.setItem('token', res.data.token);
      setAuth(res.data.token);
      window.location = '/';
    } catch (err) { alert(err?.response?.data?.message || 'Login failed'); }
  };
  return (
    <form onSubmit={submit}>
      <h2>Manager Login</h2>
      <input placeholder="email" value={email} onChange={e=>setEmail(e.target.value)} />
      <input placeholder="password" type="password" value={pw} onChange={e=>setPw(e.target.value)} />
      <button type="submit">Login</button>
    </form>
  );
}
