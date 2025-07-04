import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext";

const ChangeInstitution = () => {
  const { user, login, password } = useAuth();
  const [institutions, setInstitutions] = useState([]);
  const [institution, setInstitution] = useState("");
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const loadInstitutions = async () => {
      console.log(password)
      if (!user?.doc || !password) return;
      try {                     
        
        const res = await fetch(`${API_URL}api/login/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            usuario: user.doc,
            password: password,
          }),
        });

        const data = await res.json();
        console.log(data)
        setInstitutions(data);
      } catch (err) {
        console.error("Error al cargar colegios", err);
      }
    };

    if (user?.doc) {
      loadInstitutions();
    }
  }, [user]);

  const handleChange = async () => {
    if (!institution || !user?.doc || !password) return;

    try {
      const res = await fetch(`${API_URL}/api/institucion/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          institucion_id: institution,
          usuario: user.doc,
        }),
      });

      const data = await res.json();

      if (!data.access_token) throw new Error("No se recibió token");

      // Usar login de AuthContext
      login(data.perfil, data.access_token, data.colegio, password);
    } catch (err) {
      console.error("Error al cambiar institución", err);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={institution}
        onChange={(e) => setSeleccionado(e.target.value)}
        className="border rounded px-2 py-1"
      >
        <option value="">Cambiar institución</option>
        {institutions.map((ins) => (
          <option key={ins.id} value={ins.id}>
            {ins.nombre} - {ins.region}
          </option>
        ))}
      </select>
      <button
        onClick={handleChange}
        disabled={!institution}
        className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700"
      >
        Aplicar
      </button>
    </div>
  );
};

export default ChangeInstitution;
