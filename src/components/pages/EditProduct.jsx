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
    setCanvasBg,
    setAudioFile,
    audioFile,
    canvasBg,
    orientation,
    setOrientation,
    stageRef,
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

  const [designName, setDesignName] = useState("");
  const [category, setCategory] = useState("Posters");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  useEffect(() => {
    if (activeTool) {
      setIsToolPanelOpen(true);
    } else {
      setIsToolPanelOpen(false);
    }
  }, [activeTool, setIsToolPanelOpen]);

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

        if (data.content) {
          if (data.content.config) {
            setOrientation(data.content.config.orientation || "portrait");
          }
          setCanvasBg(data.content.canvasBg || "#ffffff");
          setAudioFile(data.content.audio || null);

          // FIX: Removing the blob filter so video elements stay in the array
          const rawElements = data.content.elements || [];
          const fixedElements = rawElements.filter((el) => el != null);
          
          setFetching(false);

          setTimeout(() => {
            setElements(fixedElements);
          }, 100);
        } else {
          setFetching(false);
        }
      } catch (err) {
        console.error("Fetch Error:", err.message);
        setFetching(false);
      }
    };

    if (id) loadDesign();

    return () => {
      setActiveTool(null);
      setIsSidebarOpen(false);
      setIsToolPanelOpen(false);
    };
  }, [id, setElements, setCanvasBg, setAudioFile, setOrientation, setActiveTool, setIsSidebarOpen, setIsToolPanelOpen]);

  const handleUpdate = async () => {
    setLoading(true);
    try {
      const publishSize = getPublishDimensions();

      const previewDataURL = stageRef.current
        ? stageRef.current.toDataURL({ pixelRatio: 2 })
        : "";

      // FIX: Allowing all elements (including videos) to be saved
      const cleanedElements = elements.filter(Boolean);

      const { error } = await supabase
        .from("products")
        .update({
          name: designName,
          content: {
            elements: cleanedElements,
            canvasBg,
            audio: audioFile,
            config: {
              orientation,
              dimensions: publishSize,
            },
          },
          category,
          image_url: previewDataURL,
        })
        .eq("id", id);

      if (error) throw error;

      alert("Updated! 🎉");
      navigate("/all-products");
    } catch (err) {
      console.error(err);
      alert("Update Failed");
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
              className={`p-2 rounded-md transition-all ${orientation === "portrait" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              title="Portrait Mode"
            >
              <Smartphone size={14} />
            </button>
            <button
              onClick={() => setOrientation("landscape")}
              className={`p-2 rounded-md transition-all ${orientation === "landscape" ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
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
        {isSidebarOpen && (
          <>
            <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setIsSidebarOpen(false)} />
            <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 shadow-xl md:hidden">
              <div className="flex justify-between items-center p-4 border-b">
                <h2 className="font-bold text-purple-700">Tools</h2>
                <button onClick={() => setIsSidebarOpen(false)} className="p-1 hover:bg-gray-100 rounded-full">
                  <X size={20} />
                </button>
              </div>
              <div className="p-2"><Sidebar /></div>
            </div>
          </>
        )}

        <div className="hidden md:block md:static z-40 h-full w-20">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0 relative">
          {fetching ? (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50">
              <Loader2 className="animate-spin text-blue-600" size={40} />
            </div>
          ) : (
            <div className="flex-1 bg-[#f1f5f9] relative overflow-hidden">
              <CanvasArea />
            </div>
          )}
        </div>

        {activeTool && !fetching && (
          <div className="hidden md:block md:static z-40 h-full w-80">
            <ToolPanel />
          </div>
        )}

        {activeTool && !fetching && (
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
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
      />

      <input
        type="file"
        ref={videoInputRef}
        accept="video/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])}
      />

      <input
        type="file"
        ref={audioInputRef}
        accept="audio/*"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
      />
    </div>
  );
};

export default EditProduct;