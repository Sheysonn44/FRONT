import { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { SearchContext } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import usePaginatedFetch from "../hooks/usePaginatedFetch";
import {
  Pencil,
  ArrowBigRight,
  ArrowBigLeft,
  UserPlus,
} from "lucide-react";

const TeacherGroups = () => {
  const { id } = useParams();
  const { searchTerm, setSearchTitle } = useContext(SearchContext);
  const { token, user } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => user?.paginacion);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState([])
  const [totalPages, setTotalPages] = useState(0)
  const API_URL = import.meta.env.VITE_API_URL;

   const [formData, setFormData] = useState({
      nom: "",
      ape: "",
      doc: "",
      correo: "",
    });


  // Establecer título
  useEffect(() => {
    setSearchTitle("Grupos "+ id);
  }, [setSearchTitle]);

  useEffect(() => { 
      fetch(`${API_URL}/profesores/grupos/${id}?year=${2025}&semestre=${1}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          //console.log(data)
          if (!data) {
            setNotFound(true);
            return;
          }
          setGroups(data);
        })
        .catch((err) => {
          console.error("Error al cargar grupos del profesor:", err);
          setNotFound(true);
        })
        .finally(() => setLoading(false));
    
  }, [id]);

   if (loading) {
        return (
          <div className="space-y-4 animate-pulse">
            
            <table className="min-w-full border text-left text-sm border-gray-300">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border border-gray-300 w-1/12">Aula</th>
                <th className="px-4 py-2 border border-gray-300 w-4/12">Asignatura</th>
                <th className="px-4 py-2 border border-gray-300 w-2/12">Nivel</th>
                <th className="px-4 py-2 border border-gray-300 w-2/12">Periodo</th>
                <th className="px-4 py-2 border border-gray-300 w-2/12">Estudiantes</th>
            
                
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
                 <td className="px-4 py-2 border border-gray-300 text-center">
                   <button
                     onClick={() => navigate(`/subjects/edit/`)}
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
    

  return (
    <div className="text-lg">
      
      <div className="overflow-x-auto">
        <table className="min-w-full border text-left text-sm border-gray-300">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border border-gray-300 w-4/12">Aula</th>
              <th className="px-4 py-2 border border-gray-300 w-4/12">Asignatura</th>
              <th className="px-4 py-2 border border-gray-300 w-1/12">Nivel</th>
              <th className="px-4 py-2 border border-gray-300 w-1/12">Periodo</th>
              <th className="px-4 py-2 border border-gray-300 w-1/12">Cant Est</th>
              <th className="px-4 py-2 border border-gray-300 text-center w-1/12">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(
              groups.map((group, index) => (
                <tr
                  key={group.aula_id}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                   ({group.aula_id}) {group.aula_desc} 
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {group.materia_desc}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600 text-center">
                    {group.periodo}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600 text-center">
                    {group.nivel}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 font-medium text-gray-800 text-center">
                    {group.estudiantes} 
                  </td>
                  <td className="px-4 py-2 border border-gray-300 space-x-2 text-center">
                    <button
                      onClick={() =>
                        navigate(`/groups/edit/${group.aula}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      <Pencil size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

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
          Página {page} de {1}
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

export default TeacherGroups;
