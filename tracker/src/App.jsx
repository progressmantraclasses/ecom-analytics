import { useState, useEffect, useRef } from 'react';
import {
  ShoppingCart,
  BarChart2,
  Menu,
  Rocket,
  Target,
  BookOpen,
  Flame,
  User,
  Filter,
  Beaker,
  Gem,
  CheckCircle,
  FileText,
  MousePointer2,
  Activity,
  X,
  Radio,
  ArrowLeft,
  CreditCard,
  Truck,
  Check
} from 'lucide-react';

function App() {
  const [sessionId, setSessionId] = useState('loading...');
  const [logs, setLogs] = useState([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [totalBatches, setTotalBatches] = useState(0);
  const consoleEndRef = useRef(null);

  // E-commerce states
  const [isLogsOpen, setIsLogsOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Initialize cart from localStorage if available
  const [cart, setCart] = useState(() => {
    try {
      const saved = localStorage.getItem('nexus_cart');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [view, setView] = useState('home'); // 'home' | 'checkout'
  
  // Toast notifications state
  const [toasts, setToasts] = useState([]);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  
  // Checkout Form states
  const [chkName, setChkName] = useState('');
  const [chkEmail, setChkEmail] = useState('');
  const [chkAddress, setChkAddress] = useState('');
  const [chkCard, setChkCard] = useState('');

  // Products
  const products = [
    { id: 'prod_1', name: 'Nexus Quantum Headset', price: 299, image: '/images/headphones.png', badge: 'New' },
    { id: 'prod_2', name: 'Aura Mechanical Keyboard', price: 159, image: '/images/keyboard.png', badge: 'Popular' },
    { id: 'prod_3', name: 'Precision Ergonomic Mouse', price: 89, image: '/images/mouse.png', badge: null },
    { id: 'prod_4', name: 'Nova Smartwatch Pro', price: 349, image: '/images/watch.png', badge: 'Trending' },
    { id: 'prod_5', name: 'UltraView Curved Monitor', price: 699, image: '/images/monitor.png', badge: null },
    { id: 'prod_6', name: 'StudioCast Microphone', price: 129, image: '/images/mic.png', badge: 'Sale' },
  ];

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('nexus_cart', JSON.stringify(cart));
  }, [cart]);

  // Toast auto-dismissal
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts((prev) => prev.slice(1));
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  const showToast = (message) => {
    setToasts((prev) => [...prev, { id: Date.now(), message }]);
  };

  useEffect(() => {
    // Check if CausalTracker is loaded on window
    const checkTracker = setInterval(() => {
      if (window.CausalTracker) {
        clearInterval(checkTracker);
        setSessionId(window.CausalTracker.getSessionId());

        // Register event listener for live logger
        window.CausalTracker.onEvent((events) => {
          setTotalBatches((prev) => prev + 1);
          setTotalEvents((prev) => prev + events.length);
          const clicksCount = events.filter((e) => e.event_type === 'click').length;
          setTotalClicks((prev) => prev + clicksCount);

          const formattedLogs = events.map((event) => {
            const time = new Date(event.timestamp);
            const timeStr = time.getHours().toString().padStart(2, '0') + ':' +
                            time.getMinutes().toString().padStart(2, '0') + ':' +
                            time.getSeconds().toString().padStart(2, '0') + '.' +
                            time.getMilliseconds().toString().padStart(3, '0');

            return {
              id: `${event.session_id}-${event.timestamp}-${Math.random()}`,
              timeStr,
              eventType: event.event_type,
              sessionId: event.session_id,
              pageUrl: event.page_url,
              x: event.x,
              y: event.y,
              extraData: event
            };
          });

          setLogs((prev) => [...prev, ...formattedLogs]);
        });
      }
    }, 100);

    return () => clearInterval(checkTracker);
  }, []);

  useEffect(() => {
    if (consoleEndRef.current) {
      consoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isLogsOpen]);

  const clearConsole = () => setLogs([]);

  const addToCart = (product) => {
    setCart((prev) => [...prev, product]);
    showToast(`${product.name} added to cart!`);
    
    // Dispatch an explicit semantic event to the tracker
    if (window.CausalTracker) {
      window.CausalTracker.track('add_to_cart', {
        product_id: product.id,
        product_name: product.name,
        price: product.price
      });
    }
  };
  
  const proceedToCheckout = () => {
    setIsCartOpen(false);
    setView('checkout');
    window.scrollTo(0, 0);
    
    if (window.CausalTracker) {
      window.CausalTracker.track('begin_checkout', {
        cart_size: cart.length,
        cart_total: cartTotal
      });
    }
  };

  const completePurchase = () => {
    if (!chkName || !chkCard) {
      alert('Please fill out the payment form before tracking the checkout.');
      return;
    }
    
    if (window.CausalTracker) {
      window.CausalTracker.track('purchase', {
        cart_total: cartTotal,
        items_count: cart.length,
        customer_name: chkName
      });
    }
    
    alert('Payment successful! Returning to home.');
    setCart([]);
    setChkName('');
    setChkEmail('');
    setChkAddress('');
    setChkCard('');
    setView('home');
    window.scrollTo(0, 0);
  };

  const handleFormSubmit = () => {
    if (name && email) {
      showToast('Successfully subscribed to the newsletter!');
      
      if (window.CausalTracker) {
        window.CausalTracker.track('newsletter_signup', {
          email_provided: true
        });
      }
      
      setName('');
      setEmail('');
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price, 0);

  return (
    <div className="ecommerce-app">
      {/* NAVBAR */}
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-logo" id="nav-logo" onClick={() => setView('home')}>NexusStore</div>
          
          <div className={`nav-links ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
            <a href="#features" className="nav-link" id="link-features" onClick={() => setView('home')}>Features</a>
            <a href="#pricing" className="nav-link" id="link-pricing" onClick={() => setView('home')}>Pricing</a>
            <a href="#blog" className="nav-link" id="link-blog">Blog</a>
            <a href="#careers" className="nav-link" id="link-careers">Careers</a>
            <a href="#contact" className="nav-link" id="link-contact">Contact Us</a>
          </div>

          <div className="nav-actions">
            <button className="btn-icon cart-btn" id="btn-cart" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={22} />
              {cart.length > 0 && <span className="cart-badge">{cart.length}</span>}
            </button>
            <button className="btn btn-outline desktop-only" id="btn-event-logs" onClick={() => setIsLogsOpen(true)}>
              <Activity size={16} /> View Event Logs
            </button>
            <button className="btn-icon mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              <Menu size={24} />
            </button>
          </div>
        </div>
      </nav>

      {/* DYNAMIC VIEW CONTAINER */}
      {view === 'home' && (
        <>
          {/* HERO SECTION */}
          <header className="hero-section">
            <div className="hero-container">
              <div className="hero-content">
                <span className="hero-badge">Next-Generation Tech</span>
                <h1>Elevate Your Digital Experience</h1>
                <p>Discover premium accessories designed for peak performance and ultimate comfort. Step into the future of productivity.</p>
                <div className="hero-buttons">
                  <button className="btn btn-primary btn-large" id="btn-cta">
                    <Rocket size={18} /> Get Started
                  </button>
                  <button className="btn btn-outline btn-large" id="btn-demo">
                    <Target size={18} /> Book a Demo
                  </button>
                  <button className="btn btn-secondary btn-large desktop-only" id="btn-docs">
                    <BookOpen size={18} /> Documentation
                  </button>
                </div>
              </div>
              <div className="hero-visual desktop-only">
                {/* Tech product showcase in hero */}
                <div className="hero-card hc-1" id="hero-img-watch">
                  <img src="/images/watch.png" alt="Smartwatch" />
                </div>
                <div className="hero-card hc-2" id="hero-img-monitor">
                  <img src="/images/monitor.png" alt="Curved Monitor" />
                </div>
                <div className="hero-card hc-3" id="hero-img-mic">
                  <img src="/images/mic.png" alt="Microphone" />
                </div>
              </div>
            </div>
          </header>

          <main className="main-content">
            {/* PRODUCT GRID */}
            <section id="shop" className="section">
              <div className="section-heading">
                <h2>Featured Products</h2>
                <p>Handpicked essentials for your workspace</p>
              </div>
              
              <div className="product-grid">
                {products.map((product, idx) => (
                  <div className="product-card" key={product.id} id={`card-${product.id}`}>
                    {product.badge && <span className="product-badge">{product.badge}</span>}
                    <div className="product-image-container" id={`img-product${idx + 1}`}>
                      <img src={product.image} alt={product.name} className="product-image" />
                    </div>
                    <div className="product-info">
                      <h3>{product.name}</h3>
                      <p className="price">${product.price}</p>
                      <button 
                        className="btn btn-primary w-full" 
                        id={`btn-add-${product.id}`}
                        onClick={() => addToCart(product)}
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* FEATURES (CARDS) */}
            <section id="features" className="section bg-surface">
              <div className="section-heading">
                <h2>Why Choose Nexus</h2>
                <p>Built for professionals who demand the best</p>
              </div>
              <div className="features-grid">
                <div className="feature-card" id="card-heatmaps">
                  <div className="icon bg-orange"><Flame size={28} /></div>
                  <h3>Heatmaps</h3>
                  <p>Advanced thermal dissipation technology in all our gear.</p>
                </div>
                <div className="feature-card" id="card-sessions">
                  <div className="icon bg-blue"><User size={28} /></div>
                  <h3>Session Replay</h3>
                  <p>Macro recording capabilities to replay your best sessions.</p>
                </div>
                <div className="feature-card" id="card-funnels">
                  <div className="icon bg-purple"><Filter size={28} /></div>
                  <h3>Funnels</h3>
                  <p>Optimized ergonomic funnels for maximum comfort.</p>
                </div>
                <div className="feature-card" id="card-ab">
                  <div className="icon bg-green"><Beaker size={28} /></div>
                  <h3>A/B Testing</h3>
                  <p>Rigorous multi-stage quality assurance testing.</p>
                </div>
              </div>
            </section>

            {/* PRICING & CALL TO ACTIONS */}
            <section id="pricing" className="section">
              <div className="section-heading">
                <h2>Join the Pro Tier</h2>
                <p>Unlock exclusive software features for your hardware</p>
              </div>
              <div className="pricing-actions">
                <button className="btn btn-warning btn-large" id="btn-pricing">
                  <Gem size={18} /> View Pricing
                </button>
                <button className="btn btn-success btn-large" id="btn-signup">
                  <CheckCircle size={18} /> Sign Up Free
                </button>
                <button className="btn btn-secondary btn-large" id="btn-analytics">
                  <BarChart2 size={18} /> View Analytics
                </button>
              </div>
            </section>
            
            {/* INTERACTIVE FORM SECTION */}
            <section id="contact" className="section newsletter-section">
              <div className="newsletter-card">
                <div className="newsletter-content">
                  <h2>Join Our Newsletter</h2>
                  <p>Get the latest updates and exclusive offers directly to your inbox.</p>
                  <div className="newsletter-form">
                    <input 
                      type="text" 
                      placeholder="Your name..." 
                      className="demo-input" 
                      id="input-name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                    <input 
                      type="email" 
                      placeholder="your@email.com" 
                      className="demo-input" 
                      id="input-email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <button className="btn btn-primary" id="btn-submit" onClick={handleFormSubmit} disabled={!name || !email}>
                      Subscribe
                    </button>
                  </div>
                </div>
              </div>
            </section>
          </main>
        </>
      )}

      {/* CHECKOUT FLOW VIEW */}
      {view === 'checkout' && (
        <main className="main-content" style={{ padding: '60px 24px' }}>
           <button className="btn btn-outline" id="btn-back-home" onClick={() => setView('home')} style={{ marginBottom: '32px' }}>
              <ArrowLeft size={16} /> Back to Store
           </button>
           
           <div className="section-heading" style={{ textAlign: 'left', marginBottom: '32px' }}>
              <h2>Checkout & Pricing</h2>
              <p>Review your items and complete payment securely.</p>
           </div>

           <div className="checkout-grid">
              {/* LEFT COL: BILLING */}
              <div className="checkout-form-section">
                 <div className="card-box">
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Truck size={20} className="text-primary" /> Shipping Details
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                       <input 
                         type="text" 
                         className="demo-input w-full" 
                         id="chk-name" 
                         placeholder="Full Name" 
                         value={chkName}
                         onChange={(e) => setChkName(e.target.value)} 
                       />
                       <input 
                         type="email" 
                         className="demo-input w-full" 
                         id="chk-email" 
                         placeholder="Email Address" 
                         value={chkEmail}
                         onChange={(e) => setChkEmail(e.target.value)} 
                       />
                       <input 
                         type="text" 
                         className="demo-input w-full" 
                         id="chk-address" 
                         placeholder="Full Shipping Address" 
                         value={chkAddress}
                         onChange={(e) => setChkAddress(e.target.value)} 
                       />
                    </div>
                 </div>

                 <div className="card-box" style={{ marginTop: '24px' }}>
                    <h3 style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <CreditCard size={20} className="text-primary" /> Payment Method
                    </h3>
                    <div style={{ display: 'grid', gap: '16px' }}>
                       <input 
                         type="text" 
                         className="demo-input w-full" 
                         id="chk-card" 
                         placeholder="Card Number (XXXX XXXX XXXX XXXX)" 
                         value={chkCard}
                         onChange={(e) => setChkCard(e.target.value)} 
                       />
                       <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                         <input type="text" className="demo-input w-full" id="chk-expiry" placeholder="MM/YY" />
                         <input type="text" className="demo-input w-full" id="chk-cvc" placeholder="CVC" />
                       </div>
                    </div>
                 </div>

                 <button className="btn btn-primary btn-large w-full" id="btn-pay-now" onClick={completePurchase} style={{ marginTop: '24px' }}>
                    <CheckCircle size={18} /> Complete Order & Pay ${cartTotal}
                 </button>
              </div>

              {/* RIGHT COL: SUMMARY */}
              <div className="checkout-summary-section">
                 <div className="card-box sticky-top">
                    <h3 style={{ marginBottom: '24px' }}>Order Summary</h3>
                    
                    {cart.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)' }}>No items in cart.</p>
                    ) : (
                      <>
                        <div className="checkout-items">
                          {cart.map((item, idx) => (
                            <div className="checkout-item" key={`chk-${idx}`}>
                               <div className="chk-item-img">
                                  <img src={item.image} alt={item.name} />
                               </div>
                               <div className="chk-item-info">
                                  <div className="chk-item-name">{item.name}</div>
                                  <div className="chk-item-price">${item.price}</div>
                               </div>
                            </div>
                          ))}
                        </div>

                        <div className="checkout-totals">
                           <div className="tot-row">
                              <span>Subtotal</span>
                              <span>${cartTotal}</span>
                           </div>
                           <div className="tot-row">
                              <span>Shipping</span>
                              <span style={{ color: 'var(--success)' }}>Free</span>
                           </div>
                           <div className="tot-row">
                              <span>Taxes</span>
                              <span>$0.00</span>
                           </div>
                           <div className="tot-row tot-final">
                              <span>Total Pricing</span>
                              <span>${cartTotal}</span>
                           </div>
                        </div>
                      </>
                    )}
                 </div>
              </div>
           </div>
        </main>
      )}

      {/* FOOTER */}
      <footer className="footer">
        <p>&copy; 2026 NexusStore. All rights reserved.</p>
        <button className="btn btn-outline mobile-only" id="btn-event-logs-mobile" onClick={() => setIsLogsOpen(true)} style={{marginTop: '16px'}}>
          <Activity size={16} /> View Event Logs
        </button>
      </footer>

      {/* CART MODAL */}
      {isCartOpen && (
        <div className="modal-overlay">
          <div className="modal-content cart-modal">
            <div className="modal-header">
              <h2>Your Cart</h2>
              <button className="btn-close" id="btn-close-cart" onClick={() => setIsCartOpen(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {cart.length === 0 ? (
                <div className="empty-state">Your cart is empty</div>
              ) : (
                <div className="cart-items">
                  {cart.map((item, idx) => (
                    <div className="cart-item" key={idx}>
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-price">${item.price}</span>
                      </div>
                    </div>
                  ))}
                  <div className="cart-total">
                    <span>Total Pricing:</span>
                    <span>${cartTotal}</span>
                  </div>
                  <button className="btn btn-primary w-full" id="btn-checkout" onClick={proceedToCheckout}>
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* EVENT LOGS DRAWER */}
      <div className={`logs-drawer ${isLogsOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div>
            <h2 style={{ fontSize: '18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Activity size={20} color="#10B981" /> Event Tracking
              <span className="badge badge-green" id="status-badge">
                <Radio size={12} className="pulse-icon" /> Online
              </span>
            </h2>
            <div className="session-info-mini">Session: <code>{sessionId.substring(0, 16)}...</code></div>
          </div>
          <button className="btn-close" id="btn-close-logs" onClick={() => setIsLogsOpen(false)}>
            <X size={20} />
          </button>
        </div>
        
        <div className="stats-row" style={{ margin: '16px 20px' }}>
          <div className="stat-mini">
            <div className="value" id="total-events">{totalEvents}</div>
            <div className="label">Total Events</div>
          </div>
          <div className="stat-mini">
            <div className="value" id="total-clicks">{totalClicks}</div>
            <div className="label">Clicks</div>
          </div>
          <div className="stat-mini">
            <div className="value" id="total-batches">{totalBatches}</div>
            <div className="label">Batches Sent</div>
          </div>
        </div>

        <div className="drawer-body">
          <div className="console-panel" style={{ position: 'relative', top: 0, height: '100%' }}>
            <div className="card" style={{ marginBottom: 0, height: '100%', display: 'flex', flexDirection: 'column' }}>
              <div className="console-header" style={{ marginBottom: '8px' }}>
                <div className="section-title" style={{ fontSize: '14px' }}>Live Log Stream</div>
                <button className="btn btn-secondary" style={{ padding: '4px 8px', fontSize: '11px' }} onClick={clearConsole}>
                  Clear
                </button>
              </div>

              <div className="console-body" id="event-console" style={{ flex: 1, height: 'auto', minHeight: '300px' }}>
                {logs.length === 0 ? (
                  <div className="console-empty" id="console-empty">
                    <div><Radio size={24} color="var(--text-muted)" /></div>
                    <div>Waiting for events...</div>
                    <div style={{ fontSize: '10px' }}>Interact with the store to track events</div>
                  </div>
                ) : (
                  logs.map((log) => {
                    const typeIcon = log.eventType === 'page_view' ? <FileText size={12} className="log-type-page_view" /> 
                      : log.eventType === 'click' ? <MousePointer2 size={12} className="log-type-click" />
                      : <Activity size={12} style={{ color: '#F59E0B' }} />;
                    
                    const typeClass = log.eventType === 'page_view' ? 'log-type-page_view' 
                      : log.eventType === 'click' ? 'log-type-click'
                      : '';

                    return (
                      <div className="log-entry" key={log.id}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span className="log-time">[{log.timeStr}] </span>
                          {typeIcon} <span className={typeClass} style={!typeClass ? {color: '#F59E0B'} : {}}>{log.eventType}</span>
                        </div>
                        <div className="log-url">  {log.pageUrl}</div>
                        
                        {/* Display Extra Data for custom events */}
                        {log.extraData && log.eventType !== 'click' && log.eventType !== 'page_view' && (
                          <div style={{ marginTop: '4px', opacity: 0.8 }}>
                            {Object.entries(log.extraData)
                              .filter(([k]) => !['session_id', 'event_type', 'page_url', 'timestamp', 'viewport_width', 'viewport_height'].includes(k))
                              .map(([k, v]) => (
                                <div key={k}><span className="log-key">  {k}: </span><span className="log-val">{String(v)}</span></div>
                              ))
                            }
                          </div>
                        )}
                        
                        {log.eventType === 'click' && log.x !== undefined && (
                          <div>
                            <span className="log-key">  coords: </span>
                            <span className="log-val">
                              ({Math.round(log.x)}, {Math.round(log.y)})
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
                <div ref={consoleEndRef} />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Overlay for Drawer */}
      {isLogsOpen && <div className="drawer-overlay" onClick={() => setIsLogsOpen(false)}></div>}

      {/* TOAST CONTAINER */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className="toast">
            <Check size={16} color="#10B981" />
            <span>{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
