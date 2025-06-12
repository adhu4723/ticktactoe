import React, { useState } from 'react';
import axios from 'axios';

export default function Auth({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? 'login' : 'signup';
    try {
      const res = await axios.post(`http://localhost:4000/api/auth/${endpoint}`, form);
      localStorage.setItem('token', res.data.token);
      onAuth(res.data.username);
    } catch (err) {
      alert(err.response?.data?.message || 'Error');
    }
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 100 }}>
      <h2>{isLogin ? 'Login' : 'Signup'}</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" required onChange={e => setForm({ ...form, username: e.target.value })} /><br />
        <input type="password" placeholder="Password" required onChange={e => setForm({ ...form, password: e.target.value })} /><br />
        <button type="submit">{isLogin ? 'Login' : 'Signup'}</button>
      </form>
      <p onClick={() => setIsLogin(!isLogin)} style={{ cursor: 'pointer', marginTop: 10 }}>
        {isLogin ? 'New user? Signup' : 'Have an account? Login'}
      </p>
    </div>
  );
}