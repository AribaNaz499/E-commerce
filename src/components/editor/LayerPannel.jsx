import React, { useContext } from 'react';
import { Trash2, MoveUp, MoveDown, ChevronUp, ChevronDown, PlusCircle } from 'lucide-react';
import { CanvasContext } from '../../context/CanvasContext.jsx';

const LayerPannel = () => {
  const {
    selectedId,
    setSelectedId,
    elements,
    setElements,
    audioFile,
    setAudioFile,
    videoFile,
    setVideoFile
  } = useContext(CanvasContext);

  const selectedElement = elements.find(el => el.id === selectedId) ||
    (selectedId === audioFile?.id ? audioFile : null) ||
    (selectedId === videoFile?.id ? videoFile : null);

  if (!selectedId || !selectedElement) {
    return null;
  }

  const moveElement = (direction) => {
    if (!selectedId) return;
    const index = elements.findIndex(el => el.id === selectedId);
    if (index === -1) return;
    const newElements = [...elements];

    switch (direction) {
      case 'forward':
        if (index < elements.length - 1) {
          [newElements[index], newElements[index + 1]] = [newElements[index + 1], newElements[index]];
        }
        break;
      case 'backward':
        if (index > 0) {
          [newElements[index], newElements[index - 1]] = [newElements[index - 1], newElements[index]];
        }
        break;
      case 'toFront':
        const frontElement = newElements.splice(index, 1)[0];
        newElements.push(frontElement);
        break;
      case 'toBack':
        const backElement = newElements.splice(index, 1)[0];
        newElements.unshift(backElement);
        break;
      default:
        return;
    }
    setElements(newElements);
  };

  const handleDelete = () => {
    if (selectedId === audioFile?.id) {
      setAudioFile(null);
    } else if (selectedId === videoFile?.id) {
      setVideoFile(null);
    } else {
      setElements(elements.filter(el => el.id !== selectedId));
    }
    setSelectedId(null);
  };

  const handleMultipleItem = () => {
    if (!selectedId) return;

    const selectedEl = elements.find(el => el.id === selectedId);
    if (!selectedEl) return;

    const duplicatedEl = {
      ...selectedEl,
      id: `${selectedEl.type}_${Date.now()}`,
      x: (selectedEl.x || 0) + 20,
      y: (selectedEl.y || 0) + 20,
    };

    setElements([...elements, duplicatedEl]);
    setSelectedId(duplicatedEl.id);
  };

  let elementType = 'unknown';
  let elementIcon = '📄';

  if (selectedElement) {
    if (selectedElement.type === 'sticker') {
      elementType = 'sticker';
      elementIcon = '😊';
    } else if (selectedElement.type === 'image') {
      elementType = 'image';
      elementIcon = '🖼️';
    } else if (selectedElement.type === 'text') {
      elementType = 'text';
      elementIcon = '📝';
    } else if (selectedElement.type === 'qrcode') {
      elementType = 'qr code';
      elementIcon = '📱';
    } else if (selectedId === audioFile?.id) {
      elementType = 'audio';
      elementIcon = '🎵';
    } else if (selectedId === videoFile?.id) {
      elementType = 'video';
      elementIcon = '🎬';
    }
  }

  const getDisplayName = () => {
    if (!selectedElement) return '';
    if (selectedElement.name) return selectedElement.name;
    if (selectedElement.text) {
      return selectedElement.text.length > 15
        ? selectedElement.text.substring(0, 15) + '...'
        : selectedElement.text;
    }
    if (selectedElement.type === 'qrcode') return 'QR Code';
    return `${elementType}`;
  };

  return (
    <div className="fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 bg-white shadow-2xl border border-slate-200 
      px-2 py-2 md:px-4 md:py-3 rounded-2xl flex items-center gap-2 md:gap-4 z-[200] animate-in fade-in zoom-in duration-200
      w-[95%] sm:w-auto min-w-fit max-w-[95vw] sm:max-w-none
    ">

      <div className="flex items-center gap-1 md:gap-2 border-r pr-2 md:pr-4 flex-shrink-0">
        <span className="text-[10px] md:text-xs font-medium bg-purple-100 text-purple-700 px-1.5 py-0.5 md:px-2 md:py-1 rounded-full capitalize flex items-center gap-1 whitespace-nowrap">
          {elementIcon} <span className="hidden xs:inline">{elementType}</span>
        </span>
        <span className="text-xs md:text-sm text-slate-600 max-w-[60px] xs:max-w-[100px] md:max-w-[150px] truncate font-medium">
          {getDisplayName()}
        </span>
      </div>

      {(elementType !== 'audio' && elementType !== 'video') && (
        <div className="flex border-r pr-1 md:pr-3 gap-0.5 md:gap-1 flex-shrink-0">
          <button
            onClick={() => moveElement('toFront')}
            className="p-1 md:p-2 hover:bg-purple-100 active:bg-purple-200 active:scale-90 rounded-lg text-slate-600 hover:text-purple-600 transition-all duration-150"
            title="Bring to Front"
          >
            <MoveUp className="w-4 h-4 md:w-[18px] md:h-[18px]" />
          </button>

          <button
            onClick={() => moveElement('forward')}
            className="p-1 md:p-2 hover:bg-purple-100 active:bg-purple-200 active:scale-90 rounded-lg text-slate-600 hover:text-purple-600 transition-all duration-150"
            title="Bring Forward"
          >
            <ChevronUp className="w-4 h-4 md:w-[18px] md:h-[18px]" />
          </button>

          <button
            onClick={() => moveElement('backward')}
            className="p-1 md:p-2 hover:bg-purple-100 active:bg-purple-200 active:scale-90 rounded-lg text-slate-600 hover:text-purple-600 transition-all duration-150"
            title="Send Backward"
          >
            <ChevronDown className="w-4 h-4 md:w-[18px] md:h-[18px]" />
          </button>

          <button
            onClick={() => moveElement('toBack')}
            className="p-1 md:p-2 hover:bg-purple-100 active:bg-purple-200 active:scale-90 rounded-lg text-slate-600 hover:text-purple-600 transition-all duration-150"
            title="Send to Back"
          >
            <MoveDown className="w-4 h-4 md:w-[18px] md:h-[18px]" />
          </button>
        </div>
      )}

      <button
        onClick={handleMultipleItem}
        className="bg-red-50 text-red-500 p-1.5 md:p-2.5 rounded-xl hover:bg-red-500 hover:text-white active:scale-95 transition-all duration-150 flex-shrink-0"
        title="Delete Element"
      >
        <PlusCircle className="w-4 h-4 md:w-[20px] md:h-[20px]" />
      </button>

      <button
        onClick={handleDelete}
        className="bg-red-50 text-red-500 p-1.5 md:p-2.5 rounded-xl hover:bg-red-500 hover:text-white active:scale-95 transition-all duration-150 flex-shrink-0"
        title="Delete Element"
      >
        <Trash2 className="w-4 h-4 md:w-[20px] md:h-[20px]" />
      </button>
    </div>
  );
};

export default LayerPannel;