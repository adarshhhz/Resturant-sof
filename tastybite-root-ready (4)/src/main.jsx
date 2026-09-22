import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
}) : null;
const money = n => `₹${Number(n || 0).toFixed(2)}`;
const params = new URLSearchParams(location.search);
const initialRole = params.get("role") || "customer";
const initialTable = params.get("table");
const AUTH_STORAGE_KEY = "tastybite_auth_v1";
const ROLE_STORAGE_KEY = "tastybite_role_v1";
const DEMO_USERS = {
  customer: { email: "customer@tastybite.local", password: "customer123", name: "Guest" },
  waiter: { email: "waiter@tastybite.local", password: "waiter123", name: "Waiter" },
  kitchen: { email: "kitchen@tastybite.local", password: "kitchen123", name: "Chef Arif" },
  admin: { email: "admin@tastybite.local", password: "admin123", name: "Admin" },
};
const roleLabels = { customer: "Customer", waiter: "Waiter", kitchen: "Kitchen", admin: "Admin" };

const foodImages = {
  "Margherita Pizza": "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?auto=format&fit=crop&w=400&q=80",
  "Classic Cheeseburger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  "Burger": "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=400&q=80",
  "Creamy Alfredo Pasta": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=400&q=80",
  "Pasta Alfredo": "https://images.unsplash.com/photo-1645112411341-6c4fd023714a?auto=format&fit=crop&w=400&q=80",
  "Caesar Salad": "https://images.unsplash.com/photo-1550304943-4f24f54ddde9?auto=format&fit=crop&w=400&q=80",
  "Fresh Lemonade": "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f3c?auto=format&fit=crop&w=400&q=80",
  "Chocolate Lava Cake": "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=400&q=80",
  "Chicken Biryani": "https://images.unsplash.com/photo-1563379091339-03246963d96c?auto=format&fit=crop&w=400&q=80",
  "Grilled Chicken": "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=400&q=80",
};

const demoMenu = [
  { id: "m1", name: "Classic Cheeseburger", category: "Burgers", price: 8.99, description: "Juicy beef patty, cheddar cheese, lettuce, tomato, special sauce.", emoji: "🍔" },
  { id: "m2", name: "Margherita Pizza", category: "Pizza", price: 10.99, description: "Fresh mozzarella, tomato sauce, basil, olive oil.", emoji: "🍕" },
  { id: "m3", name: "Creamy Alfredo Pasta", category: "Pasta", price: 9.99, description: "Rich and creamy sauce with parmesan and herbs.", emoji: "🍝" },
  { id: "m4", name: "Caesar Salad", category: "Salads", price: 6.99, description: "Crisp romaine, parmesan, croutons, Caesar dressing.", emoji: "🥗" },
  { id: "m5", name: "Fresh Lemonade", category: "Drinks", price: 3.99, description: "Cool and refreshing homemade lemonade.", emoji: "🍋" },
  { id: "m6", name: "Chocolate Lava Cake", category: "Desserts", price: 5.99, description: "Warm chocolate cake with molten center.", emoji: "🍫" },
  { id: "m7", name: "Chicken Biryani", category: "Biryani", price: 11.99, description: "Fragrant basmati rice with tender chicken and spices.", emoji: "🍛" },
];
const demoTables = Array.from({ length: 8 }, (_, i) => ({ id: `t${i + 1}`, table_number: i + 1, status: i < 2 ? "occupied" : "available" }));
const demoOrders = [
  { id: "1025", table_id: "t5", status: "new", total: 20.98, created_at: new Date(Date.now() - 4 * 60000).toISOString(), order_items: [{ id: "a", item_name: "Margherita Pizza", quantity: 1 }, { id: "b", item_name: "Caesar Salad", quantity: 1 }] },
  { id: "1024", table_id: "t4", status: "preparing", total: 32.50, created_at: new Date(Date.now() - 6 * 60000).toISOString(), order_items: [{ id: "c", item_name: "Chicken Biryani", quantity: 2 }, { id: "d", item_name: "Fresh Lemonade", quantity: 1 }] },
  { id: "1023", table_id: "t1", status: "preparing", total: 18.99, created_at: new Date(Date.now() - 8 * 60000).toISOString(), order_items: [{ id: "e", item_name: "Caesar Salad", quantity: 1 }, { id: "f", item_name: "Chocolate Lava Cake", quantity: 1 }] },
  { id: "1022", table_id: "t6", status: "ready", total: 28.75, created_at: new Date(Date.now() - 10 * 60000).toISOString(), order_items: [{ id: "g", item_name: "Burger", quantity: 2 }, { id: "h", item_name: "French Fries", quantity: 1 }] },
  { id: "1021", table_id: "t2", status: "ready", total: 15.40, created_at: new Date(Date.now() - 12 * 60000).toISOString(), order_items: [{ id: "i", item_name: "Salad", quantity: 1 }, { id: "j", item_name: "Lemonade", quantity: 1 }] },
  { id: "1018", table_id: "takeaway", status: "completed", total: 22.00, created_at: new Date(Date.now() - 18 * 60000).toISOString(), order_items: [{ id: "k", item_name: "Pasta", quantity: 1 }] },
  { id: "1017", table_id: "t3", status: "completed", total: 24.00, created_at: new Date(Date.now() - 22 * 60000).toISOString(), order_items: [{ id: "l", item_name: "Veg Pizza", quantity: 1 }] },
  { id: "1016", table_id: "t6", status: "completed", total: 27.00, created_at: new Date(Date.now() - 25 * 60000).toISOString(), order_items: [{ id: "m", item_name: "Chicken Biryani", quantity: 1 }] },
];

