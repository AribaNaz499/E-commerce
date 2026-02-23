import React, { useContext } from "react";
import { X, Type, Music, Image as ImageIcon, Crop, Layout } from "lucide-react";
import { CanvasContext } from '../../context/CanvasContext.jsx';

const ToolPanel = () => {
  const {
    activeTool,
    setActiveTool,
    selectedId,
    elements,
    setElements,
    orientation,
    setOrientation,
    setCanvasBg,
    imageInputRef,
    handleImageUpload,
    audioFile,
    setAudioFile,
    audioInputRef, 
    handleAudioUpload,
    isPlaying,
    setIsPlaying,
    deleteElement,
    cropMode,
    setCropMode
  } = useContext(CanvasContext);

  
  const selectedElement = elements.find(el => el.id === selectedId);

  const handleCropClick = () => {
    if (selectedElement && selectedElement.type === 'image') {
      setActiveTool('crop');
      setCropMode(true);
    } else {
      alert('Please select an image first');
    }
  };

  const handleApplyCrop = () => {
    setCropMode(false);
    setActiveTool(null);
  };

  const handleCancelCrop = () => {
    setCropMode(false);
    setActiveTool(null);
  };

  if (!activeTool && !cropMode) return null;

  return (
    <div className="fixed md:absolute left-0 md:left-[80px] top-0 w-full md:w-72 h-full bg-white shadow-xl z-[90] border-r border-slate-200 flex flex-col">
      
  
      <div className="flex justify-between items-center p-4 md:p-5 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">
            {cropMode ? 'CROP IMAGE' : activeTool}
          </span>
          {selectedId && !cropMode && (
            <button 
              onClick={() => deleteElement()}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button onClick={() => {
          setActiveTool(null);
          setCropMode(false);
        }} className="p-1.5 hover:bg-slate-100 rounded-full">
          <X size={18} className="text-slate-400" />
        </button>
      </div>

    
      <div className="flex-1 overflow-y-auto p-4 md:p-5">
        
      
        {cropMode && (
          <div className="space-y-6">
            <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-200">
              <p className="text-sm font-medium text-yellow-800 mb-2">✨ Crop Mode Active</p>
              <p className="text-xs text-yellow-600">Drag the corners to adjust crop area</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleApplyCrop}
                className="py-3 bg-green-600 text-white rounded-lg font-bold text-sm hover:bg-green-700 transition-all"
              >
                ✓ Apply Crop
              </button>
              <button
                onClick={handleCancelCrop}
                className="py-3 bg-gray-200 text-gray-700 rounded-lg font-bold text-sm hover:bg-gray-300 transition-all"
              >
                ✕ Cancel
              </button>
            </div>

            <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
              <p className="text-xs text-blue-700">
                <span className="font-bold">Tip:</span> Double-click on image to enter crop mode anytime
              </p>
            </div>
          </div>
        )}

      
        {!cropMode && activeTool === "image" && (
          <div className="space-y-4">
            <input 
              type="file" 
              ref={imageInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  handleImageUpload(file);
                }
              }} 
            />

            <div
              onClick={() => imageInputRef.current?.click()}
              className="p-6 md:p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100">
                <ImageIcon className="text-purple-500" size={20} />
              </div>
              <p className="text-sm font-bold text-slate-600">Upload from Computer</p>
              <p className="text-[10px] md:text-[11px] text-slate-400 mt-1">PNG, JPG or SVG</p>
            </div>

            {/* Crop option for images */}
            {selectedElement?.type === 'image' && (
              <button
                onClick={handleCropClick}
                className="w-full py-3 bg-yellow-500 text-white rounded-lg font-bold text-sm hover:bg-yellow-600 transition-all flex items-center justify-center gap-2"
              >
                <Crop size={16} /> Crop This Image
              </button>
            )}
          </div>
        )}

        {!cropMode && activeTool === "layout" && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase">Orientation</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrientation("portrait")}
                  className={`flex-1 py-2 md:py-3 rounded-xl border-2 text-xs font-bold ${orientation === 'portrait' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-slate-100 text-slate-400'}`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation("landscape")}
                  className={`flex-1 py-2 md:py-3 rounded-xl border-2 text-xs font-bold ${orientation === 'landscape' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-slate-100 text-slate-400'}`}
                >
                  Landscape
                </button>
              </div>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase">Background Color</p>
              <div className="grid grid-cols-4 gap-2">
                {["#ffffff", "#f8fafc", "#fee2e2", "#dcfce7", "#dbeafe", "#fef9c3", "#f3e8ff", "#000000"].map(color => (
                  <button
                    key={color}
                    onClick={() => setCanvasBg(color)}
                    className="w-full aspect-square rounded-full border border-slate-200"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

        {!cropMode && activeTool === "text" && (
          <button
            onClick={() => {
              const newText = {
                id: `text-${Date.now()}`,
                type: "text",
                text: "Double-click to edit",
                x: 100, 
                y: 100, 
                fontSize: 24, 
                fill: "#333", 
                draggable: true,
                rotation: 0
              };
              setElements([...elements, newText]);
              setActiveTool(null);
            }}
            className="w-full py-4 bg-purple-50 text-purple-600 rounded-xl font-bold border-2 border-purple-100 hover:bg-purple-100 transition-all"
          >
            + Add New Text
          </button>
        )}

        {!cropMode && activeTool === "sticker" && (
          <div className="flex flex-col h-full space-y-4">
            <p className="text-[10px] font-bold text-slate-400 mb-3 tracking-wider uppercase">
              Sticker Gallery
            </p>
            <div className="flex-1 grid grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar pb-10">
              {[
                "https://konvajs.org/assets/lion.png",
                "https://cdn-icons-png.flaticon.com/512/2584/2584602.png",
                "https://cdn-icons-png.flaticon.com/512/2584/2584606.png",
                "https://cdn-icons-png.flaticon.com/512/2584/2584644.png",
                "https://cdn-icons-png.flaticon.com/512/4149/4149883.png",
                "https://cdn-icons-png.flaticon.com/512/4149/4149882.png",
              ].map((url, index) => (
                <button
                  key={index}
                  onClick={() => {
                    const newSticker = {
                      id: `sticker-${Date.now()}-${index}`,
                      type: "image",
                      src: url,
                      x: 100,
                      y: 100,
                      width: 120,
                      height: 120,
                      rotation: 0,
                      draggable: true
                    };
                    setElements([...elements, newSticker]);
                  }}
                  className="p-2 border border-slate-100 rounded-xl hover:bg-purple-50 hover:border-purple-200 transition-all bg-white shadow-sm h-fit"
                >
                  <img 
                    src={url} 
                    alt="sticker" 
                    className="w-full aspect-square object-contain" 
                  />
                </button>
              ))}
            </div>
          </div>
        )}

        {!cropMode && activeTool === "music" && (
          <div className="space-y-4">
            <input 
              type="file" 
              ref={audioInputRef} 
              className="hidden" 
              accept="audio/*" 
              onChange={handleAudioUpload} 
            />

            <div
              onClick={() => audioInputRef.current?.click()}
              className="p-6 md:p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group flex flex-col items-center justify-center"
            >
              <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100">
                <Music className="text-purple-500" size={20} />
              </div>
              <p className="text-sm font-bold text-slate-600">UPLOAD MP3</p>
              <p className="text-[10px] md:text-[11px] text-slate-400 mt-1">Background music file</p>
            </div>

            {audioFile && (
              <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                <p className="text-xs font-medium text-purple-700 mb-1">Current Audio:</p>
                <p className="text-sm text-slate-600 truncate">{audioFile.name}</p>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => setIsPlaying(!isPlaying)}
                    className="flex-1 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold hover:bg-purple-700"
                  >
                    {isPlaying ? 'Pause' : 'Play'}
                  </button>
                  <button
                    onClick={() => setAudioFile(null)}
                    className="px-3 py-2 bg-red-100 text-red-600 rounded-lg text-xs font-bold hover:bg-red-200"
                  >
                    Remove
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolPanel;