import React, { useContext } from 'react';
import { Layout, Type, Image as ImageIcon, Smile, Music } from 'lucide-react'; 
import { CanvasContext } from '../../context/CanvasContext.jsx';

const Sidebar = () => {
  const { activeTool, setActiveTool } = useContext(CanvasContext);

  
  const tools = [
    { id: 'layout', label: 'Layout', icon: <Layout size={24} /> },
    { id: 'text', label: 'Text', icon: <Type size={24} /> },
    { id: 'image', label: 'Image', icon: <ImageIcon size={24} /> },
    { id: 'sticker', label: 'Sticker', icon: <Smile size={24} /> },
    { id: 'music', label: 'music', icon: <Music size={24} /> }, 
  ];

  return (
    <div className="flex flex-col bg-white p-2 gap-4 w-20 border-r border-gray-200 h-full z-[100]">
      {tools.map(tool => (
        <button
          key={tool.id}
          onClick={() => setActiveTool(activeTool === tool.id ? null : tool.id)}
          className={`flex flex-col items-center justify-center p-2 rounded-lg transition-all ${
            activeTool === tool.id ? 'bg-purple-100 text-purple-600' : 'hover:bg-gray-100 text-slate-500'
          }`}
        >
          {tool.icon}
          <span className="text-[10px] mt-1 font-semibold">{tool.label}</span>
        </button>
      ))}
    </div>
  );
};

export default Sidebar;