const STAFF_STORAGE_KEY = "tastybite_staff_v1";
const REVIEWS_STORAGE_KEY = "tastybite_reviews_v1";
const demoStaff = [
  { id: "s1", name: "Chef Arif", role: "Head Chef", salary: 2400, hours: "9:00 AM - 6:00 PM", days: "Mon-Sat" },
  { id: "s2", name: "Riya", role: "Waiter", salary: 1400, hours: "10:00 AM - 7:00 PM", days: "Mon-Sat" },
  { id: "s3", name: "Sam", role: "Waiter", salary: 1400, hours: "1:00 PM - 10:00 PM", days: "Tue-Sun" },
  { id: "s4", name: "Priya", role: "Sous Chef", salary: 1900, hours: "9:00 AM - 6:00 PM", days: "Mon-Sat" },
];
function loadLocal(key, fallback) {
  try { const v = JSON.parse(localStorage.getItem(key)); return Array.isArray(v) ? v : fallback; } catch { return fallback; }
}
function Icon({ name, size = 20, stroke = 2 }) {
  const paths = {
    home: <><path d="m3 10 9-7 9 7"/><path d="M5 9v11h14V9"/><path d="M9 20v-6h6v6"/></>,
    orders: <><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 7h8M8 11h8M8 15h5"/></>,
    menu: <><path d="M6 3v18M10 3v7a2 2 0 0 1-4 0V3M15 3v18M19 3v7a2 2 0 0 1-4 0V3"/></>,
    box: <><path d="m3 7 9-4 9 4-9 4-9-4Z"/><path d="M3 7v10l9 4 9-4V7M12 11v10"/></>,
    users: <><circle cx="9" cy="8" r="3"/><path d="M3 20a6 6 0 0 1 12 0M16 5a3 3 0 0 1 0 6M18 14a5 5 0 0 1 3 5"/></>,
    settings: <><path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6.3v-2.6h.2a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V5h2.6v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2V14h-.2a1.7 1.7 0 0 0-1.5 1Z"/></>,
    search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
    sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    moon: <path d="M21 14.8A8.5 8.5 0 0 1 9.2 3 8.5 8.5 0 1 0 21 14.8Z"/>,
    calendar: <><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></>,
    clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 4-4 3 2 5-6"/></>,
    cart: <><path d="M3 4h2l2 12h11l3-8H6"/><circle cx="9" cy="20" r="1"/><circle cx="18" cy="20" r="1"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3M20 4v16"/></>,
    chef: <><path d="M6 11h12v9H6z"/><path d="M5 11a4 4 0 1 1 2-7 5 5 0 0 1 10 0 4 4 0 1 1 2 7"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    close: <><path d="M6 6l12 12M18 6 6 18"/></>,
    filter: <path d="M4 6h16M7 12h10M10 18h4"/>,
    dots: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
    lock: <><rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    star: <path d="M12 2.5l3 6.1 6.7 1-4.9 4.7 1.2 6.7-6-3.2-6 3.2 1.2-6.7-4.9-4.7 6.7-1z"/>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.box}</svg>;
}

function Logo({ light = false }) {
  return <div className="logo"><div className="logo-mark">🍴</div><div><strong>TastyBite</strong><span>{light ? "Kitchen System" : "Restaurant Admin"}</span></div></div>;
}

function readSavedDemoAuth() {
  try { return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || "null"); } catch { return null; }
}

