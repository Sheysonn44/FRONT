import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";


const Login = () => {
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL;

  const [form, setForm] = useState({ usuario: "", password: "" });
  const [institutions, setInstitutions] = useState([]);
  const [institution, setInstitution] = useState(null);
  const [error, setError] = useState(null);
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);

    try {    
    console.log("hola");
    const res = await fetch(`${API_URL}api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    // Primero lee la respuesta como texto para ver qué devuelve el servidor
    const text = await res.text();
    console.log("Respuesta como texto:", text);

    // Luego intenta parsear el texto a JSON
    const data = JSON.parse(text);
    console.log("Datos parseados:", data);

    if (!res.ok) {
      setError("Usuario o contraseña incorrecta.");
      return;
    }
    login(form.usuario, data.token);
    navigate("/teachers");

  } catch (err) {
    console.error("Error al intentar iniciar sesión:", err);
    setError("Error al intentar iniciar sesión.");
  }
  };

  const handleSeleccionarInstitucion = async () => {
    if (!institution) return;

    try {
      console.log(API_URL)
      const res = await fetch(`${API_URL}api/login/institucion/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institucion_id: institution,
          usuario: form.usuario,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.token) {
        setError("No se pudo cargar el perfil del colegio.");
        return;
      }

      // Guardar token y datos
      login(data.perfil, data.access_token, data.colegio, data.conf_paginacion, form.password);
      navigate("/students");
    } catch (err) {
      console.error("Error al intentar iniciar sesión:", err);
      setError("Error al seleccionar institución.");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <h1 className="text-2xl font-bold mb-6 text-center text-blue-700">Iniciar sesión</h1>

      {!institutions.length ? (
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="text"
            name="usuario"
            placeholder="Cédula"
            value={form.usuario}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <input
            type="password"
            name="password"
            placeholder="Contraseña"
            value={form.password}
            onChange={handleChange}
            required
            className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button
            type="submit"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full"
          >
            Entrar
          </button>
        </form>
      ) : (
        <div className="space-y-4">
          <p className="text-gray-700 font-medium">Seleccione su institución:</p>
          <select
            value={institution || ""}
            onChange={(e) => setInstitution(e.target.value)}
            className="w-full border rounded-lg p-3"
          >
            <option value="">-- Seleccionar --</option>
            {institutions.map((ins) => (
              <option key={ins.id} value={ins.id}>
                {ins.nombre} – {ins.region}
              </option>
            ))}
          </select>

          <button
            onClick={handleSeleccionarInstitucion}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg w-full"
            disabled={!institution}
          >
            Acceder
          </button>
        </div>
      )}
    </div>
  );
};

export default Login;
