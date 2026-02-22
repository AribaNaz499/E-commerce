// components/Navbar.jsx
import React, { useContext, useEffect, useState } from 'react';
import { CanvasContext } from '../context/CanvasContext';
import exportToPDF from '../utils/exportToPDF';
import { FileText } from 'lucide-react';

const Navbar = () => {
  const { stageRef, orientation } = useContext(CanvasContext);
  const [isStageReady, setIsStageReady] = useState(false);

  useEffect(() => {
    if (stageRef?.current) {
      console.log("✅ Stage ready:", {
        width: stageRef.current.width(),
        height: stageRef.current.height()
      });
      setIsStageReady(true);
    }
  }, [stageRef]);

  const handleExportPDF = () => {
    if (!stageRef?.current) {
      alert("Canvas is still loading. Please wait a moment and try again.");
      return;
    }
    exportToPDF(stageRef, orientation);
  };

  return (
    <nav className="bg-white shadow-sm px-6 py-3 flex justify-between items-center">
      <div className="font-bold text-xl">CANVASPRO</div>
      
      <div className="flex gap-3">
        <button
          onClick={handleExportPDF}
          disabled={!isStageReady}
          className={`bg-emerald-600 text-white px-5 py-2 rounded-full text-sm font-bold flex gap-2 items-center hover:bg-emerald-700 transition-all ${
            !isStageReady ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          <FileText size={18} />
          Export PDF
        </button>

        {/* <button className="bg-purple-600 text-white px-5 py-2 rounded-full text-sm font-bold">
          Gallery
        </button> */}
      </div>
    </nav>
  );
};

export default Navbar;