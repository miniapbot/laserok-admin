import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkPassword, setPassword } from "@/lib/api";

export default function LoginPage() {
  const navigate = useNavigate();
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await checkPassword(pwd);
    if (ok) {
      setPassword(pwd);
      navigate("/");
    } else {
      setError("Неверный пароль");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm space-y-4"
      >
        <h1 className="text-2xl font-bold text-slate-900 text-center">LaserOK Admin</h1>
        <p className="text-slate-500 text-sm text-center">Введите пароль для входа</p>
        <input
          type="password"
          value={pwd}
          onChange={(e) => setPwd(e.target.value)}
          placeholder="Пароль"
          autoFocus
          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
        />
        {error && <div className="text-red-500 text-sm text-center">{error}</div>}
        <button
          type="submit"
          disabled={loading || !pwd}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white font-medium py-3 rounded-xl"
        >
          {loading ? "роверка…" : "Войти"}
        </button>
      </form>
    </div>
  );
}