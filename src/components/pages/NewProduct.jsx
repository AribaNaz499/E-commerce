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
      <div className="bg-white border-b shadow-sm flex-shrink-0">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setIsSidebarOpen(true)} 
              className="md:hidden p-2 hover:bg-gray-100 rounded-lg"
            >
              <Menu size={20} />
            </button>
            <button 
              onClick={() => navigate('/all-products')} 
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeft size={20} />
            </button>
            <input
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="font-semibold outline-none border-b border-transparent focus:border-blue-300 px-1"
              placeholder="Design Name"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setOrientation("portrait")}
                className={`p-2 rounded-md ${orientation === "portrait" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <Smartphone size={16} />
              </button>
              <button
                onClick={() => setOrientation("landscape")}
                className={`p-2 rounded-md ${orientation === "landscape" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
              >
                <Monitor size={16} />
              </button>
            </div>
            
            <select 
              value={category} 
              onChange={(e) => setCategory(e.target.value)} 
              className="text-sm border rounded-lg bg-gray-50 px-2 py-1.5 outline-none"
            >
              <option value="Posters">Posters</option>
              <option value="Logos">Logos</option>
              <option value="Social Media">Social</option>
            </select>
            
            <button
              onClick={handlePublish}
              disabled={loading}
              className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-sm flex items-center gap-1"
            >
              {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
              Publish
            </button>
          </div>
        </div>
        
      
        <div className="md:hidden flex justify-center gap-2 pb-2 border-t pt-2">
          <button
            onClick={() => setOrientation("portrait")}
            className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${orientation === "portrait" ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <Smartphone size={12} /> Portrait
          </button>
          <button
            onClick={() => setOrientation("landscape")}
            className={`px-3 py-1 rounded-md text-xs flex items-center gap-1 ${orientation === "landscape" ? 'bg-blue-500 text-white' : 'bg-gray-100'}`}
          >
            <Monitor size={12} /> Landscape
          </button>
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