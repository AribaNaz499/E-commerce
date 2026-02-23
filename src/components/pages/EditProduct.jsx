import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Loader2, Monitor, Smartphone, Menu, X } from 'lucide-react';

import { CanvasContext } from "../../context/CanvasContext";
import { supabase } from "../../supabase/client";
import ToolPanel from "../editor/ToolPanel";
import CanvasArea from "../editor/CanvasArea";
import LayerPannel from "../editor/LayerPannel";
import Sidebar from "../editor/Sidebar";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    elements, 
    setElements, 
    canvasBg, 
    setCanvasBg, 
    setAudioFile, 
    audioFile,
    orientation,
    setOrientation,
    stageRef,
    getPublishDimensions
  } = useContext(CanvasContext);

  const [designName, setDesignName] = useState("");
  const [category, setCategory] = useState("Posters");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load design data 
  useEffect(() => {
    const loadDesign = async () => {
      setFetching(true);
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        setDesignName(data.name);
        setCategory(data.category || "Posters");
        
        if (data.content && data.content.config) {
          const savedOrientation = data.content.config.orientation || "portrait";
          setOrientation(savedOrientation);
        }
        
        if (data.content) {
          const rawElements = data.content.elements || [];
          const validElements = rawElements.filter(el => el != null);
          
          const fixedElements = validElements.map(el => {
            if (el.type === 'text' && !el.text) {
              return { ...el, text: 'Text' };
            }
            return el;
          });
          
          setElements(fixedElements);
          setCanvasBg(data.content.canvasBg || "#ffffff");
          setAudioFile(data.content.audio || null);
        }
      } catch (err) {
        console.error("Fetch Error:", err.message);
        alert("Error loading design: " + err.message);
      } finally {
        setFetching(false);
      }
    };
    
    if (id) loadDesign();
  }, [id, setElements, setCanvasBg, setAudioFile, setOrientation]);

  const handleUpdate = async () => {
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
      
      const { error } = await supabase
        .from('products')
        .update({
          name: designName, 
          content: designContent, 
          category: category, 
          image_url: previewDataURL
        })
        .eq('id', id);

      if (error) throw error;
      
      alert("Design Updated Successfully! 🎉");
      navigate('/all-products');
      
    } catch (err) {
      console.error("Update Error:", err);
      alert("Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="h-screen flex items-center justify-center bg-white">
        <Loader2 className="animate-spin text-blue-600" size={50} />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans relative select-none">

      
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
              onClick={handleUpdate} 
              disabled={loading} 
              className="bg-[#3b82f6] hover:bg-[#2563eb] text-white px-3 py-1.5 rounded-lg font-bold flex items-center gap-1 text-xs shadow-md disabled:opacity-50"
            >
              {loading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        
        
        <div className={`absolute md:relative z-[150] h-full bg-white transition-all duration-300 border-r ${
          isSidebarOpen ? 'left-0 shadow-2xl' : '-left-full md:left-0'
        } w-[280px] md:w-auto`}>
          
          <div className="flex justify-between items-center p-4 border-b md:hidden bg-gray-50">
            <span className="font-bold text-gray-700 text-sm">Design Tools</span>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="p-2 bg-white border rounded-full hover:bg-red-50"
            >
              <X size={18} />
            </button>
          </div>
          
          <Sidebar />
        </div>

        {isSidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/40 z-[140] md:hidden" 
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        <div className="flex-1 flex flex-col overflow-hidden">
          <ToolPanel />
          
          <div className="flex-1 flex overflow-hidden">
            <div className="flex-1 flex justify-center items-center overflow-auto bg-[#f1f5f9]">
              <CanvasArea />
            </div>
            
            <div className="hidden xl:block">
              <LayerPannel />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditProduct;