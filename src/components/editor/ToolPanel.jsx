import React, { useContext } from "react";
import { X } from "lucide-react";
import { CanvasContext } from '../../context/CanvasContext.jsx';

const ToolPanel = () => {
  const {
    activeTool,
    setActiveTool,
    orientation,
    setOrientation,
    setCanvasBg,
    canvasBg,
    imageInputRef,
    videoInputRef,
    audioInputRef,
    handleImageUpload,
    handleVideoUpload,
    handleAudioUpload,
    addText,
    addSticker,
    setIsToolPanelOpen
  } = useContext(CanvasContext);

  if (!activeTool) return null;

  const stickerList = ["⭐", "🔥", "❤️", "✅", "🚀", "✨", "🎈", "🎂", "🐱", "🐶", "🌈", "⭐"];
  const colors = ["#ffffff", "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc", "#f472b6", "#000000"];

  const handleClose = () => {
    setActiveTool(null);
    setIsToolPanelOpen(false);
  };

  const triggerImageUpload = () => imageInputRef.current?.click();
  const triggerVideoUpload = () => videoInputRef.current?.click();
  const triggerAudioUpload = () => audioInputRef.current?.click();

  const renderContent = () => {
    switch(activeTool) {
      case 'layout':
        return (
          <div className="space-y-6">
            <div className="flex gap-3">
              <button 
                onClick={() => setOrientation("portrait")} 
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                  orientation === 'portrait' 
                    ? 'border-purple-600 text-purple-600 bg-purple-50' 
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                Portrait
              </button>
              <button 
                onClick={() => setOrientation("landscape")} 
                className={`flex-1 py-3 rounded-xl border-2 font-bold transition-all ${
                  orientation === 'landscape' 
                    ? 'border-purple-600 text-purple-600 bg-purple-50' 
                    : 'border-slate-200 hover:border-purple-300'
                }`}
              >
                Landscape
              </button>
            </div>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color, i) => (
                <button 
                  key={i} 
                  onClick={() => setCanvasBg(color)} 
                  className={`aspect-square rounded-xl border-2 transition-all hover:scale-105 ${
                    canvasBg === color 
                      ? 'border-purple-600 ring-2 ring-purple-200' 
                      : 'border-slate-200 hover:border-purple-300'
                  }`} 
                  style={{ backgroundColor: color }} 
                />
              ))}
            </div>
          </div>
        );
      
      case 'text':
        return (
          <button 
            onClick={() => {
              addText();
              if (window.innerWidth < 768) handleClose();
            }} 
            className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
          >
            Add New Text
          </button>
        );
      
      case 'sticker':
        return (
          <div className="grid grid-cols-4 gap-2">
            {stickerList.map((s, i) => (
              <button 
                key={i} 
                onClick={() => {
                  addSticker(s);
                  if (window.innerWidth < 768) handleClose();
                }} 
                className="aspect-square flex items-center justify-center border rounded-xl hover:border-purple-500 hover:bg-purple-50 text-3xl transition-all hover:scale-105"
              >
                {s}
              </button>
            ))}
          </div>
        );
      
      case 'image':
        return (
          <div 
            onClick={triggerImageUpload} 
            className="p-10 border-3 border-dashed border-purple-200 rounded-2xl text-center cursor-pointer hover:bg-purple-50 transition-all hover:border-purple-400"
          >
            <p className="text-sm font-bold text-purple-700">Click to upload Image</p>
            <p className="text-xs text-slate-400 mt-1">PNG, JPG, GIF</p>
          </div>
        );
      
      case 'video':
        return (
          <div 
            onClick={triggerVideoUpload} 
            className="p-10 border-3 border-dashed border-purple-200 rounded-2xl text-center cursor-pointer hover:bg-purple-50 transition-all hover:border-purple-400"
          >
            <p className="text-sm font-bold text-purple-700">Click to upload Video</p>
            <p className="text-xs text-slate-400 mt-1">MP4, WebM, MOV</p>
          </div>
        );
      
      case 'music':
        return (
          <div 
            onClick={triggerAudioUpload} 
            className="p-10 border-3 border-dashed border-purple-200 rounded-2xl text-center cursor-pointer hover:bg-purple-50 transition-all hover:border-purple-400"
          >
            <p className="text-sm font-bold text-purple-700">Click to upload Audio</p>
            <p className="text-xs text-slate-400 mt-1">MP3, WAV, OGG</p>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white border-l border-slate-200 flex flex-col">
      
      <input 
        type="file" 
        ref={imageInputRef} 
        className="hidden" 
        accept="image/*" 
        onChange={(e) => handleImageUpload(e.target.files[0])} 
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        className="hidden" 
        accept="video/*" 
        onChange={(e) => handleVideoUpload(e.target.files[0])} 
      />
      <input 
        type="file" 
        ref={audioInputRef} 
        className="hidden" 
        accept="audio/*" 
        onChange={handleAudioUpload} 
      />

      <div className="hidden md:flex p-4 border-b justify-between items-center bg-gradient-to-r from-purple-50 to-white shrink-0">
        <h2 className="font-bold text-lg text-purple-700 capitalize">{activeTool}</h2>
        <button 
          onClick={handleClose} 
          className="hover:bg-purple-100 p-2 rounded-full transition-all"
        >
          <X size={20} className="text-purple-600" />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default ToolPanel;