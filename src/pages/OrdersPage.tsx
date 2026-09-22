import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ordersApi, type Order, clearPassword } from "@/lib/api";

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const statusLabels: Record<Order["status"], string> = {
  new: "Новый",
  processing: "В обработке",
  done: "Выполнен",
};

const statusColors: Record<Order["status"], string> = {
  new: "bg-blue-100 text-blue-700",
  processing: "bg-yellow-100 text-yellow-700",
  done: "bg-green-100 text-green-700",
};

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await ordersApi.list();
      setOrders(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка загрузки");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => {
    clearPassword();
    navigate("/login");
  };

  const handleStatus = async (id: string, status: Order["status"]) => {
    try {
      const updated = await ordersApi.updateStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Ошибка");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">LaserOK Admin</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate("/")} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900">
              Товары
            </button>
            <button type="button" onClick={handleLogout} className="px-3 py-2 text-sm text-slate-600 hover:text-red-600">
              Выйти
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Заказы</h2>

        {loading && <div className="text-center py-16 text-slate-500">Загрузка…</div>}
        {error && <div className="text-center py-16 text-red-500">Ошибка: {error}</div>}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-16 text-slate-500">Заказов нет</div>
        )}

        {!loading && !error && orders.length > 0 && (
          <div className="space-y-3">
            {orders.map((order) => {
              const isOpen = expanded === order.id;
              return (
                <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setExpanded(isOpen ? null : order.id)}
                    className="w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="min-w-0">
                        <div className="font-mono text-xs text-slate-500 truncate">{order.id}</div>
                        <div className="text-sm text-slate-900 font-medium mt-1">{order.customer.name} — {order.customer.phone}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{formatDate(order.createdAt)}</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[order.status]}`}>
                          {statusLabels[order.status]}
                        </span>
                        <span className="text-base font-bold text-slate-900 whitespace-nowrap">{order.total} ₽</span>
                        <span className="text-slate-400 text-sm">{isOpen ? "▲" : "▼"}</span>
                      </div>
                    </div>
                  </button>

                  {isOpen && (
                    <div className="px-4 pb-4 space-y-3 border-t border-slate-100 pt-3">
                      <div className="space-y-2">
                        {order.items.map((item) => (
                          <div key={item.id} className="flex justify-between gap-3 text-sm">
                            <span className="text-slate-900">{item.title}</span>
                            <span className="text-slate-500 whitespace-nowrap">{item.quantity} × {item.price} ₽ = {item.quantity * item.price} ₽</span>
                          </div>
                        ))}
                      </div>

                      {order.customer.comment && (
                        <div className="bg-slate-50 rounded-xl p-3 text-sm">
                          <div className="text-slate-500 mb-1">Комментарий:</div>
                          <div className="text-slate-900">{order.customer.comment}</div>
                        </div>
                      )}

                      <div className="flex gap-2 pt-2 flex-wrap">
                        {(["new", "processing", "done"] as const).map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => handleStatus(order.id, s)}
                            disabled={order.status === s}
                            className={`px-3 py-1.5 text-sm rounded-xl transition-colors ${
                              order.status === s
                                ? "bg-slate-100 text-slate-400 cursor-default"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {statusLabels[s]}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}