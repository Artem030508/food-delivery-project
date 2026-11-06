import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { useAuthStore } from '../store/useAuthStore';

// 1. Описываем схему валидации с понятными ошибками (Требование ТЗ)
const loginSchema = zod.object({
  email: zod.string().min(1, 'Email обязателен').email('Некорректный формат email'),
  password: zod.string().min(6, 'Пароль должен быть не менее 6 символов'),
});

export default function Login() {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);

  // 2. Интегрируем схему Zod в React Hook Form
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);
    if (result.success) {
      alert('Успешный вход!');
      window.location.href = '/'; // Временный редирект для скорости
    } else {
      alert(result.message);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '20px', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Вход в систему</h2>
      <form onSubmit={handleSubmit(onSubmit)}>
        
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email</label>
          <input 
            type="text" 
            {...register('email')} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.email && <span style={{ color: 'red', fontSize: '12px' }}>{errors.email.message}</span>}
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Пароль</label>
          <input 
            type="password" 
            {...register('password')} 
            style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
          />
          {errors.password && <span style={{ color: 'red', fontSize: '12px' }}>{errors.password.message}</span>}
        </div>

        <button type="submit" disabled={isLoading} style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          {isLoading ? 'Загрузка...' : 'Войти'}
        </button>
      </form>
    </div>
  );
}
