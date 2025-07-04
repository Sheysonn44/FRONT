import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import usePaginatedFetch from "../hooks/usePaginatedFetch";
import { SearchContext } from "../context/SearchContext";
import {
  ArrowBigLeft,
  ArrowBigRight,
  Pencil,
  FilePlus 
} from "lucide-react";

const Subjects = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const { searchTerm, setSearchTitle } = useContext(SearchContext);
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState(2);
  const [periodCount, setPeriodCount] = useState(6);
  const [levels, setLevels] = useState([]);
  const [pageSize, setPageSize] = useState(() => user?.paginacion);
  const year = 2025;
  const API_URL = import.meta.env.VITE_API_URL;

  // Establecer título
    useEffect(() => {
      setSearchTitle("Asignaturas");
    }, [setSearchTitle]);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await fetch(`${API_URL}/levels`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        setLevels(data);

        const selected = data.find((lvl) => lvl.id === level);
        if (selected) setPeriodCount(selected.period_count);
      } catch (err) {
        console.error("Error al cargar niveles:", err);
      }
    };

    if (token) fetchLevels();
  }, [token, level]);

  const {
    data: subjects,
    totalPages,
    loading,
    error,
  } = usePaginatedFetch({
    url: `${API_URL}/subjects`,
    token,
    searchTerm,
    page,
    pageSize,
    params: {
      level_id: level,
      year,
    },
  });

  const periodHeaders = ["I", "II", "III", "IV", "V", "VI"].slice(0, periodCount);

  const handleLevelChange = (e) => {
    const newLevel = Number(e.target.value);
    setLevel(newLevel);
    setPage(1);

    const selected = levels.find((lvl) => lvl.id === newLevel);
    if (selected) setPeriodCount(selected.period_count);
  };

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/students/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FilePlus size = {16} />
        </button>
        
    </div>
        <table className="min-w-full border text-left text-sm border-gray-300">
        <thead className="bg-blue-100 text-gray-700">
          <tr>
            <th className="px-4 py-2 border border-gray-300 w-1/12">Código</th>
            <th className="px-4 py-2 border border-gray-300 w-5/12">Nombre</th>
            <th className="px-4 py-2 border border-gray-300 w-1/12 text-center">I</th>
            <th className="px-4 py-2 border border-gray-300 w-1/12 text-center">II</th>
            <th className="px-4 py-2 border border-gray-300 w-1/12 text-center">III</th>
            <th className="px-4 py-2 border border-gray-300 w-1/12 text-center">IV</th>
        
            
            <th className="px-4 py-2 border border-gray-300 w-1/12 text-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          
       
          {[...Array(pageSize || 10)].map((_, idx) => (
             <tr
             key={idx}
             className={idx % 2 === 0 ? "bg-white" : "bg-gray-100"}
           >
             <td className="px-4 py-2 border border-gray-300"></td>
             <td className="px-4 py-2 border border-gray-300"></td>
             <td className="px-4 py-2 border border-gray-300"></td>     
             <td className="px-4 py-2 border border-gray-300"></td>
             <td className="px-4 py-2 border border-gray-300"></td>  
             <td className="px-4 py-2 border border-gray-300"></td>             
             <td className="px-4 py-2 border border-gray-300 text-center">
               <button
                 className="text-blue-600 hover:underline"
               >
                 <Pencil size={16} />
               </button>
             </td>
           </tr>
          ))}
        </tbody>  
        </table>  
      </div>
    );
  }

  if (error) return <p className="text-red-500">{error}</p>;

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => navigate("/students/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <FilePlus size = {16} />
        </button>
        <select
          value={level}
          onChange={handleLevelChange}
          className="border px-3 py-1 rounded"
        >
          {levels.map((lvl) => (
            <option key={lvl.id} value={lvl.id}>
              {lvl.name}
            </option>
          ))}
        </select>
      </div>

      <table className="min-w-full border text-left text-sm border-gray-300">
        <thead className="bg-blue-100 text-gray-700">
          <tr>
            <th className="px-3 py-2 border border-gray-300 w-1/12 ">Código</th>
            <th className="px-3 py-2 border-gray-300 border w-5/12">Nombre</th>
            {periodHeaders.map((p, index) => (
              <th key={index} className="px-3 py-2 border border-gray-300 text-center w-1/12">
                {p}
              </th>
            ))}
            <th className="px-3 py-2 border border-gray-300 text-center w-1/12">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {subjects.map((subj, index) => (
            <tr
              key={subj.id}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
            >
              <td className="px-3 py-2 border border-gray-300">{subj.id}</td>
              <td className="px-3 py-2 border border-gray-300">{subj.description}</td>
              {periodHeaders.map((p, idx) => (
                <td key={idx} className="px-3 py-2 border border-gray-300 text-center">
                  {subj[p] || 0}
                </td>
              ))}
              <td className="px-3 py-2 border border-gray-300 text-center">
                <button
                  onClick={() => navigate(`/subjects/edit/${subj.id}`)}
                  className="text-blue-600 hover:underline"
                >
                  <Pencil size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Paginación */}
      <div className="flex justify-between items-center mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          <ArrowBigLeft />
        </button>
        <span className="text-gray-700">
          Página {page} de {totalPages}
        </span>
        <button
          onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={page === totalPages}
          className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 disabled:opacity-50"
        >
          <ArrowBigRight />
        </button>
      </div>
    </div>
  );
};

export default Subjects;
