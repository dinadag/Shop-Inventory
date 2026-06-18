import React, { useState, useEffect } from 'react';

function App() {
  const [route, setRoute] = useState('/');
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')) || null);
  const [cart, setCart] = useState(JSON.parse(localStorage.getItem('cart')) || []);
  
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');

 
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);


  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);


  const fetchProducts = async (query = '') => {
    const res = await fetch(`https://shop-inventory-p5gt.onrender.com/products${query ? '?search=' + query : ''}`);
    const data = await res.json();
    setProducts(data);
  };

  useEffect(() => {
    fetchProducts();
  }, [route]);


  const addToCart = (product) => {
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    alert('Added to cart!');
  };

  const clearCart = () => setCart([]);

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };


  const renderHeader = () => (
    <div className="header">
      <h2>Shop Inventory</h2>
      <div className="nav-buttons">
        <button onClick={() => setRoute('/')}>Home / Products</button>
        
        {user ? (
          <>
            {user.role === 'admin' && <button onClick={() => setRoute('/admin')}>Admin Dashboard</button>}
            <button onClick={() => setRoute('/cart')}>Cart ({cart.length})</button>
            <button onClick={() => setRoute('/orders')}>My Orders</button>
            <button onClick={() => { setUser(null); setRoute('/login'); }}>Logout</button>
          </>
        ) : (
          <>
            <button onClick={() => setRoute('/login')}>Login</button>
            <button onClick={() => setRoute('/register')}>Register</button>
          </>
        )}
      </div>
    </div>
  );

  const renderHome = () => (
    <div>
      <h3>All Products</h3>
      <div className="search-bar">
        <input type="text" placeholder="Search..." value={search} onChange={e => setSearch(e.target.value)} />
        <button onClick={() => fetchProducts(search)}>Search</button>
      </div>
      
      <div className="product-grid">
        {products.map(p => (
          <div key={p.id} className="product-card">
            <h4>{p.name}</h4>
            <p>{p.description}</p>
            <p><strong>${p.price}</strong> (Stock: {p.stock})</p>
            <button onClick={() => addToCart(p)} disabled={p.stock <= 0}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  );

  const LoginView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const login = async () => {
      const res = await fetch('https://shop-inventory-p5gt.onrender.com/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setUser(data);
        setRoute('/');
      }
    };

    return (
      <div>
        <h3>Login</h3>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        Email: <input type="email" onChange={e => setEmail(e.target.value)} /><br/><br/>
        Password: <input type="password" onChange={e => setPassword(e.target.value)} /><br/><br/>
        <button onClick={login}>Login</button>
      </div>
    );
  };

  const RegisterView = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const register = async () => {
      const res = await fetch('https://shop-inventory-p5gt.onrender.com/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setUser(data);
        setRoute('/');
      }
    };

    return (
      <div>
        <h3>Register</h3>
        Email: <input type="email" onChange={e => setEmail(e.target.value)} /><br/><br/>
        Password: <input type="password" onChange={e => setPassword(e.target.value)} /><br/><br/>
        <button onClick={register}>Sign Up</button>
      </div>
    );
  };

  const CartView = () => {
    const [payment, setPayment] = useState('cash');

    const checkout = async () => {
      if (cart.length === 0) return alert('Cart is empty!');
      const res = await fetch('https://shop-inventory-p5gt.onrender.com/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, items: cart, paymentMethod: payment })
      });
      const data = await res.json();
      if (data.success) {
        alert('Order placed!');
        clearCart();
        setRoute('/orders');
      }
    };

    return (
      <div>
        <h3>Your Cart</h3>
        {cart.map(item => (
          <p key={item.id}>{item.name} - ${item.price} x {item.quantity}</p>
        ))}
        <h4>Total: ${getCartTotal()}</h4>
        
        <p>Payment Method:</p>
        <select onChange={e => setPayment(e.target.value)} value={payment}>
          <option value="cash">Cash on Delivery</option>
          <option value="bank">Bank Transfer</option>
        </select>
        
        {payment === 'bank' && <p>Bank Details: Send money to Account 12345678</p>}
        
        <br/><br/>
        <button onClick={checkout}>Checkout</button>
      </div>
    );
  };

  const OrdersView = () => {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
      fetch(`https://shop-inventory-p5gt.onrender.com/orders?userId=${user.id}`)
        .then(res => res.json())
        .then(data => setOrders(data));
    }, []);

    return (
      <div>
        <h3>My Orders</h3>
        {orders.map(o => (
          <div key={o.id} className="order-card">
            <p>Order ID: {o.id}</p>
            <p>Total: ${o.total} | Paid via: {o.payment_method}</p>
            <ul>
              {o.items.map(item => (
                <li key={item.id}>{item.product_name} x {item.quantity} (${item.price} each)</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  const AdminView = () => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [price, setPrice] = useState('');
    const [stock, setStock] = useState('');

    const addProduct = async () => {
      await fetch('https://shop-inventory-p5gt.onrender.com/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description: desc, price, stock })
      });
      fetchProducts();
      alert('Added!');
    };

    const deleteProduct = async (id) => {
      await fetch(`https://shop-inventory-p5gt.onrender.com/products/${id}`, { method: 'DELETE' });
      fetchProducts();
    };

    return (
      <div>
        <h3>Add Product</h3>
        Name: <input onChange={e => setName(e.target.value)} /><br/>
        Desc: <input onChange={e => setDesc(e.target.value)} /><br/>
        Price: <input type="number" onChange={e => setPrice(e.target.value)} /><br/>
        Stock: <input type="number" onChange={e => setStock(e.target.value)} /><br/>
        <button onClick={addProduct}>Save Product</button>

        <hr />
        <h3>Manage Products</h3>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>${p.price}</td>
                <td>{p.stock}</td>
                <td><button className="btn-danger" onClick={() => deleteProduct(p.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="app-container">
      {renderHeader()}
      <div className="content">
        {route === '/' && renderHome()}
        {route === '/login' && <LoginView />}
        {route === '/register' && <RegisterView />}
        {route === '/cart' && user && <CartView />}
        {route === '/orders' && user && <OrdersView />}
        {route === '/admin' && user?.role === 'admin' && <AdminView />}
      </div>
    </div>
  );
}

export default App;
