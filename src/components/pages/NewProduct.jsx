import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Save, ChevronLeft, Loader2, Monitor, Smartphone } from 'lucide-react';

import { CanvasContext } from "../../context/CanvasContext";
import { supabase } from "../../supabase/client";
import ToolPanel from "../editor/ToolPanel";
import CanvasArea from "../editor/CanvasArea";
import LayerPannel from "../editor/LayerPannel";
import Sidebar from "../editor/Sidebar";

const NewProduct = () => {
  const navigate = useNavigate();
  const { elements, setElements, canvasBg, setCanvasBg, audioFile, setAudioFile } = useContext(CanvasContext);

  const [designName, setDesignName] = useState("Untitled Design");
  const [category, setCategory] = useState("Posters");
  const [orientation, setOrientation] = useState("portrait");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (setElements) setElements([]);
    if (setCanvasBg) setCanvasBg("#ffffff");
    if (setAudioFile) setAudioFile(null);
  }, [setElements, setCanvasBg, setAudioFile]);

  const canvasDimensions = orientation === "portrait"
    ? { width: 1080, height: 1350 }
    : { width: 1920, height: 1080 };

  const handlePublish = async () => {
    if (!designName.trim()) {
      alert("Please enter a design name");
      return;
    }
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 200));
      const canvasElement = document.querySelector('canvas');
      const previewDataURL = canvasElement ? canvasElement.toDataURL("image/png", 0.5) : "https://placehold.co/600x400";

      const designContent = {
        elements: elements,
        canvasBg: canvasBg,
        audio: audioFile,
        config: { orientation: orientation, dimensions: canvasDimensions }
      };

      const { error } = await supabase.from('products').insert([{
        name: designName,
        content: designContent,
        category: category,
        image_url: previewDataURL
      }]);

      if (error) throw error;
      alert("Design Published Successfully! 🎉");
      navigate('/all-products');
    } catch (err) {
      alert("Save Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
      <div className="h-14 bg-white border-b flex justify-between items-center px-4 z-[100] shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <div className="h-6 w-[1px] bg-gray-200 mx-1"></div>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="font-bold text-gray-800 bg-transparent border-none focus:ring-2 focus:ring-blue-100 rounded px-2 py-1 w-64 outline-none"
            placeholder="Design Name"
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button onClick={() => setOrientation("portrait")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${orientation === "portrait" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
              <Smartphone size={14} /> Portrait
            </button>
            <button onClick={() => setOrientation("landscape")}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${orientation === "landscape" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}>
              <Monitor size={14} /> Landscape
            </button>
          </div>

          <select value={category} onChange={(e) => setCategory(e.target.value)}
            className="text-sm font-medium border-gray-200 rounded-lg bg-gray-50 px-3 py-2 outline-none">
            <option value="Posters">Posters</option>
            <option value="Social Media">Social Media</option>
            <option value="Logos">Logos</option>
            <option value="Kids Designs">Kids Designs</option>
          </select>

          <button onClick={handlePublish} disabled={loading}
            className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-md disabled:opacity-50">
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Saving..." : "Publish"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <ToolPanel />
          <div className="flex-1 overflow-auto bg-[#f1f5f9] relative flex items-center justify-center">
            <div className="p-10">
                <CanvasArea key={orientation} dimensions={canvasDimensions} />
            </div>
            <LayerPannel />
          </div>
        </div>
      </div>
    </div>
  );
};
export default NewProduct;