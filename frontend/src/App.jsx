
import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <div className="layout">


        <div className="sidebar">
          <img src="https://i.pinimg.com/736x/41/51/5b/41515b366f65176d5d32f83063ba79b2.jpg" alt="Реклама 1" />
          <img src="https://i.pinimg.com/736x/93/35/5c/93355c70c7430e366c2494c545629dd1.jpg" alt="Реклама 2" />
        </div>

 
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<h2>404: Страница не найдена</h2>} />
          </Routes>
        </main>

  
        <div className="sidebar">
          <img src="https://i.pinimg.com/736x/0c/9b/15/0c9b15f257b4f681069094b306978aea.jpg" alt="Реклама 3" />
          <img src="https://i.pinimg.com/736x/b1/c5/c5/b1c5c5a2a3ce827d725b6f489d3e01cb.jpg" alt="Реклама 4" />
        </div>

      </div>
    </BrowserRouter>
  );
}
