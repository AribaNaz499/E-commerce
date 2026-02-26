import React, { createContext, useState, useRef } from 'react';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {
  const [activeTool, setActiveTool] = useState(null);
  
  console.log("🔄 CanvasContext - Active Tool:", activeTool);
  
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [orientation, setOrientation] = useState('portrait');
  const [cropMode, setCropMode] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const [videoFile, setVideoFile] = useState(null);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadType, setUploadType] = useState(''); 

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isToolPanelOpen, setIsToolPanelOpen] = useState(false);

  const stageRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const getPreviewDimensions = () => {
    return orientation === 'landscape' 
      ? { width: 1200, height: 675 } 
      : { width: 875, height: 1100 };
  };

  const getPublishDimensions = () => {
    return orientation === 'landscape' 
      ? { width: 1920, height: 1080 } 
      : { width: 1080, height: 1920 };
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newImage = {
        id: `img-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        type: 'image',
        src: reader.result,
        x: 100, y: 100, width: 250, height: 250,
        rotation: 0,
        crop: { x: 0, y: 0, width: 250, height: 250 }
      };
      setElements((prev) => [...prev, newImage]);
      setSelectedId(newImage.id);
    };
    reader.readAsDataURL(file);
  };

  const handleVideoUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    setUploadType('video');
    setUploadProgress(0);
    
    console.log("1. Video upload start:", file.name);
    console.log("File size:", (file.size / 1024 / 1024).toFixed(2), "MB");

    const cloudName = "dzstsxrzc"; 
    const uploadPreset = "my_video_preset";

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("resource_type", "video");

      console.log("2. Sending to Cloudinary...");

      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
          console.log(`📊 Upload progress: ${percentComplete}%`);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log("3. Cloudinary data:", data);
          
          if (data.secure_url) {
            const permanentUrl = data.secure_url;
            const timestamp = Date.now();

            const videoId = `video-${timestamp}`;
            setVideoFile({
              id: videoId,
              name: file.name,
              url: permanentUrl,
              x: 50,
              y: 50,
              width: 400,
              height: 300,
              rotation: 0
            });

           
            const qrId = `video-qr-${timestamp}`;
            const newQRCode = {
              id: qrId,
              type: 'qrcode',
              link: permanentUrl,
              x: 250,
              y: 50,
              width: 150,
              height: 150,
              rotation: 0
            };

            setElements((prev) => [...prev, newQRCode]);
            setSelectedId(qrId);
            
            console.log("✅ Success: Video uploaded and QR generated!");
            console.log("Video URL:", permanentUrl);
            
           
            setUploadProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              setUploadType('');
            }, 1000);
          }
        } else {
          console.error("Upload failed with status:", xhr.status);
          alert("Upload failed! Please try again.");
          setIsUploading(false);
          setUploadProgress(0);
        }
      });

     
      xhr.addEventListener('error', () => {
        console.error("Network error occurred");
        alert("Network error! Please check your connection.");
        setIsUploading(false);
        setUploadProgress(0);
      });

      
      xhr.addEventListener('timeout', () => {
        console.error("Upload timeout");
        alert("Upload timeout! Video size kam karo.");
        setIsUploading(false);
        setUploadProgress(0);
      });

    
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`);
      xhr.timeout = 30000; 
      xhr.send(formData);

    } catch (error) {
      console.error("❌ Error:", error);
      alert("Upload failed! Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  
  const handleAudioUpload = async (file) => {
    if (!file) return;

    
    setIsUploading(true);
    setUploadType('audio');
    setUploadProgress(0);

    const cloudName = "dzstsxrzc"; 
    const uploadPreset = "my_audio_preset"; 

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", uploadPreset);
      formData.append("resource_type", "auto");

      
      const xhr = new XMLHttpRequest();
      
      
      xhr.upload.addEventListener('progress', (e) => {
        if (e.lengthComputable) {
          const percentComplete = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percentComplete);
          console.log(`📊 Audio upload progress: ${percentComplete}%`);
        }
      });

  
      xhr.addEventListener('load', () => {
        if (xhr.status === 200) {
          const data = JSON.parse(xhr.responseText);
          console.log("Audio upload success:", data);
          
          if (data.secure_url) {
            const permanentUrl = data.secure_url;
            const timestamp = Date.now();

            
            const audioId = `audio-${timestamp}`;
            setAudioFile({
              id: audioId,
              name: file.name,
              url: permanentUrl,
              x: 50,
              y: 50
            });

            
            const qrId = `audio-qr-${timestamp}`;
            const newQRCode = {
              id: qrId,
              type: 'qrcode',
              link: permanentUrl,
              x: 250,
              y: 50,
              width: 150,
              height: 150,
              rotation: 0
            };

            setElements((prev) => [...prev, newQRCode]);
            setSelectedId(qrId);
            
            console.log("✅ Success: Audio uploaded and QR generated!");
            
        
            setUploadProgress(100);
            setTimeout(() => {
              setIsUploading(false);
              setUploadType('');
            }, 1000);
          }
        } else {
          console.error("Upload failed with status:", xhr.status);
          alert("Upload failed! Please try again.");
          setIsUploading(false);
          setUploadProgress(0);
        }
      });

      
      xhr.addEventListener('error', () => {
        console.error("Network error occurred");
        alert("Network error! Please check your connection.");
        setIsUploading(false);
        setUploadProgress(0);
      });

    
      xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
      xhr.timeout = 30000; 
      xhr.send(formData);

    } catch (error) {
      console.error("❌ Error:", error);
      alert("Upload failed! Please try again.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const addText = () => {
    const newText = {
      id: `text-${Date.now()}`,
      type: 'text',
      text: 'New Text',
      x: 150, y: 150, fontSize: 40, fill: '#000000', rotation: 0
    };
    setElements((prev) => [...prev, newText]);
    setSelectedId(newText.id);
    console.log("📝 Text added:", newText);
  };


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
    console.log("😊 Sticker added:", newSticker);
  };

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
    console.log("🗑️ Element deleted:", selectedId);
  };

  const updateElement = (updatedEl) => {
    setElements(prev => prev.map(item => item.id === updatedEl.id ? updatedEl : item));
    console.log("✏️ Element updated:", updatedEl.id);
  };

  return (
    <CanvasContext.Provider value={{
      activeTool, setActiveTool, elements, setElements,
      selectedId, setSelectedId, canvasBg, setCanvasBg,
      orientation, setOrientation, 
      getPreviewDimensions, 
      getPublishDimensions,
      cropMode, setCropMode, stageRef, 
      imageInputRef, videoInputRef, audioInputRef,
      handleImageUpload, handleVideoUpload, handleAudioUpload,
      addText, addSticker, updateElement, deleteSelected,
      audioFile, setAudioFile, videoFile, setVideoFile,
      isAudioPlaying, setIsAudioPlaying,
   
      uploadProgress, 
      isUploading, 
      uploadType,
    
      isSidebarOpen, 
      setIsSidebarOpen,
      isToolPanelOpen, 
      setIsToolPanelOpen
    }}>
      {children}
    </CanvasContext.Provider>
  );
};