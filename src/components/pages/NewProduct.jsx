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
  const context = useContext(CanvasContext);

  if (!context) {
    return <div className="h-screen flex items-center justify-center">Loading Context...</div>;
  }

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
    getPublishDimensions,
    activeTool,
    setActiveTool,
    isSidebarOpen,
    setIsSidebarOpen,
    setIsToolPanelOpen,
    imageInputRef,
    videoInputRef,
    audioInputRef,
    handleImageUpload,
    handleVideoUpload,
    handleAudioUpload,
  } = context;

  const [designName, setDesignName] = useState("Untitled Design");
  const [category, setCategory] = useState("Posters");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsToolPanelOpen(!!activeTool);
  }, [activeTool, setIsToolPanelOpen]);

  useEffect(() => {
    if (setElements) setElements([]);
    if (setCanvasBg) setCanvasBg("#ffffff");
    if (setAudioFile) setAudioFile(null); 
    if (setOrientation) setOrientation("portrait");
    if (setActiveTool) setActiveTool(null);
  }, []);

  const captureCanvasImage = () => {
    return new Promise((resolve) => {
      if (!stageRef?.current) {
        resolve(null);
        return;
      }

      try {
        setTimeout(() => {
          try {
            const dataURL = stageRef.current.toDataURL({
              pixelRatio: 2,
              mimeType: 'image/png'
            });
            resolve(dataURL);
          } catch (err) {
            console.error("Capture error:", err);
            resolve(null);
          }
        }, 300);
      } catch (err) {
        console.error("Error:", err);
        resolve(null);
      }
    });
  };

  const handlePublish = async () => {
    if (!designName.trim()) {
      alert("Please enter a design name");
      return;
    }
    
    setLoading(true);
    
    try {
      const previewDataURL = await captureCanvasImage();
      
      if (!previewDataURL) {
        console.warn("Could not capture canvas, using placeholder");
      }

      const designContent = {
        elements: elements,
        canvasBg: canvasBg,
        audio: audioFile,
        config: { 
          orientation: orientation,
          dimensions: getPublishDimensions ? getPublishDimensions() : { width: 1080, height: 1350 }
        }
      };

      const { error } = await supabase
        .from('products')
        .insert([
          {
            name: designName,
            content: designContent,
            category: category,
            image_url: previewDataURL || 'https://placehold.co/400x600?text=No+Preview',
            created_at: new Date().toISOString()
          }
        ]);

      if (error) throw error;
      
      alert("Design Published Successfully! 🎉");
      navigate("/admin-portal/all-products");

    } catch (err) {
      console.error("Publish error:", err);
      alert("Save Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans text-sm">
      
    
      <div className="h-auto md:h-14 bg-white border-b flex flex-col md:flex-row justify-between items-center px-4 py-2 md:py-0 z-50 shadow-sm gap-2">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button 
            onClick={() => setIsSidebarOpen(true)} 
            className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-700"
          >
            <Menu size={22} />
          </button>

          <button 
            onClick={() => navigate('/admin-portal/all-products')} 
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-blue-300 rounded px-2 py-1 w-full md:w-64 outline-none"
            placeholder="Design Name"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 p-1 rounded-lg border border-gray-200">
            <button 
              onClick={() => setOrientation("portrait")} 
              className={`p-2 rounded-md ${orientation === "portrait" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              <Smartphone size={14} />
            </button>
            <button 
              onClick={() => setOrientation("landscape")} 
              className={`p-2 rounded-md ${orientation === "landscape" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500'}`}
            >
              <Monitor size={14} />
            </button>
          </div>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="text-xs font-medium border-gray-200 rounded-lg bg-gray-50 px-2 py-1.5 outline-none"
          >
            <option value="Posters">Posters</option>
            <option value="Logos">Logos</option>
            <option value="Social Media">Social Media</option>
          </select>
          <button 
            onClick={handlePublish} 
            disabled={loading} 
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg font-bold flex items-center gap-2 shadow-md disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} 
            {loading ? "Publishing..." : "Publish"}
          </button>
        </div>
      </div>

      
      <div className="flex-1 flex overflow-hidden relative">
        
      
        <div className={`${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 fixed md:relative left-0 top-0 h-full w-64 md:w-20 bg-white z-50 shadow-xl md:shadow-none transition-transform duration-300`}>
          <div className="md:hidden flex justify-between items-center p-4 border-b">
            <h2 className="font-bold text-blue-600">Editor Tools</h2>
            <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg">
              <X size={24} />
            </button>
          </div>
          <Sidebar />
        </div>

        
        <div className="flex-1 bg-[#f1f5f9] relative overflow-hidden flex flex-col items-center justify-center">
          <CanvasArea />
        </div>

  
        {activeTool && (
          <div className="fixed md:relative inset-0 md:inset-auto z-[60] md:z-40 h-full w-full md:w-80 bg-white border-l shadow-2xl md:shadow-none overflow-y-auto">
             <div className="md:hidden flex justify-between items-center p-4 border-b bg-white sticky top-0">
               <h2 className="font-bold capitalize">{activeTool}</h2>
               <button onClick={() => setActiveTool(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                 <X size={24} />
               </button>
             </div>
             <ToolPanel isAdmin={true} />
          </div>
        )}
      </div>

      <LayerPannel />

      <input type="file" ref={imageInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} />
      <input type="file" ref={videoInputRef} className="hidden" accept="video/*" onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])} />
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*" onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])} />
    </div>
  );
};

export default NewProduct;