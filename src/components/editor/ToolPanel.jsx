
import React, { useContext } from "react";
import { X, Type, Music, Image as ImageIcon } from "lucide-react";
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
    deleteElement  
  } = useContext(CanvasContext);

  if (!activeTool) return null;

  return (
    <div className="absolute left-0 top-0 w-72 bg-white h-full shadow-xl z-[90] border-r border-slate-200 flex flex-col animate-in slide-in-from-left duration-300">
      
      
      <div className="flex justify-between items-center p-5 border-b border-slate-50">
        <div className="flex items-center gap-3">
          <span className="font-bold text-slate-400 uppercase text-[10px] tracking-widest">
            {activeTool}
          </span>
          {selectedId && (
            <button 
              onClick={() => deleteElement()}
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-all"
            >
              <X size={18} />
            </button>
          )}
        </div>
        <button onClick={() => setActiveTool(null)} className="p-1.5 hover:bg-slate-100 rounded-full">
          <X size={18} className="text-slate-400" />
        </button>
      </div>
  
    
      <div className="flex-1 overflow-y-auto p-5">
        
  
        {activeTool === "image" && (
          <div className="space-y-4">
          
            <input 
              type="file" 
              ref={imageInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  console.log("File selected:", file.name);
                  handleImageUpload(file);
                }
              }} 
            />

            
            <div
              onClick={() => {
                console.log("Upload box clicked!"); 
                if (imageInputRef.current) {
                  imageInputRef.current.click();
                } else {
                  console.error("imageInputRef is null! Check CanvasContext.jsx");
                }
              }}
              className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100">
                <ImageIcon className="text-purple-500" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-600">Upload from Computer</p>
              <p className="text-[11px] text-slate-400 mt-1">PNG, JPG or SVG</p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
               <p className="text-[10px] text-slate-500">
                 <span className="font-bold text-purple-600">Tip:</span> Resize and rotate the image directly on the canvas.
               </p>
            </div>
          </div>
        )}

  
        {activeTool === "layout" && (
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 mb-3 uppercase">Orientation</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setOrientation("portrait")}
                  className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold ${orientation === 'portrait' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-slate-100 text-slate-400'}`}
                >
                  Portrait
                </button>
                <button
                  onClick={() => setOrientation("landscape")}
                  className={`flex-1 py-3 rounded-xl border-2 text-xs font-bold ${orientation === 'landscape' ? 'border-purple-600 bg-purple-50 text-purple-600' : 'border-slate-100 text-slate-400'}`}
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

      
      
{activeTool === "text" && (
  <button
    onClick={() => {
      console.log("Adding new text...");
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
      console.log("Text added:", newText);
      setActiveTool(null);
    }}
    className="w-full py-4 bg-purple-50 text-purple-600 rounded-xl font-bold border-2 border-purple-100 hover:bg-purple-100 transition-all"
  >
    + Add New Text
  </button>
)}

  
        {activeTool === "sticker" && (
          <div className="flex flex-col h-full space-y-4">
            <div className="flex-none">
              <p className="text-[10px] font-bold text-slate-400 mb-3 tracking-wider uppercase">
                Sticker Gallery
              </p>
            </div>
            
            <div className="flex-1 grid grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar pb-10">
              {[
                "https://konvajs.org/assets/lion.png",
                "https://cdn-icons-png.flaticon.com/512/2584/2584602.png",
                "https://cdn-icons-png.flaticon.com/512/2584/2584606.png",
                "https://cdn-icons-png.flaticon.com/512/2584/2584644.png",
                "https://cdn-icons-png.flaticon.com/512/4149/4149883.png",
                "https://cdn-icons-png.flaticon.com/512/4149/4149882.png",
                "https://cdn-icons-png.flaticon.com/512/1791/1791330.png",
                "https://cdn-icons-png.flaticon.com/512/742/742751.png",
                "https://cdn-icons-png.flaticon.com/512/2907/2907301.png",
                "https://cdn-icons-png.flaticon.com/512/2436/2436977.png",
                "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
                "https://cdn-icons-png.flaticon.com/512/2909/2909773.png",
                "https://cdn-icons-png.flaticon.com/512/1212/1212173.png",
                "https://cdn-icons-png.flaticon.com/512/1271/1271314.png",
                "https://cdn-icons-png.flaticon.com/512/1041/1041883.png",
                "https://cdn-icons-png.flaticon.com/512/1152/1152912.png"
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

      
        {activeTool === "music" && (
          <div className="space-y-4">
          
            <input 
              type="file" 
              ref={audioInputRef} 
              className="hidden" 
              accept="audio/*" 
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  console.log("Audio selected:", file.name);
                  handleAudioUpload(e);
                }
              }} 
            />

            
            <div
              onClick={() => {
                console.log("Audio upload clicked!"); 
                if (audioInputRef.current) {
                  audioInputRef.current.click();
                } else {
                  console.error("audioInputRef is null! Check CanvasContext.jsx");
                }
              }}
              className="p-10 border-2 border-dashed border-slate-200 rounded-2xl text-center cursor-pointer hover:border-purple-400 hover:bg-purple-50 transition-all group flex flex-col items-center justify-center"
            >
              <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3 group-hover:bg-purple-100">
                <Music className="text-purple-500" size={24} />
              </div>
              <p className="text-sm font-bold text-slate-600">UPLOAD MP3</p>
              <p className="text-[11px] text-slate-400 mt-1">Background music file</p>
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

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
              <p className="text-[10px] text-slate-500">
                <span className="font-bold text-purple-600">Tip:</span> Drag the audio player on canvas to position it. Click play/pause to control playback.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ToolPanel;