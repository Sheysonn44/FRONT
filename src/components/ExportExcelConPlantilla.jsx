import React from "react";

const ExportExcelConPlantilla = ({ profesor, correo, events }) => {
  const API_URL = import.meta.env.VITE_API_URL;

  const convertirHoraAMPM = (horaString) => {
    let [h, m] = horaString.split(":").map(Number);
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    h = h ? h : 12;
    return `${h}:${m.toString().padStart(2, "0")} ${ampm}`;
  };

  const indexToHora = (index) => {
    const h = 6 + Math.floor(index / 2);
    const m = index % 2 === 0 ? "00" : "30";
    return `${h}:${m}`;
  };

  const exportToExcel = async () => {
    try {
      const processedSelections = events.map((task) => {
        const start = indexToHora(task.hour);
        const end = indexToHora(task.hour + task.duration);
        return {
          ...task,
          startTime: start,
          endTime: end,
          startTimeDecimal: convertirHoraAMPM(start),
          endTimeDecimal: convertirHoraAMPM(end),
        };
      });

      const response = await fetch(`${API_URL}/reportes/generar-declaracion`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ profesor, correo, events: processedSelections }),
      });

      if (!response.ok) throw new Error("Error generando el archivo");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "declaracion_completa.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error("Error exportando Excel:", error);
      alert("Error generando el archivo.");
    }
  };

  return (
    <button
      onClick={exportToExcel}
      className="flex items-center gap-2 text-sm px-3 py-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
    >
      📄 Exportar Declaración
    </button>
  );
};

export default ExportExcelConPlantilla;
