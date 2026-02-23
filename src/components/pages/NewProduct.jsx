import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { Save, ChevronLeft, Loader2, Monitor, Smartphone, Menu, X } from 'lucide-react';

import { CanvasContext } from "../../context/CanvasContext";
import { supabase } from "../../supabase/client";
import ToolPanel from "../editor/ToolPanel";
import CanvasArea from "../editor/CanvasArea";
import LayerPannel from "../editor/LayerPannel";
import Sidebar from "../editor/Sidebar";

const NewProduct = () => {
  const navigate = useNavigate();
  const {
    elements,
    setElements,
    canvasBg,
    setCanvasBg,
    audioFile,
    setAudioFile,
    stageRef,
    orientation,
    setOrientation,
    getPublishDimensions
  } = useContext(CanvasContext);

  const [designName, setDesignName] = useState("Untitled Design");
  const [category, setCategory] = useState("Posters");
  const [loading, setLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);


  useEffect(() => {
    setElements([]);
    setCanvasBg("#ffffff");
    setAudioFile(null);
    setOrientation("portrait");
  }, [setElements, setCanvasBg, setAudioFile, setOrientation]);

  const handlePublish = async () => {
    if (!designName.trim()) {
      alert("Please enter a design name");
      return;
    }

    setLoading(true);

    try {
      const publishSize = getPublishDimensions();

      let previewDataURL = "https://placehold.co/600x400";

      if (stageRef?.current) {
        previewDataURL = stageRef.current.toDataURL({
          pixelRatio: 3,
          mimeType: 'image/png'
        });
      }

      const designContent = {
        elements,
        canvasBg,
        audio: audioFile,
        config: {
          orientation: orientation,
          dimensions: publishSize
        }
      };

      const { error } = await supabase.from('products').insert([{
        name: designName,
        content: designContent,
        category,
        image_url: previewDataURL
      }]);

      if (error) throw error;

      alert("Design Published Successfully! 🎉");
      navigate('/all-products');

    } catch (err) {
      console.error("Publish Error:", err);
      alert("Save Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans">

      {/* Navbar */}
      <div className="h-auto md:h-14 bg-white border-b flex flex-col md:flex-row justify-between items-center px-4 py-2 md:py-0 z-[100] shadow-sm gap-2">
            <div className="flex items-center gap-2 w-full md:w-auto">
              <button 
                onClick={() => setIsSidebarOpen(true)} 
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-700"
              >
                <Menu size={22} />
              </button>
    
              <button 
                onClick={() => navigate('/all-products')} 
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              
              <input
                type="text"
                value={designName}
                onChange={(e) => setDesignName(e.target.value)}
                className="font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-blue-300 rounded px-2 py-1 w-full md:w-64 outline-none text-sm"
                placeholder="Design Name"
              />
            </div>
    
            <div className="flex items-center gap-2 w-full md:w-auto justify-between md:justify-end">
              <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
                <button 
                  onClick={() => setOrientation("portrait")} 
                  className={`p-2 rounded-md transition-all ${
                    orientation === "portrait" 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Portrait Mode"
                >
                  <Smartphone size={14} />
                </button>
                <button 
                  onClick={() => setOrientation("landscape")} 
                  className={`p-2 rounded-md transition-all ${
                    orientation === "landscape" 
                      ? 'bg-white shadow-sm text-blue-600' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  title="Landscape Mode"
                >
                  <Monitor size={14} />
                </button>
              </div>
              
              <div className="flex items-center gap-2">
                <select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)} 
                  className="text-xs font-medium border-gray-200 rounded-lg bg-gray-50 px-2 py-1.5 outline-none hover:bg-white"
                >
                  <option value="Posters">Posters</option>
                  <option value="Logos">Logos</option>
                  <option value="Social Media">Social Media</option>
                  <option value="Kids Designs">Kids Designs</option>
                </select>
                
                <button 
                  onClick={handlePublish} 
                  disabled={loading} 
                  className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-xs shadow-md disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
                  {loading ? "Publishing..." : "Publish"}
                </button>
              </div>
            </div>
          </div>


      <div className="flex-1 flex overflow-hidden">

        <div className={`
          ${isSidebarOpen ? 'fixed inset-0 z-50 bg-white' : 'hidden'} 
          md:relative md:block md:w-[80px] md:bg-transparent
        `}>
          {isSidebarOpen && (
            <div className="flex justify-end p-2 md:hidden">
              <button onClick={() => setIsSidebarOpen(false)} className="p-2">
                <X size={20} />
              </button>
            </div>
          )}
          <Sidebar />
        </div>

        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="hidden md:block">
          <ToolPanel />
        </div>

        <div className="flex-1 bg-[#f1f5f9] overflow-auto p-4 flex items-center justify-center">
          <CanvasArea />
        </div>

        <div className="hidden xl:block">
          <LayerPannel />
        </div>
      </div>
    </div>
  );
};

export default NewProduct;