function App() {
  const savedRole = localStorage.getItem(ROLE_STORAGE_KEY);
  const [role, setRole] = useState(savedRole || initialRole);
  const [session, setSession] = useState(null);
  const [authReady, setAuthReady] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demo, setDemo] = useState(!supabase);
  const [staff, setStaff] = useState(() => loadLocal(STAFF_STORAGE_KEY, demoStaff));
  const [reviews, setReviews] = useState(() => loadLocal(REVIEWS_STORAGE_KEY, []));
  useEffect(() => { try { localStorage.setItem(STAFF_STORAGE_KEY, JSON.stringify(staff)); } catch {} }, [staff]);
  useEffect(() => { try { localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews)); } catch {} }, [reviews]);
  const addReview = (review) => setReviews(prev => [{ id: `r${Date.now()}`, created_at: new Date().toISOString(), ...review }, ...prev]);

  useEffect(() => {
    let active = true;
    if (!supabase) {
      const saved = readSavedDemoAuth();
      if (saved?.email && saved?.role) {
        setRole(saved.role);
        setSession({ user: { email: saved.email, user_metadata: { full_name: saved.name || "Guest" } } });
      }
      setAuthReady(true);
      return () => { active = false; };
    }

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session || null);
      setAuthReady(true);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession || null);
      setAuthReady(true);
    });
    return () => { active = false; listener.subscription.unsubscribe(); };
  }, []);

  useEffect(() => {
    if (!authReady || !session) return;
    localStorage.setItem(ROLE_STORAGE_KEY, role);
    setLoading(true);
    setDemo(!supabase);
    if (supabase) bootstrap(); else loadDemo();
  }, [authReady, session?.user?.id, role]);

  useEffect(() => {
    if (!supabase || !restaurant || !session) return;
    const channel = supabase.channel("tastybite-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurant.id}` }, () => loadStaffData())
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" }, () => loadStaffData())
      .subscribe();
    return () => supabase.removeChannel(channel);
  }, [restaurant?.id, session?.user?.id]);

  function loadDemo() {
    setRestaurant({ id: "demo", name: "TastyBite" });
    setTables(demoTables);
    setMenu(demoMenu);
    setOrders(demoOrders);
    setLoading(false);
  }

  async function bootstrap() {
    try {
      const { data: r, error: re } = await supabase.from("restaurants").select("*").limit(1).single();
      if (re) throw re;
      setRestaurant(r);
      await (role === "customer" ? loadRestaurant(r) : loadStaffData(r));
    } catch (e) {
      setError(e.message);
      loadDemo();
      setDemo(true);
    } finally { setLoading(false); }
  }

  async function loadRestaurant(r = restaurant) {
    const [{ data: ts, error: te }, { data: ms, error: me }] = await Promise.all([
      supabase.from("restaurant_tables").select("*").eq("restaurant_id", r.id).order("table_number"),
      supabase.from("menu_items").select("*").eq("restaurant_id", r.id).eq("is_available", true).order("category").order("name")
    ]);
    if (te) throw te;
    if (me) throw me;
    setTables(ts || []);
    setMenu(ms || []);
  }

  async function loadStaffData(r = restaurant) {
    const [{ data: ts, error: te }, { data: ms, error: me }, { data: os, error: oe }] = await Promise.all([
      supabase.from("restaurant_tables").select("*").eq("restaurant_id", r.id).order("table_number"),
      supabase.from("menu_items").select("*").eq("restaurant_id", r.id).order("category").order("name"),
      supabase.from("orders").select("*, order_items(*)").eq("restaurant_id", r.id).order("created_at", { ascending: false }).limit(100)
    ]);
    if (te) throw te;
    if (me) throw me;
    if (oe) throw oe;
    setTables(ts || []);
    setMenu(ms || []);
    setOrders(os || []);
  }

  async function handleLogin({ email, password, selectedRole }) {
    setAuthBusy(true);
    setError("");
    try {
      if (supabase) {
        const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) throw authError;
        localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email: data.user?.email || email, role: selectedRole, name: data.user?.user_metadata?.full_name || roleLabels[selectedRole] }));
        setRole(selectedRole);
        setSession(data.session);
      } else {
        const demoUser = DEMO_USERS[selectedRole];
        if (!demoUser || email.trim().toLowerCase() !== demoUser.email || password !== demoUser.password) {
          throw new Error(`Demo login: use ${DEMO_USERS[selectedRole].email} / ${DEMO_USERS[selectedRole].password}`);
        }
        const saved = { email: demoUser.email, role: selectedRole, name: demoUser.name };
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(saved));
        localStorage.setItem(ROLE_STORAGE_KEY, selectedRole);
        setRole(selectedRole);
        setSession({ user: { email: demoUser.email, user_metadata: { full_name: demoUser.name } } });
      }
    } catch (e) {
      setError(e.message || "Login failed");
    } finally { setAuthBusy(false); }
  }

  async function logout() {
    setError("");
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem(ROLE_STORAGE_KEY);
    if (supabase) await supabase.auth.signOut();
    setSession(null);
    setRestaurant(null);
    setCart([]);
  }

  async function submitOrder() {
    if (!cart.length || !tables.length) return;
    const activeTableId = window.__tastybite_table || null;
    if (!activeTableId) return;
    if (demo) {
      const id = String(1030 + orders.length);
      setOrders(o => [{ id, table_id: activeTableId, status: "new", total: cart.reduce((s, x) => s + Number(x.price) * x.qty, 0), created_at: new Date().toISOString(), order_items: cart.map((x, i) => ({ id: `${id}-${i}`, item_name: x.name, quantity: x.qty })) }, ...o]);
      setCart([]);
      return;
    }
    const total = cart.reduce((s, x) => s + Number(x.price) * x.qty, 0);
    const { data: order, error: oe } = await supabase.from("orders").insert({ restaurant_id: restaurant.id, table_id: activeTableId, status: "new", subtotal: total, tax: 0, total }).select().single();
    if (oe) return setError(oe.message);
    const { error: ie } = await supabase.from("order_items").insert(cart.map(x => ({ order_id: order.id, menu_item_id: x.id, item_name: x.name, quantity: x.qty, unit_price: x.price, notes: "" })));
    if (ie) return setError(ie.message);
    await supabase.from("restaurant_tables").update({ status: "ordering" }).eq("id", activeTableId);
    setCart([]);
  }

  async function updateOrder(id, status) {
    if (demo) { setOrders(os => os.map(o => o.id === id ? { ...o, status } : o)); return; }
    const { error: e } = await supabase.from("orders").update({ status }).eq("id", id);
    if (e) setError(e.message); else loadStaffData();
  }

  async function updateTable(id, status) {
    if (demo) { setTables(ts => ts.map(t => t.id === id ? { ...t, status } : t)); return; }
    const { error: e } = await supabase.from("restaurant_tables").update({ status }).eq("id", id);
    if (e) setError(e.message); else loadStaffData();
  }

  if (!authReady) return <div className="loading-screen"><Logo/><span>Checking your TastyBite session…</span></div>;
  if (!session) return <Login role={role} onLogin={handleLogin} busy={authBusy} error={error} demo={!supabase} />;
  if (loading) return <div className="loading-screen"><Logo/><span>Loading your {roleLabels[role]} workspace…</span></div>;

  return <div className="app-shell">
    {error && <div className="error-toast">{error}</div>}
    {role === "customer" && <Customer menu={menu} tables={tables} tableId={initialTable} setTableId={id => { window.__tastybite_table = id; history.replaceState({}, "", `?role=customer&table=${id}`); }} cart={cart} setCart={setCart} submitOrder={submitOrder} onLogout={logout} user={session.user} orders={orders} staff={staff} reviews={reviews} addReview={addReview} />}
    {role === "waiter" && <Waiter tables={tables} orders={orders} updateOrder={updateOrder} updateTable={updateTable} onLogout={logout} />}
    {role === "kitchen" && <Kitchen orders={orders} tables={tables} updateOrder={updateOrder} onLogout={logout} />}
    {role === "admin" && <Admin orders={orders} tables={tables} menu={menu} onLogout={logout} staff={staff} setStaff={setStaff} reviews={reviews} />}
  </div>;
}

function Login({ role, onLogin, busy, error, demo }) {
  const validRoles = ["customer", "waiter", "kitchen", "admin"];
  const [selectedRole, setSelectedRole] = useState(validRoles.includes(role) ? role : "customer");
  const [email, setEmail] = useState(demo ? DEMO_USERS[selectedRole].email : "");
  const [password, setPassword] = useState(demo ? DEMO_USERS[selectedRole].password : "");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (!demo) return;
    setEmail(DEMO_USERS[selectedRole].email);
    setPassword(DEMO_USERS[selectedRole].password);
  }, [selectedRole, demo]);

  function submit(e) {
    e.preventDefault();
    onLogin({ email: email.trim(), password, selectedRole });
  }

  return <div className="login-page">
    <div className="login-brand-panel">
      <div className="login-brand-top"><Logo light /><span className="login-secure"><Icon name="check" size={14}/> Secure workspace</span></div>
      <div className="login-brand-copy">
        <span>FRESH · TASTY · ALWAYS</span>
        <h1>One login.<br/>Every TastyBite workspace.</h1>
        <p>Jump into the customer, waiter, kitchen or admin experience from one persistent account.</p>
      </div>
      <div className="login-food-strip">
        <span>🍕</span><span>🍔</span><span>🍝</span><span>🥗</span><span>🍰</span>
      </div>
    </div>
    <div className="login-card-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="login-card-head">
          <div><span className="login-eyebrow">TASTYBITE</span><h2>Welcome back</h2><p>Choose your workspace and sign in.</p></div>
          <div className="login-dot"><Icon name="lock" size={18}/></div>
        </div>
        <div className="role-grid">
          {validRoles.map(r => <button type="button" key={r} className={selectedRole === r ? "active" : ""} onClick={() => setSelectedRole(r)}><Icon name={r === "customer" ? "users" : r === "waiter" ? "orders" : r === "kitchen" ? "chef" : "settings"} size={17}/><span>{roleLabels[r]}</span></button>)}
        </div>
        <label className="field-label">Email address<input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" autoComplete="email" /></label>
        <label className="field-label">Password<div className="password-field"><input required type={showPassword ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete="current-password"/><button type="button" onClick={() => setShowPassword(v => !v)}>{showPassword ? "Hide" : "Show"}</button></div></label>
        {demo && <div className="demo-credentials"><strong>Demo account</strong><span>{DEMO_USERS[selectedRole].email}</span><span>{DEMO_USERS[selectedRole].password}</span><small>Demo login is stored on this device until you log out.</small></div>}
        {error && <div className="login-error">{error}</div>}
        <button className="login-submit" disabled={busy}>{busy ? "Signing in…" : `Sign in to ${roleLabels[selectedRole]}`}<Icon name="arrow" size={18}/></button>
        <div className="persistent-note"><Icon name="check" size={15}/><span>Stay signed in on this device. Your session is restored automatically on your next visit.</span></div>
      </form>
    </div>
  </div>;
}
function RoleSwitcher() { return null; }

