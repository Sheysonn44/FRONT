import { useState, useEffect } from "react";

const usePaginatedFetch = ({
  url,
  token,
  searchTerm = "",
  page = 1,
  pageSize = 10,
  params = {}
}) => {
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPaginatedData = async () => {
      setLoading(true);
      setError(null);

      try {
        const sanitizedSearch = searchTerm.trim().replace(/\s+/g, "%");
        const query = new URLSearchParams({
          value: sanitizedSearch,
          page,
          pageSize,
          ...params, // <- Incluye year, nivel, asignada, etc.
        });

        const endpoint = `${url}?${query.toString()}`;
        //console.log("Fetching:", endpoint);
        console.log(endpoint)

        const res = await fetch(endpoint, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        const json = await res.json();
        //console.log(json)
        if (json.data) {
          setData(json.data);
          setTotalPages(Math.ceil(json.total / pageSize));
        } else {
          setData(json);
          setTotalPages(1);
        }

      } catch (err) {
        console.error("Fetch error:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (token && url) {
      fetchPaginatedData();
    }
  }, [url, token, searchTerm, page, pageSize, JSON.stringify(params)]); // ← Asegura que cambios en params disparen el efecto

  return { data, totalPages, loading, error };
};

export default usePaginatedFetch;
