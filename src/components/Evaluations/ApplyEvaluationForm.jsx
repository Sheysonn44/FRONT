import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useParams } from "react-router-dom";
import { Save } from "lucide-react";

const ApplyEvaluationForm = () => {
  const { token } = useAuth();
  const { subject_id=38, group_id = 30} = useParams();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(1);
  const API_URL = import.meta.env.VITE_API_URL;

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await fetch(
          `${API_URL}/evaluations?evaluation=${3}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        console.log(data)
        setStudents(data);
      } catch (error) {
        console.error("Error al cargar estudiantes:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStudents();
  }, [subject_id, group_id, period, token]);

  const handleGradeChange = (index, value) => {
    const updated = [...students];
    updated[index].grade = value;
    setStudents(updated);
    console.log(students)
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${API_URL}/evaluations/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          subject_id,
          group_id,
          period,
          grades: students.map(({ id, grade }) => ({ student_id: id, grade })),
        }),
      });
      const result = await res.json();
      console.log("Guardado:", result);
    } catch (error) {
      console.error("Error al guardar:", error);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Registro de Nota</h1>

      <table className="min-w-full border text-sm text-left border-gray-300">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-3 py-2 border">Estudiante</th>
            <th className="px-3 py-2 border text-center">Nota Final</th>
          </tr>
        </thead>
        <tbody>
          {[...Array(15)].map((student, index) => (
            <tr
            key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              <td className="px-3 py-2 border"></td>
              <td className="px-3 py-2 border text-center">
                <input
                  type="number"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={16} /> Guardar Notas
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-semibold text-gray-800 mb-4">Registro de Nota</h1>

      <table className="min-w-full border text-sm text-left border-gray-300">
        <thead className="bg-blue-100">
          <tr>
            <th className="px-3 py-2 border">Estudiante</th>
            <th className="px-3 py-2 border text-center">Nota Final</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => (
            <tr
              key={student.student_id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              <td className="px-3 py-2 border">{student.student_id} {student.nombre} {student.apellido1} {student.apellido2}</td>
              <td className="px-3 py-2 border text-center">
                <input
                  type="number"
                  value={student.grade || ""}
                  onChange={(e) => handleGradeChange(index, e.target.value)}
                  className="border rounded px-2 py-1 w-20 text-center"
                  min={0}
                  max={100}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex justify-end mt-4">
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center gap-2"
        >
          <Save size={16} /> Guardar Notas
        </button>
      </div>
    </div>
  );
};

export default ApplyEvaluationForm;
