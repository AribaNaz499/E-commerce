import React, { useContext } from 'react';
import { Layout, Type, Image as ImageIcon, Smile, Music, Video } from 'lucide-react';
import { CanvasContext } from '../../context/CanvasContext.jsx';

const Sidebar = () => {
  const { activeTool, setActiveTool, setIsSidebarOpen, setIsToolPanelOpen } = useContext(CanvasContext);

  const tools = [
    { id: 'layout', label: 'Layout', icon: <Layout size={24} /> },
    { id: 'text', label: 'Text', icon: <Type size={24} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={24} /> },
    { id: 'sticker', label: 'Sticker', icon: <Smile size={24} /> },
    { id: 'music', label: 'Music', icon: <Music size={24} /> },
    { id: 'video', label: 'Video', icon: <Video size={24} /> },
  ];

  const handleToolClick = (toolId) => {
    console.log("Tool clicked:", toolId);
  
    if (activeTool === toolId) {
      setActiveTool(null);
      setIsToolPanelOpen(false);
    } else {
      setActiveTool(toolId);
      setIsToolPanelOpen(true);
    }
    
    
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="flex flex-col bg-white w-full h-full">
      <div className="flex flex-col gap-2 p-2">
        {tools.map(tool => (
          <button
            key={tool.id}
            onClick={() => handleToolClick(tool.id)}
            className={`
              flex flex-col items-center justify-center p-2 rounded-xl
              transition-all duration-200
              ${activeTool === tool.id 
                ? 'bg-purple-100 text-purple-600 scale-105' 
                : 'hover:bg-gray-100 text-slate-500 hover:scale-105'
              }
            `}
          >
            {tool.icon}
            <span className="text-[10px] mt-1 font-semibold">{tool.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;