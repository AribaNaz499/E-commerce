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
    getPublishDimensions,
    activeTool,
    setActiveTool,
    isSidebarOpen,
    setIsSidebarOpen,
    isToolPanelOpen,
    setIsToolPanelOpen,
    imageInputRef,
    videoInputRef,
    audioInputRef,
    handleImageUpload,
    handleVideoUpload,
    handleAudioUpload,
    selectedId  
  } = useContext(CanvasContext);

  const [designName, setDesignName] = useState("Untitled Design");
  const [category, setCategory] = useState("Posters");
  const [loading, setLoading] = useState(false);

  
  useEffect(() => {
    console.log("Active Tool changed:", activeTool);
    if (activeTool) {
      setIsToolPanelOpen(true);
    } else {
      setIsToolPanelOpen(false);
    }
  }, [activeTool, setIsToolPanelOpen]);

  
  useEffect(() => {
    setElements([]);
    setCanvasBg("#ffffff");
    setAudioFile(null);
    setOrientation("portrait");
    setActiveTool(null);
    setIsSidebarOpen(false);
    setIsToolPanelOpen(false);
  }, [setElements, setCanvasBg, setAudioFile, setOrientation, setActiveTool, setIsSidebarOpen, setIsToolPanelOpen]);

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
    
      <div className="h-auto md:h-14 bg-white border-b flex flex-col md:flex-row justify-between items-center px-4 py-2 md:py-0 z-50 shadow-sm gap-2">
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

  
      <div className="flex-1 flex overflow-hidden relative">
      
        {isSidebarOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl md:hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-purple-700">Tools</h2>
                <button 
                  onClick={() => setIsSidebarOpen(false)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>
              <div className="p-2">
                <Sidebar />
              </div>
            </div>
          </>
        )}

        
        <div className="hidden md:block md:static z-40 h-full w-20">
          <Sidebar />
        </div>

        
        <div className="flex-1 flex flex-col min-w-0 relative">
          <div className="flex-1 bg-[#f1f5f9] relative overflow-hidden">
            <CanvasArea />
          </div>
        </div>

       
        {activeTool && (
          <div className="hidden md:block md:static z-40 h-full w-80">
            <ToolPanel />
          </div>
        )}

       
        {activeTool && (
          <div className="md:hidden fixed inset-0 z-50 bg-white overflow-auto pt-16">
            <div className="fixed top-0 left-0 right-0 bg-white border-b z-10 p-4 flex justify-between items-center">
              <h2 className="font-bold text-lg text-purple-700 capitalize">{activeTool}</h2>
              <button 
                onClick={() => {
                  setActiveTool(null);
                  setIsToolPanelOpen(false);
                }}
                className="p-2 hover:bg-gray-100 rounded-full"
              >
                <X size={20} />
              </button>
            </div>
            <div className="pt-16 p-4">
              <ToolPanel />
            </div>
          </div>
        )}
      </div>

      <LayerPannel />

      <input 
        type="file" 
        ref={imageInputRef} 
        accept="image/*" 
        style={{ display: 'none' }} 
        onChange={(e) => {
          console.log("🖼️ Image selected:", e.target.files?.[0]);
          if (e.target.files?.[0]) {
            handleImageUpload(e.target.files[0]);
          }
        }} 
      />

      <input 
        type="file" 
        ref={videoInputRef} 
        accept="video/*" 
        style={{ display: 'none' }} 
        onChange={(e) => {
          console.log("🎬 Video selected:", e.target.files?.[0]);
          if (e.target.files?.[0]) {
            handleVideoUpload(e.target.files[0]);
          }
        }} 
      />

      <input 
        type="file" 
        ref={audioInputRef} 
        accept="audio/*" 
        style={{ display: 'none' }} 
        onChange={(e) => {
          console.log("🎵 Audio selected:", e.target.files?.[0]);
          if (e.target.files?.[0]) {
            handleAudioUpload(e.target.files[0]);
          }
        }} 
      />
    </div>
  );
};

export default NewProduct;