function SideNav({ role = "admin", onLogout, active = 0, onNavigate }) {
  const items = role === "kitchen" ? [["home","Kitchen Dashboard"],["orders","New Orders"],["clock","In Progress"],["check","Ready"],["orders","Completed"],["history","Orders History"],["box","Kitchen Stations"],["settings","Settings"]]
    : role === "waiter" ? [["home","Tables & Orders"],["orders","Active Orders"],["box","Reservations"],["chart","Bills & Payments"],["settings","Settings"]]
    : [["home","Dashboard"],["orders","Orders"],["menu","Menu Management"],["box","Inventory"],["box","Purchases"],["box","Suppliers"],["box","Expenses"],["users","Staff Management"],["box","Tables"],["star","Customer Reviews"],["chart","Reports"],["settings","Settings"]];
  const profileName = role === "kitchen" ? "Chef Arif" : role === "waiter" ? "Riya" : "Admin";
  const profileTitle = role === "kitchen" ? "Head Chef" : role === "waiter" ? "Front of House" : "System Administrator";
  return <aside className="side-nav"><Logo light={role === "kitchen"}/><div className="side-items">{items.map(([icon,label], i) => <button type="button" key={label+i} className={i===active ? "active" : ""} onClick={() => onNavigate && onNavigate(i)}><Icon name={icon === "history" ? "clock" : icon}/><span>{label}</span>{label === "Orders" && <b className="badge">5</b>}</button>)}</div><div className="side-bottom"><div className="profile-mini"><div className="avatar">{profileName.slice(0,1)}</div><div><b>{profileName}</b><span>{profileTitle}</span></div><Icon name="arrow" size={16}/></div><button type="button" onClick={onLogout}><Icon name="logout"/> <span>Log out</span></button></div></aside>;
}

function Placeholder({ title }) {
  return <div className="placeholder-panel"><h2>{title}</h2><p>This section is coming soon.</p></div>;
}

function TopBar({ title, subtitle, dark = false }) { return <header className={`topbar ${dark ? "dark" : ""}`}><div className="mobile-brand"><Logo light={dark}/></div><div className="search"><Icon name="search"/><input placeholder="Search orders, menu items, customers..."/></div><div className="top-actions"><button className="icon-btn"><Icon name="sun"/></button><button className="icon-btn"><Icon name="moon"/></button><button className="icon-btn notification"><Icon name="bell"/><b>5</b></button><div className="top-profile"><div className="avatar">A</div><div><strong>{title || "Admin"}</strong><span>{subtitle || "System Administrator"}</span></div></div></div></header>; }

