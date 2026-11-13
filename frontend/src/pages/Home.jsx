import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/api';
import { useAuthStore } from '../store/useAuthStore';
import { useCartStore } from '../store/useCartStore';


const restaurantImages = {
  '1': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRYrxS557RHV6bhPxlaZ7xUoWXSulIQGN437xeg0LSFWQ&s=10',
  '2': 'https://cosmoport-s.ru/upload/iblock/d22/uqmz6p2a0vli0vcbyerq8bcbp9s8zmwy.jpg',
  '3': 'https://lefood.menu/wp-content/uploads/w_images/2023/07/recept-76707-1240x827.jpg ',
};

export default function Home() {
  const { user, logout } = useAuthStore();

  const {
    items: cartItems,
    addToCart,
    removeFromCart,
    clearCart
  } = useCartStore();

  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  const [showStats, setShowStats] = useState(false);
  const [statsData, setStatsData] = useState(null);
  const [showCart, setShowCart] = useState(false);

  const isAdmin = user?.role === 'admin';


  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants');

        const formatted = response.data.map((r) =>
          r.id === '1'
            ? { ...r, name: 'Пиццерия Палермо' }
            : r
        );

        setRestaurants(formatted);
      } catch (error) {
        console.error('Ошибка загрузки ресторанов', error);
      }
    };

    fetchRestaurants();
  }, []);


  const fetchMenu = async () => {
    if (!selectedRestaurant) return;

    setIsLoading(true);

    try {
      const response = await api.get(
        `/restaurants/${selectedRestaurant.id}/menu?search=${encodeURIComponent(search)}&page=${page}&limit=3`
      );

      setMenuItems(response.data.items || []);
      setTotalPages(response.data.pagination?.pages || 1);
    } catch (error) {
      console.error('Ошибка загрузки меню', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchMenu();
    }, 400);

    return () => clearTimeout(timer);
  }, [selectedRestaurant, search, page]);

  
  const fetchStats = async () => {
    try {
      const response = await api.get('/stats/dashboard');

      setStatsData(response.data);
      setShowStats(true);
      setShowCart(false);
    } catch (error) {
      alert('Ошибка доступа к статистике. Войдите как администратор.');
    }
  };

  const handleDeleteItem = async (itemId) => {
    if (window.confirm('Вы уверены, что хотите удалить это блюдо?')) {
      try {
        await api.delete(`/restaurants/menu/${itemId}`);

        alert('Блюдо удалено из базы данных!');
        fetchMenu();
      } catch (error) {
        alert(
          'Ошибка: ' +
          (error.response?.data?.message || 'Нет прав доступа')
        );
      }
    }
  };


  const handleCheckout = async () => {
    if (!user) {
      alert('Для оформления заказа необходимо войти в аккаунт!');
      navigate('/login');
      return;
    }

    const totalPrice = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    try {
      await api.post('/orders', {
        restaurantId: selectedRestaurant?.id || '1',
        items: cartItems,
        totalPrice
      });

      alert('Заказ успешно оформлен и передан в ресторан!');

      clearCart();
      setShowCart(false);
    } catch (error) {
      alert('Ошибка при оформлении заказа');
    }
  };


  const handleLogout = async () => {
    await logout();

    clearCart();
    setShowStats(false);

    alert('Вы вышли из системы');
  };

  const totalCartCount = cartItems.reduce(
    (sum, item) => sum + item.quantity,
    0
  );

  const totalCartPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  const containerStyle = {
    backgroundColor: '#121214',
    color: '#e1e1e6',
    minHeight: '100vh',
    padding: '30px 20px',
    fontFamily: 'sans-serif'
  };

  const cardStyle = {
    backgroundColor: '#1f1f23',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '1px solid #29292e',
    textAlign: 'center',
    cursor: 'pointer'
  };

  return (
    <div style={containerStyle}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        <header
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px',
            marginBottom: '30px',
            borderBottom: '2px solid #29292e',
            paddingBottom: '15px'
          }}
        >
          <h1
            style={{
              fontSize: '24px',
              color: '#fff',
              cursor: 'pointer'
            }}
            onClick={() => {
              setSelectedRestaurant(null);
              setShowStats(false);
              setShowCart(false);
            }}
          >
             Доставка еды
          </h1>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap'
            }}
          >
            {!isAdmin && (
              <button
                onClick={() => {
                  setShowCart(!showCart);
                  setShowStats(false);
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}
              >
                 Корзина ({totalCartCount})
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  showStats ? setShowStats(false) : fetchStats();
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  fontWeight: 'bold'
                }}
              >
                {showStats ? ' К меню' : 'Аналитика'}
              </button>
            )}

            {user ? (
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: '#1f1f23',
                  padding: '6px 12px',
                  borderRadius: '6px',
                  border: '1px solid #29292e'
                }}
              >
                <span style={{ fontSize: '13px', color: '#a8a8b3' }}>
                  {user.email} ({user.role})
                </span>

                <button
                  onClick={handleLogout}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#e53935',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  Выйти
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <Link
                  to="/login"
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#007bff',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}
                >
                  Войти
                </Link>

                <Link
                  to="/register"
                  style={{
                    padding: '8px 14px',
                    backgroundColor: '#38383d',
                    color: '#fff',
                    textDecoration: 'none',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                >
                  Регистрация
                </Link>
              </div>
            )}
          </div>
        </header>

        
        {showCart ? (
          <div style={{
            backgroundColor: '#1f1f23',
            padding: '25px',
            borderRadius: '12px',
            border: '1px solid #29292e'
          }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2>Ваша корзина</h2>

              <button
                onClick={() => setShowCart(false)}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#38383d',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px'
                }}
              >
                Закрыть
              </button>
            </div>

            {cartItems.length === 0 ? (
              <p style={{ color: '#a8a8b3' }}>
                Корзина пока пуста. Выберите блюда из меню!
              </p>
            ) : (
              <div>
                {cartItems.map((item) => (
                  <div
                    key={item.id}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '12px 0',
                      borderBottom: '1px solid #29292e'
                    }}
                  >
                    <div>
                      <strong style={{ fontSize: '16px' }}>
                        {item.name}
                      </strong>

                      <p style={{ fontSize: '13px', color: '#a8a8b3' }}>
                        {item.price} тг × {item.quantity} шт.
                      </p>
                    </div>

                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '15px'
                    }}>
                      <span style={{ fontWeight: 'bold', color: '#4cd964' }}>
                        {item.price * item.quantity} тг
                      </span>

                      <button
                        onClick={() => removeFromCart(item.id)}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: '#e53935',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px'
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                ))}

                <div style={{
                  marginTop: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '15px'
                }}>
                  <h3>
                    Итого к оплате:{' '}
                    <span style={{ color: '#4cd964' }}>
                      {totalCartPrice} тг
                    </span>
                  </h3>

                  <button
                    onClick={handleCheckout}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#28a745',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '16px',
                      fontWeight: 'bold'
                    }}
                  >
                    Оформить заказ
                  </button>
                </div>
              </div>
            )}
          </div>

        ) : showStats && statsData ? (

          /* Аналитика администратора */
          <div>
            <h2 style={{ marginBottom: '20px', color: '#fff' }}>
               Аналитический дашборд
            </h2>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '20px'
            }}>
              {/* Средний чек */}
              <div style={{
                ...cardStyle,
                padding: '20px',
                textAlign: 'left',
                cursor: 'default'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  marginBottom: '15px',
                  color: '#4da5ff'
                }}>
                   Средний чек по месяцам
                </h3>

                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  gap: '20px',
                  height: '150px',
                  borderBottom: '1px solid #38383d',
                  paddingBottom: '5px'
                }}>
                  {statsData.averageCheckByMonth.map((d, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      flex: 1
                    }}>
                      <span style={{ fontSize: '12px', marginBottom: '4px' }}>
                        {Math.round(d.amount)}тг
                      </span>

                      <div style={{
                        width: '100%',
                        backgroundColor: '#28a745',
                        height: `${Math.min(d.amount / 15, 120)}px`,
                        borderRadius: '4px 4px 0 0'
                      }} />

                      <span style={{
                        fontSize: '12px',
                        marginTop: '4px',
                        color: '#a8a8b3'
                      }}>
                        Мес {d.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Заказы по часам */}
              <div style={{
                ...cardStyle,
                padding: '20px',
                textAlign: 'left',
                cursor: 'default'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  marginBottom: '15px',
                  color: '#4da5ff'
                }}>
                   Заказы по часам
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  {statsData.ordersByHour.map((d, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px'
                    }}>
                      <span style={{
                        width: '45px',
                        fontSize: '13px',
                        color: '#a8a8b3'
                      }}>
                        {d.hour}
                      </span>

                      <div style={{
                        flex: 1,
                        backgroundColor: '#38383d',
                        height: '8px',
                        borderRadius: '4px'
                      }}>
                        <div style={{
                          width: `${Math.min(d.orders * 10, 100)}%`,
                          backgroundColor: '#007bff',
                          height: '100%',
                          borderRadius: '4px'
                        }} />
                      </div>

                      <span style={{ fontSize: '13px', fontWeight: 'bold' }}>
                        {d.orders} шт.
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Популярные блюда */}
              <div style={{
                ...cardStyle,
                padding: '20px',
                textAlign: 'left',
                cursor: 'default'
              }}>
                <h3 style={{
                  fontSize: '16px',
                  marginBottom: '15px',
                  color: '#4da5ff'
                }}>
                   Популярные блюда
                </h3>

                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px'
                }}>
                  {statsData.popularItems.map((d, i) => (
                    <div key={i} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px',
                      backgroundColor: '#121214',
                      borderRadius: '6px'
                    }}>
                      <span style={{ fontSize: '14px' }}>{d.name}</span>

                      <span style={{ fontWeight: 'bold', color: '#ffc107' }}>
                        {d.value} шт.
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

        ) : (

          /* Рестораны и меню */
          <>
            {!selectedRestaurant ? (

              <div>
                <h2 style={{ marginBottom: '20px', fontSize: '22px' }}>
                  Выберите ресторан:
                </h2>

                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '20px'
                }}>
                  {restaurants.map((res) => (
                    <div
                      key={res.id}
                      onClick={() => setSelectedRestaurant(res)}
                      style={cardStyle}
                    >
                      <img
                        src={restaurantImages[res.id] || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800'}
                        alt={res.name}
                        style={{
                          width: '100%',
                          height: '200px',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                      />

                      <div style={{ padding: '20px' }}>
                        <h3 style={{
                          color: '#4da5ff',
                          fontSize: '20px',
                          marginBottom: '8px'
                        }}>
                          {res.name}
                        </h3>

                        <p style={{ color: '#a8a8b3' }}>
                          Кухня: {res.cuisine}
                        </p>

                        <span style={{
                          display: 'inline-block',
                          marginTop: '12px',
                          color: '#4da5ff',
                          fontWeight: '500'
                        }}>
                          Открыть меню →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            ) : (

              <div>
                <button
                  onClick={() => {
                    setSelectedRestaurant(null);
                    setMenuItems([]);
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#29292e',
                    color: '#e1e1e6',
                    border: '1px solid #38383d',
                    borderRadius: '6px',
                    marginBottom: '20px'
                  }}
                >
                  ← К списку ресторанов
                </button>

                <h2 style={{ marginBottom: '5px' }}>
                  Меню:{' '}
                  <span style={{ color: '#4da5ff' }}>
                    {selectedRestaurant.name}
                  </span>
                </h2>

                <p style={{
                  color: '#a8a8b3',
                  marginBottom: '20px'
                }}>
                  Кухня: {selectedRestaurant.cuisine}
                </p>

                {/* Поиск */}
                <input
                  type="text"
                  placeholder="🔍 Поиск блюда..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    fontSize: '16px',
                    borderRadius: '8px',
                    backgroundColor: '#1f1f23',
                    color: '#fff',
                    border: '1px solid #29292e',
                    marginBottom: '25px',
                    boxSizing: 'border-box'
                  }}
                />

                {/* Список блюд */}
                {isLoading ? (
                  <h3 style={{
                    textAlign: 'center',
                    color: '#a8a8b3'
                  }}>
                    Загрузка меню...
                  </h3>
                ) : (
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                    gap: '20px',
                    marginBottom: '30px'
                  }}>
                    
                      {menuItems.map((item) => (
                        <div
                          key={item.id}
                          style={{
                            backgroundColor: '#1f1f23',
                            borderRadius: '12px',
                            padding: '18px',
                            border: '1px solid #29292e',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            minHeight: '124px',
                            boxSizing: 'border-box'
                          }}
                        >
                          <h3 style={{
                            fontSize: '16px',
                            margin: 0,
                            lineHeight: '22px',
                            minHeight: '44px'
                          }}>
                            {item.name}
                          </h3>

                          <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            gap: '10px',
                            marginTop: '12px'
                          }}>
                            <span style={{
                              fontSize: '20px',
                              fontWeight: 'bold',
                              color: '#4cd964',
                              whiteSpace: 'nowrap'
                            }}>
                              {item.price} тг
                            </span>

                            {!isAdmin && (
                              <button
                                onClick={() => addToCart(item)}
                                style={{
                                  padding: '8px 14px',
                                  backgroundColor: '#007bff',
                                  color: 'white',
                                  border: 'none',
                                  borderRadius: '6px',
                                  fontWeight: 'bold',
                                  whiteSpace: 'nowrap',
                                  cursor: 'pointer',
                                  flexShrink: 0
                                }}
                              >
                                + В корзину
                              </button>
                            )}
                          </div>

                          {isAdmin && (
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              style={{
                                marginTop: '15px',
                                width: '100%',
                                padding: '8px',
                                backgroundColor: '#e53935',
                                color: 'white',
                                border: 'none',
                                borderRadius: '6px'
                              }}
                            >
                              Удалить позицию
                            </button>
                          )}
                        </div>
                      ))}
                  </div>
                )}

                {/* Пагинация */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '15px'
                }}>
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(page - 1)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #29292e',
                      backgroundColor: '#1f1f23',
                      color: '#fff'
                    }}
                  >
                    Назад
                  </button>

                  <span>
                    Страница {page} из {totalPages}
                  </span>

                  <button
                    disabled={page === totalPages}
                    onClick={() => setPage(page + 1)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '6px',
                      border: '1px solid #29292e',
                      backgroundColor: '#1f1f23',
                      color: '#fff'
                    }}
                  >
                    Вперед
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}