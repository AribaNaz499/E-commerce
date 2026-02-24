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
    elements, setElements, setCanvasBg, setAudioFile, audioFile,
    canvasBg, orientation, setOrientation, stageRef, getPublishDimensions
  } = useContext(CanvasContext);

  const [designName, setDesignName] = useState("");
  const [category, setCategory] = useState("Posters");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

 // EditProduct.jsx ke useEffect ko is se replace karein:

useEffect(() => {
  const loadDesign = async () => {
    setFetching(true); // Loader start
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setDesignName(data.name);
      setCategory(data.category || "Posters");
      
      if (data.content) {
        // 1. Pehle non-canvas states set karein
        if (data.content.config) {
          setOrientation(data.content.config.orientation || "portrait");
        }
        setCanvasBg(data.content.canvasBg || "#ffffff");
        setAudioFile(data.content.audio || null);

        // 2. Elements ko filter karein
        const rawElements = data.content.elements || [];
        const fixedElements = rawElements.filter(el => el != null);

        // 🔥 CRITICAL FIX: 
        // Pehle loader ko band karein taake CanvasArea DOM mein aa jaye
        setFetching(false); 
        
        // Phir elements ko set karein ek chote delay ke saath
        setTimeout(() => {
          setElements(fixedElements);
          console.log("Elements rendered on edit page");
        }, 100); 
      }
    } catch (err) {
      console.error("Fetch Error:", err.message);
      setFetching(false);
    }
  };
  
  if (id) loadDesign();
}, [id]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const publishSize = getPublishDimensions();
      const previewDataURL = stageRef.current ? stageRef.current.toDataURL({ pixelRatio: 2 }) : "";
      
      const { error } = await supabase.from('products').update({
        name: designName,
        content: { elements, canvasBg, audio: audioFile, config: { orientation, dimensions: publishSize } },
        category,
        image_url: previewDataURL
      }).eq('id', id);

      if (error) throw error;
      alert("Updated! 🎉");
      navigate('/all-products');
    } catch (err) {
      alert("Update Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] overflow-hidden">
      {/* Header */}
      <div className="h-14 bg-white border-b flex justify-between items-center px-4 shrink-0">
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/all-products')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} />
          </button>
          <input value={designName} onChange={(e) => setDesignName(e.target.value)} className="font-bold outline-none" />
        </div>
        <button onClick={handleUpdate} disabled={loading} className="bg-blue-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-sm">
          {loading ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Update
        </button>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <ToolPanel />
          <div className="flex-1 bg-[#f1f5f9] relative flex items-center justify-center overflow-hidden">
            {fetching ? (
              <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50">
                <Loader2 className="animate-spin text-blue-600" size={40} />
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center p-10">
                 <CanvasArea />
              </div>
            )}
          </div>
        </div>
        <LayerPannel />
      </div>
    </div>
  );
};

export default EditProduct;