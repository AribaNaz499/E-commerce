import React, { createContext, useState, useRef, useCallback } from 'react';

export const CanvasContext = createContext();

export const CanvasProvider = ({ children }) => {

  const [activeTool, setActiveTool] = useState(null);
  const [elements, setElements] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [orientation, setOrientation] = useState('portrait');
  const [currentView, setCurrentView] = useState('editor');
  
  const [cropMode, setCropMode] = useState(false);

  const [audioFile, setAudioFile] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const stageRef = useRef(null);  
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);

  
  const previewDimensions = {
    portrait: { width: 400, height: 500 },
    landscape: { width: 500, height: 350 }
  };

  
  const publishDimensions = {
    portrait: { width: 1080, height: 1350 },
    landscape: { width: 1920, height: 1080 }
  };

  const handleImageUpload = (file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const newImg = {
        id: `img-${Date.now()}`,
        type: "image",
        src: reader.result,
        x: 50,
        y: 50,
        width: 200,
        height: 200,
        rotation: 0,
        draggable: true
      };
      setElements(prev => [...prev, newImg]);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    const newAudioFile = { 
      id: `audio-${Date.now()}`, 
      name: file.name, 
      url, 
      x: 100, 
      y: 100
    };
    
    setAudioFile(newAudioFile);
    setIsPlaying(false);
    setSelectedId(newAudioFile.id);
  };

  const deleteElement = (id) => {
    const targetId = id || selectedId;
    if (targetId) {
      setElements(prev => prev.filter(el => el.id !== targetId));
      if (audioFile?.id === targetId) {
        setAudioFile(null);
        setIsPlaying(false);
      }
      setSelectedId(null);
    }
  };

  
  const getPreviewDimensions = useCallback(() => {
    return previewDimensions[orientation] || previewDimensions.portrait;
  }, [orientation]);

  
  const getPublishDimensions = useCallback(() => {
    return publishDimensions[orientation] || publishDimensions.portrait;
  }, [orientation]);

  return (
    <CanvasContext.Provider value={{
      
      activeTool, setActiveTool,
      elements, setElements,
      selectedId, setSelectedId,
      canvasBg, setCanvasBg,
      orientation, setOrientation,
      currentView, setCurrentView,
      
      cropMode, setCropMode,
      
      previewDimensions,
      publishDimensions,
      getPreviewDimensions,
      getPublishDimensions,
      
      stageRef,      
      imageInputRef,
      audioInputRef,
      
      handleImageUpload,
      handleAudioUpload,
      deleteElement,

      audioFile,
      setAudioFile,
      isPlaying,
      setIsPlaying,
    }}>
      {children}
    </CanvasContext.Provider>
  );
};