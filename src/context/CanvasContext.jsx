import React, { createContext, useState, useRef } from "react";
import QRCode from "qrcode";

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState("#ffffff");
  const [orientation, setOrientation] = useState("portrait");
  const [activeTool, setActiveTool] = useState(null);
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioFile, setAudioFile] = useState(null);

  const stageRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const createId = () => `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const handleElementUpdate = (id, newAttrs) => {
    setElements((prev) =>
      prev.map((el) => (el.id === id ? { ...el, ...newAttrs } : el))
    );
  };

 
  const getPublishDimensions = () => {
    if (orientation === "portrait") {
      return { width: 1080, height: 1350 };
    } else {
      return { width: 1350, height: 1080 };
    }
  };

 
  const generateQRCode = async (text) => {
    try {
      const url = await QRCode.toDataURL(text || "https://example.com", {
        width: 300,
        margin: 2,
      });

      const newQR = {
        id: createId(),
        type: "image",
        src: url,
        x: 50,
        y: 50,
        width: 120,
        height: 120,
        crop: { x: 0, y: 0, width: 0, height: 0 },
        draggable: true,
        isQR: true,
      };

      setElements((prev) => [...prev, newQR]);
      return url;
    } catch (error) {
      console.error("QR generation error:", error);
    }
  };

 
 const handleImageUpload = (file) => {
  if (!file) return;

  const reader = new FileReader();
  
  reader.onload = () => {
    const base64Data = reader.result; 

    const img = new Image();
    img.onload = () => {
      const newImage = {
        id: `img-${Date.now()}`,
        type: "image",
        src: base64Data, 
        x: 100,
        y: 100,
        width: 250,
        height: 250,
        originalWidth: img.width,
        originalHeight: img.height,
        crop: { x: 0, y: 0, width: img.width, height: img.height },
        draggable: true,
      };
      setElements((prev) => [...prev, newImage]);
    };
    img.src = base64Data;
  };

  reader.readAsDataURL(file); 
};


  const handleVideoUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_video_preset");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dzstsxrzc/video/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      const newVideo = {
        id: createId(),
        type: "video",
        src: data.secure_url,
        x: 150,
        y: 150,
        width: 320,
        height: 240,
        draggable: true,
      };

      setElements((prev) => [...prev, newVideo]);
      generateQRCode(data.secure_url);
    } catch (error) {
      console.error("Video upload error:", error);
    }
  };

  const handleAudioUpload = async (file) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_audio_preset");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dzstsxrzc/auto/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      const newAudio = {
        id: createId(),
        type: "audio",
        src: data.secure_url,
        name: file.name,
        x: 100,
        y: 100,
        width: 180,
        height: 50,
        draggable: true,
      };

      setElements((prev) => [...prev, newAudio]);
      setAudioFile(newAudio);
      generateQRCode(data.secure_url);
    } catch (error) {
      console.error("Audio upload error:", error);
    }
  };

  
  const addSticker = (stickerUrl) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const newSticker = {
        id: createId(),
        type: "image",
        src: stickerUrl,
        x: 150,
        y: 150,
        width: 120,
        height: 120,
        originalWidth: img.width,
        originalHeight: img.height,
        crop: { x: 0, y: 0, width: img.width, height: img.height },
        draggable: true,
        isSticker: true,
      };
      setElements((prev) => [...prev, newSticker]);
    };
    img.src = stickerUrl;
  };


  const addText = () => {
    const newText = {
      id: createId(),
      type: "text",
      text: "Edit me",
      x: 100,
      y: 100,
      fontSize: 28,
      fill: "#000000",
      draggable: true,
    };
    setElements((prev) => [...prev, newText]);
  };

  return (
    <CanvasContext.Provider
      value={{
        elements,
        setElements,
        selectedId,
        setSelectedId,
        canvasBg,
        setCanvasBg,
        orientation,
        setOrientation,
        activeTool,
        setActiveTool,
        isToolPanelOpen,
        setIsToolPanelOpen,
        stageRef,
        imageInputRef,
        videoInputRef,
        audioInputRef,
        handleElementUpdate,
        handleImageUpload,
        handleVideoUpload,
        handleAudioUpload,
        addText,
        addSticker,
        generateQRCode,
        getPublishDimensions,
        isPlaying,
        setIsPlaying,
        audioFile,
        setAudioFile,
      }}
    >
      {children}
    </CanvasContext.Provider>
  );
};