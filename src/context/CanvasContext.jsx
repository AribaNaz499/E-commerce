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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const stageRef = useRef(null);
  const imageInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const audioInputRef = useRef(null);

  const handleElementUpdate = (id, newAttrs) => {
    setElements(prev => prev.map(el => el.id === id ? { ...el, ...newAttrs } : el));
  };

  const getPublishDimensions = () => {
    return orientation === 'portrait' 
      ? { width: 1080, height: 1350 } 
      : { width: 1350, height: 900 };
  };

  return (
    <CanvasContext.Provider value={{
      elements, setElements, selectedId, setSelectedId, canvasBg, setCanvasBg, 
      isSidebarOpen, setIsSidebarOpen, 
      orientation, setOrientation, activeTool, setActiveTool, isToolPanelOpen, setIsToolPanelOpen,
      stageRef, imageInputRef, videoInputRef, audioInputRef,
      handleElementUpdate, audioFile, setAudioFile, isPlaying, setIsPlaying,
      getPublishDimensions 
    }}>
      {children}
    </CanvasContext.Provider>
  );
};