import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { SearchContext } from "../context/SearchContext";
import { useAuth } from "../context/AuthContext";
import usePaginatedFetch from "../hooks/usePaginatedFetch";
import {
  UserCog,
  ArrowBigRight,
  ArrowBigLeft,
  UserPlus,
} from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

const Students = () => {
  const { searchTerm, setSearchTitle } = useContext(SearchContext);
  const { token, user } = useAuth();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(() => user?.paginacion);
  const navigate = useNavigate();

  // Establecer título
  useEffect(() => {
    setSearchTitle("Estudiantes");
  }, [setSearchTitle]);

  // Hook personalizado con paginación
  const { data: students, totalPages, loading, error } = usePaginatedFetch({
   url: `${API_URL}/estudiantes`,
    token,
    searchTerm,
    page,
    pageSize,
  });

  const handleDelete = async (id) => {
    const confirm = window.confirm("¿Eliminar este estudiante?");
    if (!confirm) return;

    try {
      await fetch(`${API_URL}/estudiantes/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      // Re-fetch automático en el hook por dependencia en page/searchTerm
    } catch (error) {
      console.error("Error al eliminar estudiante:", error);
    }
  };

  if (loading) {
        return (
          <div className="space-y-4 animate-pulse">
            <div className="flex justify-between items-center mb-4">
            <button
              onClick={() => navigate("/students/add")}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
            >
              <UserPlus />
            </button>
        </div>
            <table className="min-w-full border text-left text-sm border-gray-300">
            <thead className="bg-blue-100 text-gray-700">
              <tr>
                <th className="px-4 py-2 border border-gray-300 w-2/12">Expediente</th>
                <th className="px-4 py-2 border border-gray-300 w-2/12">Cédula</th>
                <th className="px-4 py-2 border border-gray-300 w-5/12">Nombre</th>
            
                
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
                 <td className="px-4 py-2 border border-gray-300 text-center">
                   <button
                     className="text-blue-600 hover:underline"
                   >
                     <UserCog size={16} />
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
    <div className="text-lg">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => navigate("/students/add")}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          <UserPlus />
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border text-left text-sm border-gray-300">
          <thead className="bg-blue-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 border border-gray-300 w-2/12">Expediente</th>
              <th className="px-4 py-2 border border-gray-300 w-2/12">Cédula</th>
              <th className="px-4 py-2 border border-gray-300 w-5/12">Nombre</th>
              <th className="px-4 py-2 border border-gray-300 w-1/12 text-center">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {(
              students.map((student, index) => (
                <tr
                  key={student.expediente}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-100"}
                >
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {student.expediente}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 text-gray-600">
                    {student.cedula}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 font-medium text-gray-800">
                    {student.nombre} {student.apellido1} {student.apellido2}
                  </td>
                  <td className="px-4 py-2 border border-gray-300 space-x-2 text-center">
                    <button
                      onClick={() =>
                        navigate(`/students/edit/${student.expediente}`)
                      }
                      className="text-blue-600 hover:underline"
                    >
                      <UserCog size={16}/>
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

export default Students;
