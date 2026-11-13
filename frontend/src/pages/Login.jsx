import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

const loginSchema = zod.object({
  email: zod.string().min(1, 'Email обязателен').email('Некорректный формат email'),
  password: zod.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      navigate('/'); 
    } else {
      alert(result.message);
    }
  };

  return (
    <div style={{ backgroundColor: '#121214', color: '#e1e1e6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: '#1f1f23', borderRadius: '12px', border: '1px solid #29292e' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#fff' }}>Вход в систему</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8a8b3' }}>Email</label>
            <input type="text" {...register('email')} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#121214', color: '#fff', border: '1px solid #38383d' }} />
            {errors.email && <span style={{ color: '#f55f5f', fontSize: '12px' }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8a8b3' }}>Пароль</label>
            <input type="password" {...register('password')} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#121214', color: '#fff', border: '1px solid #38383d' }} />
            {errors.password && <span style={{ color: '#f55f5f', fontSize: '12px' }}>{errors.password.message}</span>}
          </div>

          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isLoading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: '#a8a8b3' }}>
          Нет аккаунта? <Link to="/register" style={{ color: '#4da5ff' }}>Зарегистрироваться</Link>
        </p>
        <p style={{ marginTop: '10px', textAlign: 'center', fontSize: '13px' }}>
          <Link to="/" style={{ color: '#6c757d' }}>← Вернуться в меню без входа</Link>
        </p>
      </div>
    </div>
  );
}
