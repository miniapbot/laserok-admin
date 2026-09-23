import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { productsApi, getPassword, type Product } from "@/lib/api";

const API_URL =
  import.meta.env.VITE_API_URL || "https://api.shop.laserokey.ru";
const SHOP_URL = "https://shop.laserokey.ru";

interface FormState {
  sku: string;
  name: string;
  shortDescription: string;
  description: string;
  category: string;
  price: string;
  oldPrice: string;
  stock: string;
  images: string[];
  active: boolean;
}

const emptyForm: FormState = {
  sku: "",
  name: "",
  shortDescription: "",
  description: "",
  category: "",
  price: "",
  oldPrice: "",
  stock: "0",
  images: [],
  active: true,
};

export default function ProductFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [form, setForm] = useState<FormState>(emptyForm);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isEdit || !id) return;
    (async () => {
      try {
        const p = await productsApi.get(Number(id));
        setForm({
          sku: p.sku,
          name: p.name,
          shortDescription: p.shortDescription || "",
          description: p.description || "",
          category: p.category,
          price: String(p.price),
          oldPrice: p.oldPrice ? String(p.oldPrice) : "",
          stock: String(p.stock),
          images: p.images || [],
          active: p.active,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Load error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id, isEdit]);

  const update = (field: keyof FormState, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch(`${API_URL}/api/admin/upload`, {
        method: "POST",
        headers: { "X-Admin-Password": getPassword() },
        body: fd,
      });
      if (!res.ok) throw new Error(`Upload failed: ${res.status}`);
      const data = await res.json();
      setForm((prev) => ({ ...prev, images: [...prev.images, data.url] }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload error");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.sku.trim() || !form.name.trim() || !form.category.trim()) {
      setError("SKU, name and category are required");
      return;
    }
    if (!form.price || Number(form.price) <= 0) {
      setError("Price is required");
      return;
    }

    setSaving(true);
    try {
      const data: Partial<Product> = {
        sku: form.sku.trim(),
        name: form.name.trim(),
        shortDescription: form.shortDescription.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        price: Number(form.price),
        oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
        stock: Number(form.stock) || 0,
        images: form.images,
        active: form.active,
      };

      if (isEdit && id) {
        await productsApi.update(Number(id), data);
      } else {
        await productsApi.create(data);
      }
      navigate("/");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save error");
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-center py-16 text-slate-500">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-xl font-bold text-blue-600">
            {isEdit ? "Edit product" : "New product"}
          </h1>
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-sm text-slate-600 hover:text-slate-900"
          >
            &larr; Back
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6">
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm p-6 space-y-4"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                SKU *
              </label>
              <input
                type="text"
                value={form.sku}
                onChange={(e) => update("sku", e.target.value)}
                placeholder="LZR-000004"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Category *
              </label>
              <input
                type="text"
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
                placeholder="Жетоны"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Деревянный жетон"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Short description
            </label>
            <input
              type="text"
              value={form.shortDescription}
              onChange={(e) => update("shortDescription", e.target.value)}
              placeholder="Shown on catalog card"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Full description
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={4}
              placeholder="Detailed description"
              className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Price, RUB *
              </label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="250"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Old price, RUB
              </label>
              <input
                type="number"
                value={form.oldPrice}
                onChange={(e) => update("oldPrice", e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Stock
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => update("stock", e.target.value)}
                placeholder="15"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          {/* Images */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Images
            </label>

            <div className="flex flex-wrap gap-3 mb-3">
              {form.images.map((url, idx) => (
                <div key={idx} className="relative group">
                  <img
                    src={url.startsWith("http") ? url : `${SHOP_URL}${url}`}
                    alt=""
                    className="w-24 h-24 object-cover rounded-xl border border-slate-200"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(idx)}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label="Remove"
                  >
                    ×
                  </button>
                </div>
              ))}

              <label className="w-24 h-24 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUpload}
                  className="hidden"
                  disabled={uploading}
                />
                <span className="text-2xl text-slate-400">
                  {uploading ? "..." : "+"}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  {uploading ? "Uploading" : "Add photo"}
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="active"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
              className="w-4 h-4"
            />
            <label htmlFor="active" className="text-sm text-slate-700">
              Active (show in catalog)
            </label>
          </div>

          {error && (
            <div className="bg-red-50 text-red-700 text-sm p-3 rounded-xl">
              {error}
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving || uploading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium px-6 py-2.5 rounded-xl transition-colors"
            >
              {saving ? "Saving..." : isEdit ? "Save" : "Create product"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}