import React, { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ChevronLeft, Loader2, Monitor, Smartphone, Menu } from 'lucide-react';
import { CanvasContext } from "../../context/CanvasContext";
import { supabase } from "../../supabase/client";
import ToolPanel from "../editor/ToolPanel";
import CanvasArea from "../editor/CanvasArea";
import LayerPannel from "../editor/LayerPannel";
import Sidebar from "../editor/Sidebar";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const context = useContext(CanvasContext);

  if (!context) return null;

  const {
    elements, setElements, setCanvasBg, setAudioFile, audioFile,
    canvasBg, orientation, setOrientation, stageRef, getPublishDimensions,
    activeTool, setActiveTool, setIsSidebarOpen, setIsToolPanelOpen,
    imageInputRef, videoInputRef, audioInputRef, handleImageUpload,
    handleVideoUpload, handleAudioUpload,
  } = context;

  const [designName, setDesignName] = useState("");
  const [category, setCategory] = useState("Posters");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    setIsToolPanelOpen(!!activeTool);
  }, [activeTool, setIsToolPanelOpen]);

  useEffect(() => {
    const loadDesign = async () => {
      if (!id) return;
      setFetching(true);
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        if (data) {
          setDesignName(data.name || "Untitled Design");
          setCategory(data.category || "Posters");
          if (data.content) {
            if (data.content.config?.orientation) setOrientation(data.content.config.orientation);
            setCanvasBg(data.content.canvasBg || "#ffffff");
            setAudioFile(data.content.audio || null);
            setElements(data.content.elements || []);
          }
        }
      } catch (err) {
        console.error("Fetch Error:", err.message);
      } finally {
        setTimeout(() => setFetching(false), 500);
      }
    };
    loadDesign();
    return () => {
      setActiveTool(null);
      setElements([]); 
    };
  }, [id, setElements, setCanvasBg, setAudioFile, setOrientation, setActiveTool]);

  const handleUpdate = async () => {
    if (!designName.trim()) {
      alert("Please enter a name");
      return;
    }

    setLoading(true);
    try {
      setActiveTool(null);
      
      await new Promise(resolve => setTimeout(resolve, 500));

      const publishSize = getPublishDimensions ? getPublishDimensions() : { width: 1080, height: 1920 };
      
      let previewDataURL = "";
      if (stageRef.current) {
        previewDataURL = stageRef.current.toDataURL({
          pixelRatio: 1.5,
          mimeType: "image/png",
        });
      }

      const { error } = await supabase
        .from("products")
        .update({
          name: designName,
          content: {
            elements: elements.filter(Boolean),
            canvasBg,
            audio: audioFile,
            config: { orientation, dimensions: publishSize },
          },
          category,
          image_url: previewDataURL,
         
        })
        .eq("id", id);

      if (error) throw error;
      alert("Updated Successfully! 🎉");
      navigate("/admin-portal/all-products");
      
    } catch (err) {
      console.error(err);
      alert("Update Failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-[#f8fafc] overflow-hidden font-sans">
      <div className="h-auto md:h-14 bg-white border-b flex flex-col md:flex-row justify-between items-center px-4 py-2 md:py-0 z-50 shadow-sm gap-2">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <button onClick={() => setIsSidebarOpen(true)} className="md:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-700">
            <Menu size={22} />
          </button>
          <button onClick={() => navigate('/admin-portal/all-products')} className="p-2 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} className="text-gray-600" />
          </button>
          <input
            type="text"
            value={designName}
            onChange={(e) => setDesignName(e.target.value)}
            className="font-bold text-gray-800 bg-transparent border-b border-transparent focus:border-blue-300 rounded px-2 py-1 w-full md:w-64 outline-none text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          <div className="flex bg-gray-100 p-1 rounded-lg border">
            <button onClick={() => setOrientation("portrait")} className={`p-2 rounded ${orientation === "portrait" ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Smartphone size={14} /></button>
            <button onClick={() => setOrientation("landscape")} className={`p-2 rounded ${orientation === "landscape" ? 'bg-white shadow text-blue-600' : 'text-gray-500'}`}><Monitor size={14} /></button>
          </div>
          
          <button 
            onClick={handleUpdate} 
            disabled={loading || fetching} 
            className="bg-blue-600 text-white px-4 py-1.5 rounded-lg flex items-center gap-2 text-xs font-bold disabled:opacity-50 transition-all active:scale-95"
          >
            {loading ? <Loader2 className="animate-spin" size={12} /> : <Save size={12} />}
            {loading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden relative">
        <div className="hidden md:block w-20 border-r bg-white h-full"><Sidebar /></div>
        <div className="flex-1 flex flex-col relative bg-[#f1f5f9] items-center justify-center">
          {fetching ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/90 z-50">
              <div className="text-center">
                <Loader2 className="animate-spin text-blue-600 mx-auto mb-2" size={32} />
                <p className="text-sm text-gray-500 font-medium">Loading your design...</p>
              </div>
            </div>
          ) : <CanvasArea />}
        </div>
        {activeTool && !fetching && (
          <div className="hidden md:block w-80 border-l bg-white h-full overflow-y-auto"><ToolPanel
          isAdmin={true} /></div>
        )}
      </div>

      <LayerPannel />
      <input type="file" ref={imageInputRef} className="hidden" />
    </div>
  );
};

export default EditProduct;