function Customer({ menu, tables, tableId, setTableId, cart, setCart, submitOrder, onLogout, user, orders = [], staff = [], reviews = [], addReview }) {
  const [section, setSection] = useState(0);
  const [reviewTarget, setReviewTarget] = useState("restaurant");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState("");
  const myReviews = reviews.filter(r => r.email === user?.email);
  const submitReview = () => {
    if (!addReview) return;
    addReview({ email: user?.email || "guest", name: user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest", target: reviewTarget, rating: reviewRating, text: reviewText });
    setReviewText(""); setReviewRating(5); setReviewTarget("restaurant");
  };
  const [cat, setCat] = useState("All"); const [search, setSearch] = useState(""); const [currentTable, setCurrentTable] = useState(tableId || window.__tastybite_table || "");
  const cats = ["All", ...new Set(menu.map(x => x.category))];
  const visible = menu.filter(x => (cat === "All" || x.category === cat) && x.name.toLowerCase().includes(search.toLowerCase()));
  const total = cart.reduce((s,x)=>s+Number(x.price)*x.qty,0);
  const add = item => setCart(prev => { const f=prev.find(x=>x.id===item.id); return f ? prev.map(x=>x.id===item.id?{...x,qty:x.qty+1}:x) : [...prev,{...item,qty:1}]; });
  const remove = id => setCart(prev => prev.flatMap(x=>x.id===id?(x.qty>1?[{...x,qty:x.qty-1}]:[]):[x]));
  return <div className="customer-page"><aside className="customer-side"><Logo/><div className="customer-nav">{[["home","Home"],["menu","Menu"],["orders","Orders"],["clock","History"],["star","Reviews"]].map(([i,l],n)=><button type="button" className={n===section?"active":""} key={l} onClick={()=>setSection(n)}><Icon name={i}/><span>{l}</span></button>)}</div><button className="settings-link"><Icon name="settings"/>Settings</button></aside><div className="customer-main"><header className="customer-top"><div className="mobile-brand"><Logo/></div><div className="customer-search"><Icon name="search"/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search for food, drinks..."/></div><div className="table-select"><Icon name="box"/><select value={currentTable} onChange={e=>{setCurrentTable(e.target.value); setTableId(e.target.value); window.__tastybite_table=e.target.value; history.replaceState({},"",`?role=customer&table=${e.target.value}`)}}><option value="">Table</option>{tables.map(t=><option key={t.id} value={t.id}>Table {t.table_number}</option>)}</select></div><div className="hello"><div className="avatar light-avatar">{(user?.user_metadata?.full_name || user?.email || "G").slice(0,1).toUpperCase()}</div><span>Hello,<b>{user?.user_metadata?.full_name || user?.email?.split("@")[0] || "Guest"}</b></span></div><button className="customer-logout" type="button" onClick={onLogout} title="Log out"><Icon name="logout" size={16}/></button></header><main className="customer-content">{section === 2 ? <><section className="section-heading"><h2>Your Orders</h2></section><div className="order-list-panel">{orders.length === 0 ? <p className="empty-note">No orders yet.</p> : orders.map(o=><div className="order-row" key={o.id}><div><b>Order #{o.id}</b><span>{o.table_id==="takeaway"?"Takeaway":`Table ${tables.find(t=>t.id===o.table_id)?.table_number||o.table_id}`} · {new Date(o.created_at).toLocaleString([], {hour:'2-digit',minute:'2-digit', month:'short', day:'numeric'})}</span></div><span className={`pill ${o.status}`}>{o.status}</span><strong>{money(o.total)}</strong></div>)}</div></> : section === 3 ? <><section className="section-heading"><h2>Order History</h2></section><div className="order-list-panel">{orders.filter(o=>['completed','served'].includes(o.status)).length === 0 ? <p className="empty-note">No past orders yet.</p> : orders.filter(o=>['completed','served'].includes(o.status)).map(o=><div className="order-row" key={o.id}><div><b>Order #{o.id}</b><span>{o.table_id==="takeaway"?"Takeaway":`Table ${tables.find(t=>t.id===o.table_id)?.table_number||o.table_id}`} · {new Date(o.created_at).toLocaleString([], {hour:'2-digit',minute:'2-digit', month:'short', day:'numeric'})}</span></div><span className={`pill ${o.status}`}>{o.status}</span><strong>{money(o.total)}</strong></div>)}</div></> : section === 4 ? <><section className="section-heading"><h2>Rate Your Experience</h2></section><div className="review-form"><label>What are you rating?</label><select value={reviewTarget} onChange={e=>setReviewTarget(e.target.value)}><option value="restaurant">The Restaurant</option>{staff.map(s=><option key={s.id} value={s.id}>{s.name} ({s.role})</option>)}</select><label>Rating</label><div className="star-input">{[1,2,3,4,5].map(n=><button type="button" key={n} className={n<=reviewRating?"filled":""} onClick={()=>setReviewRating(n)}><Icon name="star" size={26}/></button>)}</div><label>Share your experience</label><textarea value={reviewText} onChange={e=>setReviewText(e.target.value)} placeholder="Tell us how it went..." rows={4}/><button className="checkout" onClick={submitReview} disabled={!reviewText.trim()}>Submit Review</button></div><section className="section-heading"><h2>Your Past Reviews</h2></section><div className="review-list">{myReviews.length===0?<p className="empty-note">You haven't left a review yet.</p>:myReviews.map(r=><div className="review-row" key={r.id}><div className="review-row-head"><span>{r.target==="restaurant"?"The Restaurant":staff.find(s=>s.id===r.target)?.name || "Staff"}</span><span className="stars">{"★".repeat(r.rating)}{"☆".repeat(5-r.rating)}</span></div><p>{r.text}</p></div>)}</div></> : <><section className="hero-food"><div><small>FRESH · TASTY · ALWAYS</small><h1>Delicious Food<br/>For Every <em>Mood</em></h1><p>Explore our menu and find your favorite dish.</p><button>View Menu <Icon name="arrow" size={17}/></button></div><div className="hero-food-img"/></section><section className="section-heading"><h2>Popular Categories</h2><button>See All <Icon name="arrow" size={15}/></button></section><div className="category-row">{cats.slice(0,7).map((c,i)=><button key={c} className={cat===c?"selected":""} onClick={()=>setCat(c)}><span>{["▦","🍔","🍕","🍝","🥗","🥤","🍰"][i] || "🍽️"}</span><b>{c}</b></button>)}</div><section className="section-heading"><h2>Our Special Dishes</h2></section><div className="customer-grid">{visible.map((item,i)=><article className="dish-card" key={item.id}><div className="dish-image" style={{backgroundImage:`url(${foodImages[item.name] || "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=600&q=80"})`}}><span>{i%3===1?"Best Seller":i===0?"Popular":""}</span><button className="heart">♡</button></div><div className="dish-body"><h3>{item.name}</h3><p>{item.description}</p><div><strong>{money(item.price)}</strong><button onClick={()=>add(item)}>Add +</button></div></div></article>)}</div></>}</main><aside className="cart-panel"><div className="cart-title"><h2>Your Cart</h2><button onClick={()=>setCart([])}>⌫</button></div>{cart.length===0?<div className="empty-cart"><div>🛒</div><h3>Your cart is empty</h3><p>Add some delicious items<br/>from our menu</p><button>Browse Menu</button></div>:<><div className="cart-items">{cart.map(x=><div className="cart-item" key={x.id}><img src={foodImages[x.name]||"https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=120&q=70"}/><div><b>{x.name}</b><span>{money(x.price)}</span><div className="qty"><button onClick={()=>remove(x.id)}>−</button><span>{x.qty}</span><button onClick={()=>add(x)}>+</button></div></div></div>)}</div><div className="cart-total"><span>Total</span><strong>{money(total)}</strong></div><button className="checkout" disabled={!currentTable} onClick={() => { window.__tastybite_table = currentTable; submitOrder(); }}>{currentTable?"Send Order":"Select a table"}</button></>}</aside><nav className="mobile-bottom">{[["home","Home"],["menu","Menu"],["orders","Orders"],["clock","History"],["star","Reviews"]].map(([i,l],n)=><button type="button" className={n===section?"active":""} key={l} onClick={()=>setSection(n)}><Icon name={i}/><span>{l}</span></button>)}</nav></div></div>;
}

function Kitchen({ orders, tables, updateOrder, onLogout }) {
  const [section, setSection] = useState(0);
  const allColumns = [{ key:"new", title:"New Orders", color:"red" },{key:"preparing",title:"Preparing",color:"orange"},{key:"ready",title:"Ready",color:"blue"},{key:"completed",title:"Completed",color:"green"}];
  // Sidebar sections map to a single column filter; index 0 (Dashboard) and 5-7 show everything or a placeholder.
  const sectionColumnKey = { 1: "new", 2: "preparing", 3: "ready", 4: "completed" }[section];
  const columns = sectionColumnKey ? allColumns.filter(c => c.key === sectionColumnKey) : allColumns;
  const tableName = id => id === "takeaway" ? "Takeaway" : `Table ${tables.find(t=>t.id===id)?.table_number || id}`;
  const [selected, setSelected] = useState(orders[0] || null);
  useEffect(()=>{ if(selected){ const fresh=orders.find(o=>o.id===selected.id); if(fresh)setSelected(fresh); } },[orders]);
  const showBoard = section === 0 || sectionColumnKey;
  return <div className="staff-page kitchen-page"><SideNav role="kitchen" onLogout={onLogout} active={section} onNavigate={setSection}/><div className="staff-main"><TopBar title="Chef Arif" subtitle="Head Chef" dark/><div className="staff-heading"><div><h1>Kitchen Dashboard</h1><p>Manage orders and keep the kitchen running smoothly</p></div><div className="date-actions"><button><Icon name="calendar"/>Today<br/><small>Apr 26, 2025</small></button><button><Icon name="clock"/>02:34 PM</button></div></div>{showBoard ? <><div className="kpi-row kitchen-kpis">{[["orders","All Orders",orders.length,"blue"],["chef","Grill Station",3,"red"],["menu","Pasta Station",2,"orange"],["menu","Salad Station",2,"green"],["menu","Dessert Station",1,"purple"]].map(([i,l,v,c])=><div className={`kpi ${c}`} key={l}><div className="kpi-icon"><Icon name={i}/></div><div><span>{l}</span><strong>{v}</strong></div></div>)}</div><div className="kanban-wrap"><div className="kanban">{columns.map(col=><section className={`kanban-col ${col.color}`} key={col.key}><div className="kanban-title"><h2>{col.title}</h2><b>{orders.filter(o=>o.status===col.key).length}</b><button>View All →</button></div>{orders.filter(o=>o.status===col.key).map(o=><OrderCard key={o.id} order={o} tableName={tableName} onSelect={setSelected} selected={selected?.id===o.id} updateOrder={updateOrder}/>)}</section>)}</div><OrderDetails order={selected} tableName={tableName} updateOrder={updateOrder}/></div></> : <Placeholder title={["","New Orders","In Progress","Ready","Completed","Orders History","Kitchen Stations","Settings"][section] || "Coming soon"}/>}<div className="kitchen-footer"><span><i/> Kitchen Online</span><small>Orders will update in real-time</small><div>Quick Actions: <b>🔥 Grill</b><b>🍝 Pasta</b><b>🥗 Salad</b><b>🍰 Dessert</b></div></div></div></div>;
}
function OrderCard({order,tableName,onSelect,selected,updateOrder}) { const next={new:["Accept","preparing"],preparing:["Mark Ready","ready"],ready:["Notify Waiter","ready"],completed:["Completed","completed"]}[order.status]; return <article className={`order-card ${selected?"selected":""}`} onClick={()=>onSelect(order)}><div className="order-head"><b>#{order.id}</b><span>{new Date(order.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</span><em>{order.status.toUpperCase()}</em></div><div className="order-meta"><span>▱ {tableName(order.table_id)}</span><span>♙ {order.order_items?.reduce((s,x)=>s+x.quantity,0)||1}</span></div><ul>{(order.order_items||[]).map(i=><li key={i.id}>{i.item_name} (x{i.quantity})</li>)}</ul><div className="chef-line"><div className="avatar">C</div><span>Chef</span>{order.status==="preparing"&&<div className="progress"><i style={{width:`${order.id%3===0?50:order.id%2===0?60:30}%`}}/></div>}</div><button className="order-action" onClick={e=>{e.stopPropagation();if(next[1]!=="ready"||order.status!=="ready")updateOrder(order.id,next[1]);}}>{next[0]}</button></article> }
function OrderDetails({order,tableName,updateOrder}) { if(!order)return <aside className="order-details"><h2>Order Details</h2><p>No orders yet.</p></aside>; return <aside className="order-details"><div className="detail-head"><h2>Order Details</h2><button><Icon name="close"/></button></div><div className="detail-id"><b>#{order.id}</b><em>{order.status.toUpperCase()}</em><span>{tableName(order.table_id)}</span></div><div className="detail-time"><Icon name="clock" size={15}/> {new Date(order.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}<span>2 Guests</span></div><h3>Items</h3>{(order.order_items||[]).map((x,i)=><div className="detail-item" key={x.id}><img src={foodImages[x.item_name]||foodImages["Margherita Pizza"]}/><div><b>{x.item_name}</b><span>x{x.quantity}</span></div><strong>{money(i===0?12.99:7.99)}</strong></div>)}<div className="special"><b>▣ Special Instructions</b><p>Extra cheese on pizza, no onions in salad.</p></div><div className="summary"><div><span>Subtotal</span><b>{money(order.total)}</b></div><div><span>Tax (8%)</span><b>{money(Number(order.total)*.08)}</b></div><div className="total"><span>Total</span><strong>{money(Number(order.total)*1.08)}</strong></div></div><textarea placeholder="Add notes for kitchen..."></textarea><button className="accept-detail" onClick={()=>updateOrder(order.id,order.status==="new"?"preparing":"ready")}>✓ {order.status==="new"?"Accept Order":"Update Order"}</button>{order.status==="new"&&<button className="reject-detail">× Reject Order</button>}</aside> }

function Admin({orders,tables,menu,onLogout,staff=[],setStaff,reviews=[]}) {
  const [newStaff, setNewStaff] = useState({ name: "", role: "", salary: "", hours: "", days: "" });
  const addStaffMember = () => {
    if (!newStaff.name.trim() || !setStaff) return;
    setStaff(prev => [...prev, { id: `s${Date.now()}`, ...newStaff, salary: Number(newStaff.salary) || 0 }]);
    setNewStaff({ name: "", role: "", salary: "", hours: "", days: "" });
  };
  const removeStaffMember = (id) => setStaff && setStaff(prev => prev.filter(s => s.id !== id));
  const avgRating = (targetId) => { const rs = reviews.filter(r => r.target === targetId); return rs.length ? (rs.reduce((a,r)=>a+r.rating,0)/rs.length).toFixed(1) : "—"; };
  const [section, setSection] = useState(0);
  const sales=2486.32, completed=orders.filter(o=>["completed","served"].includes(o.status));
  const top=[{name:"Margherita Pizza",cat:"Pizza",qty:18,rev:223.82},{name:"Chicken Biryani",cat:"Biryani",qty:12,rev:179.88},{name:"Caesar Salad",cat:"Salads",qty:10,rev:99.90},{name:"Burger",cat:"Burgers",qty:9,rev:89.91},{name:"Pasta Alfredo",cat:"Pasta",qty:8,rev:79.92}];
  const adminSections = {1:"Orders",2:"Menu Management",3:"Inventory",4:"Purchases",5:"Suppliers",6:"Expenses",10:"Reports",11:"Settings"};
  return <div className="staff-page admin-page"><SideNav onLogout={onLogout} active={section} onNavigate={setSection}/><div className="staff-main"><TopBar/>{section === 1 ? <div className="section-panel"><div className="staff-heading"><div><h1>Orders</h1><p>All orders across the restaurant.</p></div></div><section className="panel recent-panel full-panel"><table><thead><tr><th>#</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr></thead><tbody>{orders.map(o=><tr key={o.id}><td>#{o.id}</td><td>{o.table_id==="takeaway"?"Takeaway":`Table ${tables.find(t=>t.id===o.table_id)?.table_number||o.table_id}`}</td><td>{o.order_items?.length||2} items</td><td>{money(o.total)}</td><td><span className={`pill ${o.status}`}>{o.status}</span></td><td>{new Date(o.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td></tr>)}</tbody></table></section></div> : section === 2 ? <div className="section-panel"><div className="staff-heading"><div><h1>Menu Management</h1><p>Every dish currently on the menu.</p></div></div><section className="panel recent-panel full-panel"><table><thead><tr><th>Item</th><th>Category</th><th>Price</th><th>Description</th></tr></thead><tbody>{menu.map(m=><tr key={m.id}><td>{m.name}</td><td>{m.category}</td><td>{money(m.price)}</td><td>{m.description}</td></tr>)}</tbody></table></section></div> : section === 7 ? <div className="section-panel"><div className="staff-heading"><div><h1>Staff Management</h1><p>Salaries and working hours for your team.</p></div></div><section className="panel recent-panel full-panel"><table><thead><tr><th>Name</th><th>Role</th><th>Salary/mo</th><th>Working Hours</th><th>Days</th><th>Rating</th><th></th></tr></thead><tbody>{staff.map(s=><tr key={s.id}><td>{s.name}</td><td>{s.role}</td><td>{money(s.salary)}</td><td>{s.hours}</td><td>{s.days}</td><td>{avgRating(s.id)} ★</td><td><button onClick={()=>removeStaffMember(s.id)} className="row-remove">Remove</button></td></tr>)}</tbody></table></section><section className="panel add-staff-panel"><PanelHead title="Add Staff Member"/><div className="add-staff-form"><input placeholder="Name" value={newStaff.name} onChange={e=>setNewStaff({...newStaff,name:e.target.value})}/><input placeholder="Role (e.g. Waiter)" value={newStaff.role} onChange={e=>setNewStaff({...newStaff,role:e.target.value})}/><input placeholder="Monthly Salary" type="number" value={newStaff.salary} onChange={e=>setNewStaff({...newStaff,salary:e.target.value})}/><input placeholder="Working Hours (e.g. 9:00 AM - 6:00 PM)" value={newStaff.hours} onChange={e=>setNewStaff({...newStaff,hours:e.target.value})}/><input placeholder="Days (e.g. Mon-Sat)" value={newStaff.days} onChange={e=>setNewStaff({...newStaff,days:e.target.value})}/><button onClick={addStaffMember}>Add Staff</button></div></section></div> : section === 9 ? <div className="section-panel"><div className="staff-heading"><div><h1>Customer Reviews</h1><p>Ratings and feedback from customers, for the restaurant and for staff.</p></div></div><div className="kpi-row admin-kpis" style={{gridTemplateColumns:"repeat(3,1fr)"}}><div className="admin-kpi green"><div className="kpi-icon"><Icon name="star"/></div><span>Restaurant Rating</span><strong>{avgRating("restaurant")} ★</strong></div><div className="admin-kpi blue"><div className="kpi-icon"><Icon name="users"/></div><span>Total Reviews</span><strong>{reviews.length}</strong></div><div className="admin-kpi purple"><div className="kpi-icon"><Icon name="chart"/></div><span>Staff Reviewed</span><strong>{new Set(reviews.filter(r=>r.target!=="restaurant").map(r=>r.target)).size}</strong></div></div><section className="panel recent-panel full-panel"><table><thead><tr><th>Customer</th><th>Rated</th><th>Rating</th><th>Comment</th><th>Date</th></tr></thead><tbody>{reviews.length===0?<tr><td colSpan="5">No reviews yet.</td></tr>:reviews.map(r=><tr key={r.id}><td>{r.name}</td><td>{r.target==="restaurant"?"Restaurant":staff.find(s=>s.id===r.target)?.name||"Staff"}</td><td>{"★".repeat(r.rating)}</td><td>{r.text}</td><td>{new Date(r.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></section></div> : section === 8 ? <div className="section-panel"><div className="staff-heading"><div><h1>Tables</h1><p>Live status of every table.</p></div></div><div className="table-grid">{tables.map(t=><div className="table-card" key={t.id}><div className="table-card-head"><span>Table {t.table_number}</span><em className={t.status}>{t.status}</em></div></div>)}</div></div> : section !== 0 ? <Placeholder title={adminSections[section] || "Coming soon"}/> : <><div className="admin-heading"><div><h1>Good Morning, Admin!</h1><p>Here's what's happening at your restaurant today.</p></div><div className="date-actions"><button><Icon name="calendar"/><span>Apr 26, 2025</span><small>Saturday</small></button><button>Today⌄</button><button>Main Branch⌄</button></div></div><div className="kpi-row admin-kpis">{[["$","Total Sales",money(sales),"12%","green"],["orders","Total Orders",orders.length||42,"8%","red"],["users","Total Customers",38,"10%","purple"],["chart","Average Order Value",money(59.20),"6%","orange"],["chart","Net Profit",money(1248.50),"14%","blue"]].map(([i,l,v,p,c])=><div className={`admin-kpi ${c}`} key={l}><div className="kpi-icon"><Icon name={i}/></div><span>{l}</span><strong>{v}</strong><small>↑ {p} <i>vs yesterday</i></small></div>)}</div><div className="dashboard-grid"><section className="panel sales-panel"><PanelHead title="Sales Overview" right="Last 7 Days⌄"/><div className="chart"><div className="y-labels"><span>$4,000</span><span>$3,000</span><span>$2,000</span><span>$1,000</span><span>$0</span></div><svg viewBox="0 0 700 220" preserveAspectRatio="none"><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stopOpacity=".22"/><stop offset="1" stopOpacity="0"/></linearGradient></defs><path d="M25 170 L125 145 L225 160 L325 135 L425 150 L525 115 L625 130 L680 80 L680 210 L25 210 Z" fill="url(#fill)"/><polyline points="25,170 125,145 225,160 325,135 425,150 525,115 625,130 680,80" fill="none" stroke="currentColor" strokeWidth="3"/><polyline points="25,195 125,175 225,190 325,175 425,185 525,165 625,170 680,145" fill="none" stroke="currentColor" strokeOpacity=".35" strokeWidth="2"/>{[25,125,225,325,425,525,625,680].map((x,i)=><circle key={x} cx={x} cy={i===7?80:[170,145,160,135,150,115,130][i]} r="4" fill="currentColor"/>)}</svg><div className="x-labels"><span>Apr 20</span><span>Apr 21</span><span>Apr 22</span><span>Apr 23</span><span>Apr 24</span><span>Apr 25</span><span>Apr 26</span></div></div></section><section className="panel category-panel"><PanelHead title="Sales by Category"/><div className="donut"><div><strong>{money(sales)}</strong><span>Total Sales</span></div></div><div className="legend">{[["Pizza","28%"],["Burgers","22%"],["Pasta","18%"],["Salads","12%"],["Drinks","8%"],["Desserts","7%"],["Others","5%"]].map((x,i)=><span key={x[0]}><i className={`dot d${i}`}/>{x[0]}<b>{x[1]}</b></span>)}</div></section><section className="panel recent-panel"><PanelHead title="Recent Orders" right="View All →"/><table><thead><tr><th>#</th><th>Table</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr></thead><tbody>{orders.slice(0,5).map(o=><tr key={o.id}><td>#{o.id}</td><td>{o.table_id==="takeaway"?"Takeaway":`Table ${tables.find(t=>t.id===o.table_id)?.table_number||o.table_id}`}</td><td>{o.order_items?.length||2} items</td><td>{money(o.total)}</td><td><span className={`pill ${o.status}`}>{o.status}</span></td><td>{new Date(o.created_at).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'})}</td></tr>)}</tbody></table></section><section className="panel inventory-panel"><PanelHead title="Inventory Alerts" right="View All →"/><table><thead><tr><th>Item</th><th>Current Stock</th><th>Status</th></tr></thead><tbody>{[["🍅","Tomatoes","2 kg","Low"],["🧀","Cheese","1 kg","Low"],["🍗","Chicken Breast","1.5 kg","Low"],["🥬","Lettuce","3 kg","OK"],["🫒","Olive Oil","1 bottle","Low"]].map(x=><tr key={x[1]}><td>{x[0]} &nbsp;{x[1]}</td><td>{x[2]}</td><td><span className={`pill ${x[3]==="OK"?"ok":"low"}`}>{x[3]}</span></td></tr>)}</tbody></table></section><section className="panel top-items"><PanelHead title="Top Selling Items" right="View All →"/><table><thead><tr><th>#</th><th>Item</th><th>Category</th><th>Quantity</th><th>Revenue</th></tr></thead><tbody>{top.map((x,i)=><tr key={x.name}><td>{i+1}</td><td><span className="food-thumb" style={{backgroundImage:`url(${foodImages[x.name]||foodImages["Margherita Pizza"]})`}}/>{x.name}</td><td>{x.cat}</td><td>{x.qty}</td><td>{money(x.rev)}</td></tr>)}</tbody></table></section><section className="panel payment-panel"><PanelHead title="Sales by Payment Method"/><div className="payment-wrap"><div className="payment-donut"><strong>{money(sales)}</strong><span>Total Sales</span></div><div className="legend">{[["Cash","32%"],["Card","48%"],["UPI","15%"],["Online","5%"]].map((x,i)=><span key={x[0]}><i className={`dot p${i}`}/>{x[0]}<b>{x[1]}</b></span>)}</div></div></section><section className="panel quick-panel"><PanelHead title="Quick Actions"/><div className="quick-actions"><button><Icon name="plus"/><span>Add Menu Item</span></button><button><Icon name="box"/><span>Manage Inventory</span></button><button><Icon name="chart"/><span>View Reports</span></button><button><Icon name="users"/><span>Add Staff</span></button></div></section></div><div className="quick-stats"><div><span>Today's Revenue</span><strong>{money(sales)}</strong><small>↑ 12%</small></div><div><span>Total Orders</span><strong>42</strong><small>↑ 8%</small></div><div><span>Avg. Order Value</span><strong>{money(59.2)}</strong><small>↑ 6%</small></div><div><span>Active Tables</span><strong>6 / 8</strong><small>75% Occupied</small></div></div></>}</div></div>;
}
function PanelHead({title,right}){return <div className="panel-head"><h2>{title}</h2>{right&&<button>{right}</button>}</div>}

function Waiter({tables,orders,updateOrder,updateTable,onLogout}) {
  const [section, setSection] = useState(0);
  const waiterSections = {1:"Active Orders",2:"Reservations",3:"Bills & Payments",4:"Settings"};
  return <div className="staff-page waiter-page"><SideNav role="waiter" onLogout={onLogout} active={section} onNavigate={setSection}/><div className="staff-main"><TopBar title="Riya" subtitle="Front of House"/>{section === 1 ? <div className="section-panel"><div className="staff-heading"><div><h1>Active Orders</h1><p>Every order that isn't finished yet.</p></div></div><section className="panel recent-panel full-panel"><table><thead><tr><th>#</th><th>Table</th><th>Status</th><th>Total</th></tr></thead><tbody>{orders.filter(o=>!['completed','cancelled'].includes(o.status)).map(o=><tr key={o.id}><td>#{o.id}</td><td>{o.table_id==="takeaway"?"Takeaway":`Table ${tables.find(t=>t.id===o.table_id)?.table_number||o.table_id}`}</td><td><span className={`pill ${o.status}`}>{o.status}</span></td><td>{money(o.total)}</td></tr>)}</tbody></table></section></div> : section !== 0 ? <Placeholder title={waiterSections[section] || "Coming soon"}/> : <><div className="staff-heading"><div><h1>Tables & Orders</h1><p>Live table and order control.</p></div></div><div className="table-grid">{tables.map(t=>{const o=orders.find(x=>x.table_id===t.id&&!['completed','cancelled'].includes(x.status));return <div className="table-card" key={t.id}><div className="table-card-head"><span>Table {t.table_number}</span><em className={t.status}>{t.status}</em></div>{o?<><h3>Order #{o.id}</h3><p>{o.status} · {money(o.total)}</p>{o.status==='ready'&&<button onClick={()=>updateOrder(o.id,'served')}>Serve Order</button>}{o.status==='served'&&<button onClick={()=>{updateOrder(o.id,'completed');updateTable(t.id,'cleaning')}}>Close & Clean</button>}</>:<button onClick={()=>updateTable(t.id,'occupied')}>Open Table</button>}{t.status==='cleaning'&&<button onClick={()=>updateTable(t.id,'available')}>Mark Available</button>}</div>})}</div></>}</div></div>;
}

createRoot(document.getElementById("root")).render(<App/>);
