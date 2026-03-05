import React, { useContext } from "react";
import { X, Music, Video, Image as ImageIcon, Smartphone, Monitor } from "lucide-react";
import { CanvasContext } from "../../context/CanvasContext";

const ToolPanel = ({ isAdmin = false }) => {
  const {
    activeTool,
    setActiveTool,
    canvasBg,
    setCanvasBg,
    orientation,
    setOrientation,
    imageInputRef,
    videoInputRef,
    audioInputRef,
    handleImageUpload,
    handleVideoUpload,
    handleAudioUpload,
    addText,
    addSticker,
    setIsToolPanelOpen,
  } = useContext(CanvasContext);

  if (!activeTool) return null;

  const colors = ["#ffffff", "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc", "#f472b6", "#000000"];

const stickers = [
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Panda/3D/panda_3d.png",           // Panda
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Cat%20face/3D/cat_face_3d.png",   // Cat
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rabbit%20face/3D/rabbit_face_3d.png", // Rabbit
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Unicorn/3D/unicorn_3d.png",       // Unicorn
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Star/3D/star_3d.png",             // Star
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Heart%20with%20ribbon/3D/heart_with_ribbon_3d.png", // Heart
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Smiling%20face%20with%20hearts/3D/smiling_face_with_hearts_3d.png", // Cute Face
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Party%20popper/3D/party_popper_3d.png", // Party
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Crown/3D/crown_3d.png",           // Crown
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Balloon/3D/balloon_3d.png",       // Balloon
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Birthday%20cake/3D/birthday_cake_3d.png", // Cake
  "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sun/3D/sun_3d.png"                // Sun
];
  const handleClose = () => {
    setActiveTool(null);
    setIsToolPanelOpen(false);
  };

  const triggerImageUpload = () => imageInputRef.current?.click();
  const triggerVideoUpload = () => videoInputRef.current?.click();
  const triggerAudioUpload = () => audioInputRef.current?.click();

  const renderContent = () => {
    switch (activeTool) {
    case "layout":
      return (
        <div className="space-y-6">
          {isAdmin && (
            <div>
              <p className="text-sm text-gray-500 mb-3">Orientation:</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setOrientation("portrait")}
                  className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 ${
                    orientation === "portrait" 
                      ? "border-purple-600 bg-purple-50 text-purple-600" 
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <Smartphone size={20} />
                  <span>Portrait</span>
                </button>
                <button
                  onClick={() => setOrientation("landscape")}
                  className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 ${
                    orientation === "landscape" 
                      ? "border-purple-600 bg-purple-50 text-purple-600" 
                      : "border-gray-200 hover:border-purple-300"
                  }`}
                >
                  <Monitor size={20} />
                  <span>Landscape</span>
                </button>
              </div>
            </div>
          )}

          <div>
            <p className="text-sm text-gray-500 mb-3">Background Color:</p>
            <div className="grid grid-cols-4 gap-3">
              {colors.map((color, i) => (
                <button
                  key={i}
                  onClick={() => setCanvasBg(color)}
                  className={`aspect-square rounded-xl border-2 hover:scale-105 transition-transform ${
                    canvasBg === color ? "border-purple-600 scale-105" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>
        </div>
      );

      case "text":
        return (
          <button 
            onClick={addText} 
            className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
          >
            Add New Text
          </button>
        );

      case "image":
        return (
          <div 
            onClick={triggerImageUpload} 
            className="p-10 border-4 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors text-center"
          >
            <ImageIcon className="mx-auto mb-2 text-purple-600" size={32} />
            <p className="text-gray-600">Click to upload Image</p>
            <p className="text-xs text-gray-400 mt-1">Double-click image to crop</p>
          </div>
        );

      case "sticker":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-3">Choose a sticker:</p>
            <div className="grid grid-cols-3 gap-3">
              {stickers.map((sticker, i) => (
                <button
                  key={i}
                  onClick={() => addSticker(sticker)}
                  className="aspect-square p-2 bg-gray-50 rounded-xl border hover:border-purple-500 hover:scale-105 transition-all"
                >
                  <img src={sticker} alt={`sticker-${i}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Or upload your own:</p>
              <button
                onClick={triggerImageUpload}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                Upload Sticker
              </button>
            </div>
          </div>
        );

      case "music":
      case "audio":
        return (
          <div 
            onClick={triggerAudioUpload} 
            className="p-10 border-4 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-50 transition-colors text-center"
          >
            <Music className="mx-auto mb-2 text-green-600" size={32} />
            <p className="text-gray-600">Click to upload Audio</p>
            <p className="text-xs text-gray-400 mt-1">QR code will be generated</p>
          </div>
        );

      case "video":
        return (
          <div 
            onClick={triggerVideoUpload} 
            className="p-10 border-4 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors text-center"
          >
            <Video className="mx-auto mb-2 text-blue-600" size={32} />
            <p className="text-gray-600">Click to upload Video</p>
            <p className="text-xs text-gray-400 mt-1">QR code will be generated</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white border-l flex flex-col shadow-lg w-80">
      <input
        type="file"
        ref={imageInputRef}
        className="hidden"
        accept="image/*"
        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
      />
      <input
        type="file"
        ref={videoInputRef}
        className="hidden"
        accept="video/*"
        onChange={(e) => e.target.files[0] && handleVideoUpload(e.target.files[0])}
      />
      <input
        type="file"
        ref={audioInputRef}
        className="hidden"
        accept="audio/*"
        onChange={(e) => e.target.files[0] && handleAudioUpload(e.target.files[0])}
      />

      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-bold text-lg capitalize">{activeTool === "music" ? "Audio" : activeTool}</h2>
        <button 
          onClick={handleClose}
          className="p-1 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default ToolPanel;