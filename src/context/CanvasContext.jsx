import React, { createContext, useState, useRef } from 'react';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [orientation, setOrientation] = useState('portrait');
  const [activeTool, setActiveTool] = useState(null);
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(false);
  const [audioFile, setAudioFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // FIXED: State added here
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const stageRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const CLOUD_NAME = "dzstsxrzc"; 
  const UPLOAD_PRESET = "my_audio_preset";

  const getPublishDimensions = () => {
    return orientation === 'portrait' 
      ? { width: 1080, height: 1350 } 
      : { width: 1350, height: 900 };
  };

  const addText = () => {
    const newText = { id: `text-${Date.now()}`, type: "text", text: "Double Click to Edit", x: 100, y: 100, fontSize: 24, fill: "#000000", draggable: true };
    setElements(prev => [...prev, newText]);
    setSelectedId(newText.id);
  };

  const addSticker = (emoji) => {
    const canvas = document.createElement("canvas");
    canvas.width = 200; canvas.height = 200;
    const ctx = canvas.getContext("2d");
    ctx.font = "150px serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    ctx.fillText(emoji, 100, 100);
    const stickerUrl = canvas.toDataURL();

    const newSticker = {
      id: `sticker-${Date.now()}`,
      type: 'image',
      src: stickerUrl,
      x: 150, y: 150, width: 100, height: 100,
      draggable: true,
      crop: { x: 0, y: 0, width: 200, height: 200 }
    };
    setElements(prev => [...prev, newSticker]);
    setSelectedId(newSticker.id);
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const imgObj = new window.Image();
      imgObj.src = reader.result;
      imgObj.onload = () => {
        const newImage = {
          id: `img-${Date.now()}`,
          type: 'image',
          src: reader.result,
          x: 50, y: 50,
          width: 200, height: 200,
          draggable: true,
          crop: { x: 0, y: 0, width: imgObj.naturalWidth, height: imgObj.naturalHeight }
        };
        setElements(prev => [...prev, newImage]);
        setSelectedId(newImage.id);
      };
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = async (e) => {
    const file = e?.target?.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);
    formData.append("resource_type", "auto");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: formData });
      const data = await response.json();
      if (data.secure_url) {
        const url = data.secure_url;
        const newAudio = { id: `audio-${Date.now()}`, type: 'audio', url, name: file.name, x: 50, y: 320, width: 180, height: 50, draggable: true };
        const newQR = { id: `qr-${Date.now()}`, type: 'qrcode', link: url, x: 120, y: 50, width: 150, height: 150, draggable: true };
        setElements(prev => [...prev, newAudio, newQR]);
        setAudioFile(newAudio);
      }
    } catch (err) { console.error(err); }
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_video_preset"); 
    formData.append("resource_type", "video");

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`, { method: "POST", body: formData });
      const data = await response.json();

      if (data.secure_url) {
        const videoUrl = data.secure_url;
        const newVideo = { id: `video-${Date.now()}`, type: 'video', src: videoUrl, x: 50, y: 50, width: 250, height: 150, draggable: true };
        const newQR = { id: `qr-vid-${Date.now()}`, type: 'qrcode', link: videoUrl, x: 140, y: 220, width: 120, height: 120, draggable: true };
        setElements(prev => [...prev, newVideo, newQR]);
        setSelectedId(newVideo.id);
      }
    } catch (err) { console.error("Video Upload Error:", err); }
  };

  const handleElementUpdate = (id, newAttrs) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...newAttrs } : el));
  };

  return (
    <CanvasContext.Provider value={{
      elements, setElements, selectedId, setSelectedId, canvasBg, setCanvasBg, 
      isSidebarOpen, setIsSidebarOpen, // Now defined correctly
      orientation, setOrientation, activeTool, setActiveTool, isToolPanelOpen, setIsToolPanelOpen,
      stageRef, imageInputRef, videoInputRef, audioInputRef,
      handleImageUpload, handleAudioUpload, handleVideoUpload, handleElementUpdate,
      addText, addSticker, audioFile, setAudioFile, isPlaying, setIsPlaying,
      getPublishDimensions 
    }}>
      {children}
    </CanvasContext.Provider>
  );
};