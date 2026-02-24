import React, { useContext } from "react";
import { X, ImageIcon, Video, Music, Smile, Layout, Type, Palette } from "lucide-react";
import { CanvasContext } from '../../context/CanvasContext.jsx';

const ToolPanel = () => {
  const {
    activeTool, setActiveTool,
    orientation, setOrientation, setCanvasBg, canvasBg,
    imageInputRef, handleImageUpload, videoInputRef, handleVideoUpload,
    audioInputRef, handleAudioUpload, addText, addSticker
  } = useContext(CanvasContext);

  if (!activeTool) return null;

  const stickerList = [
    "⭐", "🔥", "❤️", "✅", "🚀", "✨", "🎈", "🎂", "🐱", "🐶", "🌈", "⭐"
  ];

  const colors = [
    "#ffffff", "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc", "#f472b6", "#000000"
  ];

  return (
    <div className="w-80 h-full bg-white border-r border-slate-200 flex flex-col z-[100] shadow-lg">
      {/* Header */}
      <div className="p-4 border-b flex justify-between items-center bg-gradient-to-r from-purple-50 to-white">
        <h2 className="font-bold text-lg text-purple-700 capitalize">{activeTool}</h2>
        <button 
          onClick={() => setActiveTool(null)} 
          className="hover:bg-purple-100 p-2 rounded-full transition-all"
        >
          <X size={20} className="text-purple-600" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        
        {/* TEXT SECTION */}
        {activeTool === "text" && (
          <div className="space-y-4">
            <button
              onClick={addText}
              className="w-full py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-bold hover:from-purple-600 hover:to-purple-700 transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Type size={20} />
              Add New Text
            </button>
          </div>
        )}
        
        {/* STICKER SECTION */}
        {activeTool === "sticker" && (
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Choose Sticker</p>
            <div className="grid grid-cols-4 gap-2">
              {stickerList.map((s, i) => (
                <button 
                  key={i} 
                  onClick={() => addSticker(s)}
                  className="aspect-square flex items-center justify-center border rounded-xl hover:border-purple-500 hover:bg-purple-50 text-3xl transition-all hover:scale-105"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* LAYOUT SECTION - WITH COLORS ADDED */}
        {activeTool === "layout" && (
          <div className="space-y-6">
            {/* Orientation */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Orientation</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => setOrientation("portrait")} 
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    orientation === 'portrait' 
                      ? 'border-purple-600 text-purple-600 bg-purple-50 shadow-md' 
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  Portrait
                </button>
                <button 
                  onClick={() => setOrientation("landscape")} 
                  className={`flex-1 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                    orientation === 'landscape' 
                      ? 'border-purple-600 text-purple-600 bg-purple-50 shadow-md' 
                      : 'border-slate-200 hover:border-purple-300'
                  }`}
                >
                  Landscape
                </button>
              </div>
            </div>

            {/* 🎨 COLORS - Added here */}
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Background Color</p>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setCanvasBg(color)}
                    className={`aspect-square rounded-xl border-2 transition-all hover:scale-105 ${
                      canvasBg === color ? 'border-purple-600 ring-2 ring-purple-200' : 'border-slate-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
              
              <div className="mt-3">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Custom Color</p>
                <input
                  type="color"
                  value={canvasBg}
                  onChange={(e) => setCanvasBg(e.target.value)}
                  className="w-full h-12 rounded-xl cursor-pointer border-2 border-slate-200"
                />
              </div>
            </div>
          </div>
        )}

        {/* COLORS SECTION - Remove kiya kyunke layout mein add kar diya */}
        {/* UPLOAD SECTIONS */}
        {(activeTool === "image" || activeTool === "video" || activeTool === "music") && (
          <div className="space-y-4">
            <div 
              onClick={() => {
                if (activeTool === "image") imageInputRef.current?.click();
                if (activeTool === "video") videoInputRef.current?.click();
                if (activeTool === "music") audioInputRef.current?.click();
              }}
              className="p-10 border-3 border-dashed border-purple-200 rounded-2xl text-center cursor-pointer hover:border-purple-500 transition-all bg-purple-50/30 hover:bg-purple-50"
            >
              {activeTool === "image" && <ImageIcon size={48} className="mx-auto text-purple-500 mb-3" />}
              {activeTool === "video" && <Video size={48} className="mx-auto text-purple-500 mb-3" />}
              {activeTool === "music" && <Music size={48} className="mx-auto text-purple-500 mb-3" />}
              <p className="text-sm font-bold text-purple-700">Click to upload {activeTool}</p>
              <p className="text-xs text-slate-400 mt-1">PNG, JPG, MP4, MP3</p>
            </div>

            <input 
              type="file" 
              ref={imageInputRef} 
              className="hidden" 
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])} 
            />
            <input 
              type="file" 
              ref={videoInputRef} 
              className="hidden" 
              accept="video/*"
              onChange={(e) => e.target.files?.[0] && handleVideoUpload(e.target.files[0])} 
            />
            <input 
              type="file" 
              ref={audioInputRef} 
              className="hidden" 
              accept="audio/*"
              onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])} 
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolPanel;