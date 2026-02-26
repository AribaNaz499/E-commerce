import React, { useContext } from 'react';
import { Layout, Type, Image as ImageIcon, Smile, Music, Video, ChevronLeft, ChevronRight } from 'lucide-react';
import { CanvasContext } from '../../context/CanvasContext.jsx';

const Sidebar = () => {
  const { activeTool, setActiveTool, isSidebarOpen, setIsSidebarOpen } = useContext(CanvasContext);

  const tools = [
    { id: 'layout', label: 'Layout', icon: <Layout size={24} /> },
    { id: 'text', label: 'Text', icon: <Type size={24} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={24} /> },
    { id: 'sticker', label: 'Sticker', icon: <Smile size={24} /> },
    { id: 'music', label: 'Music', icon: <Music size={24} /> },
    { id: 'video', label: 'Video', icon: <Video size={24} /> },
  ];

  return (
    <>
    
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      
      <div className={`
        fixed lg:relative z-50 h-full bg-white border-r border-gray-200
        transition-all duration-300 ease-in-out
        ${isSidebarOpen ? 'left-0' : '-left-20 lg:left-0'}
        w-20
      `}>
        
        
        <button 
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="absolute -right-3 top-20 bg-purple-600 text-white rounded-full p-1 lg:hidden"
        >
          {isSidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

      
        <div className="flex flex-col h-full pt-16 lg:pt-4">
          <div className="flex flex-col gap-2 lg:gap-4 p-2">
            {tools.map(tool => (
              <button
                key={tool.id}
                onClick={() => {
                  setActiveTool(activeTool === tool.id ? null : tool.id);
                 
                  if (window.innerWidth < 1024) {
                    setIsSidebarOpen(false);
                  }
                }}
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
      </div>
    </>
  );
};

export default Sidebar;