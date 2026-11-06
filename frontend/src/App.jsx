import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Home from './pages/Home'; // Импортируем нашу новую страницу

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Главная страница с реальным каталогом, поиском и CRUD */}
        <Route path="/" element={<Home />} />
        
        <Route path="/login" element={<Login />} />
        
        <Route path="*" element={<div style={{ padding: '20px' }}><h2>404: Страница не найдена</h2></div>} />
      </Routes>
    </BrowserRouter>
  );
}
