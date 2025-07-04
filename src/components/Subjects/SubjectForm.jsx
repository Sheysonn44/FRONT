import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Pencil, Save, ArrowLeft } from "lucide-react";

const SubjectForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuth();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const year = 2025;
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchSubject = async () => {
      try {
        const res = await fetch(
          `https://colegiocr.com/api/subjects/${id}?year=${year}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const json = await res.json();
        if (!res.ok) throw new Error(json.message || "Error al cargar la asignatura");

        const creditsArray = Array.isArray(json.credits_by_period)
          ? json.credits_by_period
          : Object.entries(json.credits_by_period || {}).map(([period_id, periodData]) => ({
              period_id: parseInt(period_id),
              period_name: periodData.period_name,
              credits: periodData.credits || 0
            }));

        setFormData({ ...json, credits_by_period: creditsArray });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (id && token) fetchSubject();
  }, [id, token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreditsChange = (index, value) => {
    const updatedCredits = [...formData.credits_by_period];
    updatedCredits[index].credits = parseInt(value);
    setFormData((prev) => ({ ...prev, credits_by_period: updatedCredits }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Guardando", formData);
  };

  return (
    <div className="max-w-3xl mx-auto mt-6 min-h-[50vh]">
      {loading ? (
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-300 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-12 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      ) : !formData ? (
        <p>No se encontró la asignatura</p>
      ) : (
        <>
          <h1 className="text-xl font-bold text-gray-700 mb-4">Editar Asignatura</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Código</label>
              <input
                type="text"
                name="id"
                value={formData.id}
                disabled
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border p-2 rounded"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Nivel</label>
              <input
                type="text"
                name="level"
                value={`${formData.level.name} (${formData.level.id})`}
                disabled
                className="w-full border p-2 rounded bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Créditos por periodo
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {formData.credits_by_period.map((period, idx) => (
                  <div
                    key={period.period_id}
                    className={`flex justify-between items-center gap-2 border p-2 rounded shadow-sm ${
                      period.credits > 0 ? "bg-blue-50" : "bg-gray-100"
                    }`}
                  >
                    <label className="text-gray-700 font-medium w-full">
                      {period.period_name}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={period.credits}
                      onChange={(e) => handleCreditsChange(idx, e.target.value)}
                      className="w-20 border rounded p-1 text-center"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-between items-center mt-6">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-sm bg-gray-200 px-4 py-2 rounded hover:bg-gray-300"
              >
                <ArrowLeft size={16} /> Volver
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 text-white bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
              >
                <Save size={16} /> Guardar
              </button>
            </div>
          </form>
        </>
      )}
    </div>
  );
};

export default SubjectForm;
