import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';

// Схема валидации Zod
const registerSchema = zod.object({
  email: zod.string().min(1, 'Введите email').email('Неверный формат email'),
  password: zod.string().min(6, 'Пароль минимум 6 символов'),
  role: zod.enum(['client', 'admin']),
});

export default function Register() {
  const registerUser = useAuthStore((state) => state.registerUser);
  const isLoading = useAuthStore((state) => state.isLoading);
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'client' }
  });

  const onSubmit = async (data) => {
    const result = await registerUser(data.email, data.password, data.role);
    if (result.success) {
      alert('Регистрация успешна! Теперь войдите в аккаунт.');
      navigate('/login');
    } else {
      alert(result.message);
    }
  };

  return (
    <div style={{ backgroundColor: '#121214', color: '#e1e1e6', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif' }}>
      <div style={{ width: '100%', maxWidth: '400px', padding: '30px', backgroundColor: '#1f1f23', borderRadius: '12px', border: '1px solid #29292e' }}>
        <h2 style={{ marginBottom: '20px', textAlign: 'center', color: '#fff' }}>Регистрация</h2>
        
        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8a8b3' }}>Email</label>
            <input type="text" {...register('email')} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#121214', color: '#fff', border: '1px solid #38383d' }} />
            {errors.email && <span style={{ color: '#f55f5f', fontSize: '12px' }}>{errors.email.message}</span>}
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8a8b3' }}>Пароль</label>
            <input type="password" {...register('password')} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#121214', color: '#fff', border: '1px solid #38383d' }} />
            {errors.password && <span style={{ color: '#f55f5f', fontSize: '12px' }}>{errors.password.message}</span>}
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '5px', color: '#a8a8b3' }}>Роль в системе</label>
            <select {...register('role')} style={{ width: '100%', padding: '10px', borderRadius: '6px', backgroundColor: '#121214', color: '#fff', border: '1px solid #38383d' }}>
              <option value="client">Клиент (Заказ еды)</option>
              <option value="admin">Администратор ресторана</option>
            </select>
          </div>

          <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '12px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
            {isLoading ? 'Создание...' : 'Зарегистрироваться'}
          </button>
        </form>

        <p style={{ marginTop: '15px', textAlign: 'center', fontSize: '14px', color: '#a8a8b3' }}>
          Уже есть аккаунт? <Link to="/login" style={{ color: '#4da5ff' }}>Войти</Link>
        </p>
      </div>
    </div>
  );
}
