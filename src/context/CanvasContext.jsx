import React, { createContext, useState, useRef } from 'react';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [activeTool, setActiveTool] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [orientation, setOrientation] = useState('portrait');
  const [cropMode, setCropMode] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const stageRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // Screen display ke liye dimensions
  const getPreviewDimensions = () => {
    return orientation === 'landscape' 
      ? { width: 1200, height: 675 } 
      : { width: 875, height: 1100 };
  };

  // 🔥 ADDED: High Quality Save/Publish ke liye dimensions
  const getPublishDimensions = () => {
    return orientation === 'landscape' 
      ? { width: 1920, height: 1080 } 
      : { width: 1080, height: 1920 };
  };

  // --- IMAGE UPLOAD LOGIC ---
  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newImage = {
        // Ghost Image Fix: Har image ki ID hamesha unique rahegi
        id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'image',
        src: reader.result,
        x: 100, y: 100, width: 250, height: 250,
        rotation: 0,
        // Initial crop logic fix
        crop: { x: 0, y: 0, width: 250, height: 250 }
      };
      setElements((prev) => [...prev, newImage]);
      setSelectedId(newImage.id);
    };
    reader.readAsDataURL(file);
  };

  // --- VIDEO UPLOAD LOGIC ---
  const handleVideoUpload = (file) => {
    if (!file) return;
    const id = `video-${Date.now()}`;
    setVideoFile({ 
      id: id, 
      url: URL.createObjectURL(file), 
      x: 50, y: 50, width: 400, height: 300, rotation: 0 
    });
    setSelectedId(id);
  };

  // --- AUDIO UPLOAD LOGIC ---
const handleAudioUpload = async (file) => {
  if (!file) return;

  try {
    // 1. Form Data taiyar karein
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "my_audio_preset"); // Jo aapne screenshot mein banaya

    // 2. Apna Cloud Name yahan likhein
    const cloudName = "APNA_CLOUD_NAME_YAHAN_LIKHEIN"; 

    // Cloudinary API call (Audio ke liye 'video' endpoint use hota hai)
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
      { method: "POST", body: formData }
    );

    const data = await response.json();

    if (data.secure_url) {
      const permanentUrl = data.secure_url;

      // --- AUDIO PLAYER DATA ---
      const audioId = `audio-${Date.now()}`;
      setAudioFile({
        id: audioId,
        name: file.name,
        url: permanentUrl,
        x: 50,
        y: 50
      });

      // --- QR CODE DATA (Auto-Generate) ---
      const qrId = `qr-${Date.now()}`;
      const newQRCode = {
        id: qrId,
        type: 'qrcode',
        link: permanentUrl, // Scan karte hi audio bajegi
        x: 250,
        y: 50,
        width: 150,
        height: 150,
      };

      // Stage par add karein
      setElements((prev) => [...prev, newQRCode]);
      setSelectedId(qrId);
      
      console.log("Audio live ho gaya!");
    }
  } catch (error) {
    console.error("Upload error:", error);
    alert("Upload fail! Internet ya Cloud Name check karein.");
  }
};

  // --- TEXT ADD LOGIC ---
  const addText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'New Text',
      x: 150, y: 150, fontSize: 40, fill: '#000000', rotation: 0
    };
    setElements((prev) => [...prev, newText]);
    setSelectedId(newText.id);
  };

  // --- STICKER ADD LOGIC ---
  const addSticker = (stickerEmoji) => {
    const newSticker = {
      id: `sticker-${Date.now()}`,
      type: 'sticker',
      text: stickerEmoji,
      x: 200, y: 200, width: 150, height: 150, rotation: 0,
      crop: { x: 0, y: 0, width: 500, height: 500 }
    };
    setElements((prev) => [...prev, newSticker]);
    setSelectedId(newSticker.id);
  };

  // --- DELETE LOGIC ---
  const deleteSelected = () => {
    if (!selectedId) return;
    if (videoFile && selectedId === videoFile.id) {
      setVideoFile(null); setSelectedId(null); return;
    }
    if (audioFile && selectedId === audioFile.id) {
      setAudioFile(null); setSelectedId(null); return;
    }
    setElements(prev => prev.filter(el => el.id !== selectedId));
    setSelectedId(null);
  };

  const updateElement = (updatedEl) => {
    setElements(prev => prev.map(item => item.id === updatedEl.id ? updatedEl : item));
  };

  return (
    <CanvasContext.Provider value={{
      activeTool, setActiveTool, elements, setElements,
      selectedId, setSelectedId, canvasBg, setCanvasBg,
      orientation, setOrientation, 
      getPreviewDimensions, 
      getPublishDimensions, // 🔥 Ab Save Error nahi aayega
      cropMode, setCropMode, stageRef, 
      imageInputRef, videoInputRef, audioInputRef,
      handleImageUpload, handleVideoUpload, handleAudioUpload,
      addText, addSticker, updateElement, deleteSelected,
      audioFile, setAudioFile, videoFile, setVideoFile,
      isAudioPlaying, setIsAudioPlaying
    }}>
      {children}
    </CanvasContext.Provider>
  );
};