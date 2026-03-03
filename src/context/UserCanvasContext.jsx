import React, { createContext, useState, useRef, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid'; 

export const UserCanvasContext = createContext(null);

export const UserCanvasProvider = ({ children }) => {
  
  const [currentSlide, setCurrentSlide] = useState(0);
  const [elements, setElements] = useState([]); 
  const [selectedId, setSelectedId] = useState(null);
  const [canvasBg, setCanvasBg] = useState('#ffffff');
  const [orientation, setOrientation] = useState('portrait'); 
  const [activeTool, setActiveTool] = useState(null);

  
  const stageRef = useRef(null);
  const imageInputRef = useRef(null);
  const audioInputRef = useRef(null);
  const videoInputRef = useRef(null);

  
  const addText = useCallback(() => {
    const newText = {
      id: uuidv4(),
      type: 'text',
      text: 'Double tap to edit',
      
      x: orientation === 'portrait' ? 100 : 150, 
      y: orientation === 'portrait' ? 200 : 100,
      fontSize: 32,
      fontFamily: 'Arial',
      fill: '#333333',
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };
    setElements(prev => [...prev, newText]);
    setSelectedId(newText.id); 
  }, [orientation]);

  
  const handleImageUpload = useCallback(async (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const newImage = {
          id: uuidv4(),
          type: 'image',
          src: e.target.result,
          x: 50, 
          y: 50,
          width: Math.min(250, img.width), 
          height: (img.height / img.width) * Math.min(250, img.width),
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        };
        setElements(prev => [...prev, newImage]);
        setSelectedId(newImage.id);
      };
    };
    reader.readAsDataURL(file);
  }, []);


  const updateElement = useCallback((id, newAttrs) => {
    setElements(prev =>
      prev.map(el => (el.id === id ? { ...el, ...newAttrs } : el))
    );
  }, []);

  
  const deleteElement = useCallback((id) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(null);
  }, []);

  
  const handleAudioUpload = (file) => { console.log("Audio not supported in standard greeting card flow"); };
  const handleVideoUpload = (file) => { console.log("Video not supported in standard greeting card flow"); };


  const value = {
  
    currentSlide, setCurrentSlide,
    elements, setElements,
    selectedId, setSelectedId,
    canvasBg, setCanvasBg,
    orientation, setOrientation,
    activeTool, setActiveTool,
    
    // refs
    stageRef,
    imageInputRef, audioInputRef, videoInputRef,
    
  
    addText,
    handleImageUpload,
    handleAudioUpload, 
    handleVideoUpload,
    updateElement,
    deleteElement
  };

  return (
    <UserCanvasContext.Provider value={value}>
      {children}
    </UserCanvasContext.Provider>
  );
};