import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsApi, type Product, clearPassword } from "@/lib/api";

export default function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await productsApi.list();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Load error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleLogout = () => {
    clearPassword();
    navigate("/login");
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm("Delete product: " + name + "?")) return;
    try {
      await productsApi.delete(id);
      setProducts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : "Delete error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">LaserOK Admin</h1>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => navigate("/orders")} className="px-3 py-2 text-sm text-slate-600 hover:text-slate-900">Orders</button>
            <button type="button" onClick={handleLogout} className="px-3 py-2 text-sm text-slate-600 hover:text-red-600">Logout</button>
          </div>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-slate-900">Products</h2>
          <Link to="/products/new" className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl transition-colors">+ Add product</Link>
        </div>

        {loading && <div className="text-center py-16 text-slate-500">Loading...</div>}
        {error && <div className="text-center py-16 text-red-500">Error: {error}</div>}
        {!loading && !error && products.length === 0 && <div className="text-center py-16 text-slate-500">No products</div>}

        {!loading && !error && products.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 text-left text-sm text-slate-500">
                <tr>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3 text-right">Price</th>
                  <th className="px-4 py-3 text-right">Stock</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-500">{p.sku}</td>
                    <td className="px-4 py-3 text-sm text-slate-900">{p.name}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{p.category}</td>
                    <td className="px-4 py-3 text-sm text-slate-900 text-right">{p.price} RUB</td>
                    <td className="px-4 py-3 text-sm text-slate-600 text-right">{p.stock}</td>
                    <td className="px-4 py-3 text-right space-x-3 whitespace-nowrap">
                      <Link to={`/products/${p.id}`} className="text-sm text-blue-600 hover:text-blue-700">Edit</Link>
                      <button type="button" onClick={() => handleDelete(p.id, p.name)} className="text-sm text-red-500 hover:text-red-700">Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
