import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { createClient } from "@supabase/supabase-js";
import "./styles.css";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

const money = n => `₹${Number(n || 0).toFixed(2)}`;
const params = new URLSearchParams(location.search);
const initialRole = params.get("role") || "customer";
const initialTable = params.get("table");

function App() {
  const [role, setRole] = useState(initialRole);
  const [tableId, setTableId] = useState(initialTable);
  const [restaurant, setRestaurant] = useState(null);
  const [tables, setTables] = useState([]);
  const [menu, setMenu] = useState([]);
  const [orders, setOrders] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      setError("Supabase is not configured. Copy .env.example to .env.local and add your project URL and anon key.");
      return;
    }
    bootstrap();
  }, []);

  async function bootstrap() {
    try {
      const { data: auth } = await supabase.auth.getSession();
      setSession(auth.session);

      if (role === "customer") {
        await loadRestaurant();
      } else {
        await loadStaffData();
      }

      const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next?.session || null));
      return () => listener.subscription.unsubscribe();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function loadRestaurant() {
    const { data: r, error: re } = await supabase.from("restaurants").select("*").limit(1).single();
    if (re) throw re;
    setRestaurant(r);

    const [{ data: ts, error: te }, { data: ms, error: me }] = await Promise.all([
      supabase.from("restaurant_tables").select("*").eq("restaurant_id", r.id).order("table_number"),
      supabase.from("menu_items").select("*").eq("restaurant_id", r.id).eq("is_available", true).order("category").order("name")
    ]);
    if (te) throw te;
    if (me) throw me;
    setTables(ts || []);
    setMenu(ms || []);
  }

  async function loadStaffData() {
    const { data: r, error: re } = await supabase.from("restaurants").select("*").limit(1).single();
    if (re) throw re;
    setRestaurant(r);

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

  useEffect(() => {
    if (!supabase || !restaurant) return;

    const channel = supabase
      .channel("tastybite-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders", filter: `restaurant_id=eq.${restaurant.id}` },
        () => loadStaffData().catch(e => setError(e.message)))
      .on("postgres_changes", { event: "*", schema: "public", table: "order_items" },
        () => loadStaffData().catch(e => setError(e.message)))
      .on("postgres_changes", { event: "*", schema: "public", table: "restaurant_tables", filter: `restaurant_id=eq.${restaurant.id}` },
        () => loadStaffData().catch(e => setError(e.message)))
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [restaurant?.id]);

  async function submitOrder() {
    if (!restaurant || !tableId || !cart.length) return;
    const total = cart.reduce((s, x) => s + Number(x.price) * x.qty, 0);

    const { data: order, error: oe } = await supabase.from("orders").insert({
      restaurant_id: restaurant.id,
      table_id: tableId,
      status: "new",
      subtotal: total,
      tax: 0,
      total
    }).select().single();
    if (oe) return setError(oe.message);

    const items = cart.map(x => ({
      order_id: order.id,
      menu_item_id: x.id,
      item_name: x.name,
      quantity: x.qty,
      unit_price: x.price,
      notes: ""
    }));
    const { error: ie } = await supabase.from("order_items").insert(items);
    if (ie) return setError(ie.message);

    await supabase.from("restaurant_tables").update({ status: "ordering" }).eq("id", tableId);
    setCart([]);
    setError("");
    alert(`Order #${String(order.id).slice(0, 8)} sent to the kitchen.`);
  }

  async function updateOrder(id, status) {
    const { error: e } = await supabase.from("orders").update({ status }).eq("id", id);
    if (e) setError(e.message);
    else await loadStaffData();
  }

  async function updateTable(id, status) {
    const { error: e } = await supabase.from("restaurant_tables").update({ status }).eq("id", id);
    if (e) setError(e.message);
    else await loadStaffData();
  }

  if (loading) return <div className="center">Connecting to TastyBite…</div>;

  if (error && !supabase) return <div className="center"><div className="error">{error}</div></div>;

  return (
    <div className="app">
      <header>
        <div className="brand">🍴 TastyBite <span>{role.toUpperCase()}</span></div>
        <nav>
          {["customer", "waiter", "kitchen", "admin"].map(r =>
            <button key={r} onClick={() => { setRole(r); history.replaceState({}, "", `?role=${r}${r === "customer" && tableId ? `&table=${tableId}` : ""}`); }}>
              {r}
            </button>
          )}
        </nav>
      </header>

      {error && <div className="error banner">{error}</div>}

      {role === "customer" &&
        <Customer menu={menu} tables={tables} tableId={tableId} setTableId={setTableId} cart={cart} setCart={setCart} submitOrder={submitOrder} />}
      {role === "waiter" &&
        <Waiter tables={tables} orders={orders} updateOrder={updateOrder} updateTable={updateTable} />}
      {role === "kitchen" &&
        <Kitchen orders={orders} updateOrder={updateOrder} />}
      {role === "admin" &&
        <Admin orders={orders} tables={tables} menu={menu} />}
    </div>
  );
}

function Customer({menu, tables, tableId, setTableId, cart, setCart, submitOrder}) {
  const [cat, setCat] = useState("All");
  const cats = ["All", ...new Set(menu.map(x => x.category))];
  const visible = menu.filter(x => cat === "All" || x.category === cat);
  const total = cart.reduce((s, x) => s + Number(x.price) * x.qty, 0);

  const add = item => setCart(prev => {
    const found = prev.find(x => x.id === item.id);
    return found ? prev.map(x => x.id === item.id ? {...x, qty: x.qty + 1} : x) : [...prev, {...item, qty: 1}];
  });
  const remove = id => setCart(prev => prev.flatMap(x => x.id === id ? (x.qty > 1 ? [{...x, qty:x.qty-1}] : []) : [x]));

  return <main>
    <section className="hero">
      <h1>What would you like to eat?</h1>
      {!tableId
        ? <select value="" onChange={e => { setTableId(e.target.value); history.replaceState({}, "", `?role=customer&table=${e.target.value}`); }}>
            <option value="">Select your table</option>
            {tables.map(t => <option key={t.id} value={t.id}>Table {t.table_number}</option>)}
          </select>
        : <div className="table-pill">Table {tables.find(t => t.id === tableId)?.table_number || tableId}</div>}
    </section>

    <div className="chips">{cats.map(c => <button className={cat === c ? "active" : ""} key={c} onClick={() => setCat(c)}>{c}</button>)}</div>

    <div className="menu">
      {visible.map(item => <article className="menu-card" key={item.id}>
        <div className="food">{item.emoji || "🍽️"}</div>
        <div className="grow"><h3>{item.name}</h3><p>{item.description || ""}</p><b>{money(item.price)}</b></div>
        <button className="add" onClick={() => add(item)}>Add</button>
      </article>)}
    </div>

    {cart.length > 0 && <div className="cart">
      <div><small>{cart.reduce((s,x)=>s+x.qty,0)} items</small><strong>{money(total)}</strong></div>
      <button onClick={submitOrder} disabled={!tableId}>Send to kitchen</button>
    </div>}
  </main>;
}

function Waiter({tables, orders, updateOrder, updateTable}) {
  return <main>
    <h1>Waiter</h1>
    <p className="muted">Live table and order control.</p>
    <div className="grid">
      {tables.map(t => {
        const order = orders.find(o => o.table_id === t.id && !["completed","cancelled"].includes(o.status));
        return <div className="card" key={t.id}>
          <div className="row"><h2>Table {t.table_number}</h2><span className={`status ${t.status}`}>{t.status}</span></div>
          {order ? <><p>Order #{String(order.id).slice(0,8)} · {order.status}</p>
            <p><b>{money(order.total)}</b></p>
            {order.status === "ready" && <button onClick={() => updateOrder(order.id, "served")}>Serve order</button>}
            {order.status === "served" && <button onClick={() => {updateOrder(order.id,"completed"); updateTable(t.id,"cleaning");}}>Close & clean table</button>}
          </> : <button onClick={() => updateTable(t.id, "occupied")}>Open table</button>}
          {t.status === "cleaning" && <button onClick={() => updateTable(t.id, "available")}>Mark available</button>}
        </div>
      })}
    </div>
  </main>;
}

function Kitchen({orders, updateOrder}) {
  const groups = ["new","preparing","ready"];
  return <main>
    <h1>Kitchen Display</h1>
    <p className="muted">Every order appears here in real time.</p>
    <div className="columns">
      {groups.map(status => <section key={status}>
        <h2>{status}</h2>
        {orders.filter(o=>o.status===status).map(o => <div className="card" key={o.id}>
          <div className="row"><b>#{String(o.id).slice(0,8)}</b><span>{new Date(o.created_at).toLocaleTimeString()}</span></div>
          <p>Table {o.table_id}</p>
          <ul>{(o.order_items || []).map(i => <li key={i.id}>{i.item_name} × {i.quantity}</li>)}</ul>
          {status === "new" && <button onClick={() => updateOrder(o.id,"preparing")}>Accept & start</button>}
          {status === "preparing" && <button onClick={() => updateOrder(o.id,"ready")}>Mark ready</button>}
        </div>)}
      </section>)}
    </div>
  </main>;
}

function Admin({orders, tables, menu}) {
  const completed = orders.filter(o => ["completed","served"].includes(o.status));
  const sales = completed.reduce((s,o)=>s+Number(o.total||0),0);
  return <main>
    <h1>Admin Dashboard</h1>
    <div className="stats">
      <div><small>Sales</small><strong>{money(sales)}</strong></div>
      <div><small>Orders</small><strong>{orders.length}</strong></div>
      <div><small>Tables</small><strong>{tables.length}</strong></div>
      <div><small>Menu items</small><strong>{menu.length}</strong></div>
    </div>
    <div className="card">
      <h2>Recent orders</h2>
      {orders.slice(0,20).map(o => <div className="row line" key={o.id}>
        <span>#{String(o.id).slice(0,8)}</span><span>{o.status}</span><b>{money(o.total)}</b>
      </div>)}
    </div>
  </main>;
}

createRoot(document.getElementById("root")).render(<App />);