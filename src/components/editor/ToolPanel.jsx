import React, { useContext } from "react";
import { X, Music, Video, Image as ImageIcon, Smartphone, Monitor } from "lucide-react";
import { CanvasContext } from "../../context/CanvasContext";

const GOOGLE_FONTS = [
  'Arial', 'Roboto', 'Open Sans', 'Lato', 'Montserrat', 'Poppins',
  'Playfair Display', 'Raleway', 'Nunito', 'Dancing Script',
  'Pacifico', 'Lobster', 'Oswald', 'Merriweather', 'Ubuntu',
  'Source Sans Pro', 'PT Sans', 'Noto Sans', 'Cinzel',
  'Great Vibes', 'Sacramento'
];

const loadGoogleFont = (fontFamily) => {
  if (fontFamily === 'Arial') return;
  const fontName = fontFamily.replace(/ /g, '+');
  const linkId = `gfont-${fontName}`;
  if (!document.getElementById(linkId)) {
    const link = document.createElement('link');
    link.id = linkId;
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;700&display=swap`;
    document.head.appendChild(link);
  }
};

GOOGLE_FONTS.forEach(loadGoogleFont);

const ToolPanel = ({ isAdmin = false }) => {
  const {
    activeTool,
    setActiveTool,
    canvasBg,
    setCanvasBg,
    orientation,
    setOrientation,
    imageInputRef,
    videoInputRef,
    audioInputRef,
    handleImageUpload,
    handleVideoUpload,
    handleAudioUpload,
    addText,
    addSticker,
    setIsToolPanelOpen,
    selectedId,
    elements,
    handleElementUpdate,
  } = useContext(CanvasContext);

  if (!activeTool) return null;

  const selectedEl = elements?.find(el => el.id === selectedId && el.type === 'text');


  const updateText = (props) => {
    if (!selectedEl) return;
    handleElementUpdate(selectedEl.id, props);
  };

  const colors = ["#ffffff", "#f87171", "#fbbf24", "#34d399", "#60a5fa", "#c084fc", "#f472b6", "#000000"];

  const stickers = [
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Panda/3D/panda_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Cat%20face/3D/cat_face_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Rabbit%20face/3D/rabbit_face_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Unicorn/3D/unicorn_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Star/3D/star_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Heart%20with%20ribbon/3D/heart_with_ribbon_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Smiling%20face%20with%20hearts/3D/smiling_face_with_hearts_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Party%20popper/3D/party_popper_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Crown/3D/crown_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Balloon/3D/balloon_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Birthday%20cake/3D/birthday_cake_3d.png",
    "https://cdn.jsdelivr.net/gh/microsoft/fluentui-emoji@main/assets/Sun/3D/sun_3d.png"
  ];

  const handleClose = () => {
    setActiveTool(null);
    setIsToolPanelOpen(false);
  };

  const triggerImageUpload = () => imageInputRef.current?.click();
  const triggerVideoUpload = () => videoInputRef.current?.click();
  const triggerAudioUpload = () => audioInputRef.current?.click();


  const StyleBtn = ({ active, onClick, children, title }) => (
    <button
      onClick={onClick}
      title={title}
      className={`w-10 h-10 rounded-xl border-2 font-bold text-sm transition-all ${active
          ? 'bg-purple-600 border-purple-600 text-white'
          : 'bg-white border-gray-200 text-gray-700 hover:border-purple-400'
        }`}
    >
      {children}
    </button>
  );

  const renderContent = () => {
    switch (activeTool) {

      case "layout":
        return (
          <div className="space-y-6">
            {isAdmin && (
              <div>
                <p className="text-sm text-gray-500 mb-3">Orientation:</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setOrientation("portrait")}
                    className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 ${orientation === "portrait"
                        ? "border-purple-600 bg-purple-50 text-purple-600"
                        : "border-gray-200 hover:border-purple-300"
                      }`}
                  >
                    <Smartphone size={20} />
                    <span>Portrait</span>
                  </button>
                  <button
                    onClick={() => setOrientation("landscape")}
                    className={`flex-1 py-3 rounded-xl border-2 flex items-center justify-center gap-2 ${orientation === "landscape"
                        ? "border-purple-600 bg-purple-50 text-purple-600"
                        : "border-gray-200 hover:border-purple-300"
                      }`}
                  >
                    <Monitor size={20} />
                    <span>Landscape</span>
                  </button>
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-500 mb-3">Background Color:</p>
              <div className="grid grid-cols-4 gap-3">
                {colors.map((color, i) => (
                  <button
                    key={i}
                    onClick={() => setCanvasBg(color)}
                    className={`aspect-square rounded-xl border-2 hover:scale-105 transition-transform ${canvasBg === color ? "border-purple-600 scale-105" : "border-gray-200"
                      }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "text":
        return (
          <div className="space-y-5">

            <button
              onClick={addText}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:opacity-90 transition-opacity"
            >
              + Add New Text
            </button>


            {selectedEl ? (
              <div className="space-y-4">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                  Text Styling
                </p>


                <div>
                  <p className="text-sm text-gray-500 mb-2">Font Family</p>
                  <select
                    value={selectedEl.fontFamily || 'Arial'}
                    onChange={(e) => {
                      loadGoogleFont(e.target.value);
                      updateText({ fontFamily: e.target.value });
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border-2 border-gray-200 focus:border-purple-400 outline-none text-sm bg-white"
                    style={{ fontFamily: selectedEl.fontFamily || 'Arial' }}
                  >
                    {GOOGLE_FONTS.map(f => (
                      <option key={f} value={f} style={{ fontFamily: f }}>{f}</option>
                    ))}
                  </select>
                </div>


                <div>
                  <p className="text-sm text-gray-500 mb-2">Font Size</p>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => updateText({ fontSize: Math.max(8, (selectedEl.fontSize || 16) - 2) })}
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 font-bold text-lg hover:border-purple-400 transition-all"
                    >−</button>
                    <span className="flex-1 text-center font-bold text-lg text-gray-700">
                      {selectedEl.fontSize || 16}
                    </span>
                    <button
                      onClick={() => updateText({ fontSize: (selectedEl.fontSize || 16) + 2 })}
                      className="w-10 h-10 rounded-xl border-2 border-gray-200 font-bold text-lg hover:border-purple-400 transition-all"
                    >+</button>
                  </div>
                </div>


                <div>
                  <p className="text-sm text-gray-500 mb-2">Style</p>
                  <div className="flex gap-2">
                    <StyleBtn
                      active={selectedEl.fontStyle === 'bold'}
                      onClick={() => updateText({ fontStyle: selectedEl.fontStyle === 'bold' ? 'normal' : 'bold' })}
                      title="Bold"
                    >
                      <span style={{ fontWeight: 'bold' }}>B</span>
                    </StyleBtn>
                    <StyleBtn
                      active={selectedEl.fontStyle === 'italic'}
                      onClick={() => updateText({ fontStyle: selectedEl.fontStyle === 'italic' ? 'normal' : 'italic' })}
                      title="Italic"
                    >
                      <span style={{ fontStyle: 'italic' }}>I</span>
                    </StyleBtn>
                    <StyleBtn
                      active={selectedEl.textDecoration === 'underline'}
                      onClick={() => updateText({ textDecoration: selectedEl.textDecoration === 'underline' ? '' : 'underline' })}
                      title="Underline"
                    >
                      <span style={{ textDecoration: 'underline' }}>U</span>
                    </StyleBtn>
                  </div>
                </div>



                <div>
                  <p className="text-sm text-gray-500 mb-2">Alignment</p>
                  <div className="flex gap-2">
                    <StyleBtn
                      active={selectedEl.align === 'left' || !selectedEl.align}
                      onClick={() => updateText({ align: 'left' })}
                    >≡</StyleBtn>

                    <StyleBtn
                      active={selectedEl.align === 'center'}
                      onClick={() => updateText({ align: 'center' })}
                    >☰</StyleBtn>

                    <StyleBtn
                      active={selectedEl.align === 'right'}
                      onClick={() => updateText({ align: 'right' })}
                    >≡</StyleBtn>
                  </div>
                </div>


                <div>
                  <p className="text-sm text-gray-500 mb-2">
                    Line Spacing — <span className="font-bold text-purple-600">{(selectedEl.lineHeight || 1.2).toFixed(1)}</span>
                  </p>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={selectedEl.lineHeight || 1.2}
                    onChange={(e) => updateText({ lineHeight: parseFloat(e.target.value) })}
                    className="w-full accent-purple-600"
                  />
                </div>

          
                <div>
                  <p className="text-sm text-gray-500 mb-2">Text Color</p>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={selectedEl.fill || '#000000'}
                      onChange={(e) => updateText({ fill: e.target.value })}
                      className="w-12 h-12 rounded-xl border-2 border-gray-200 cursor-pointer p-1"
                    />
                    <span className="text-sm font-mono text-gray-600">
                      {selectedEl.fill || '#000000'}
                    </span>
                  </div>

                  <div className="grid grid-cols-8 gap-1.5 mt-3">
                    {['#000000', '#ffffff', '#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#a855f7',
                      '#ec4899', '#14b8a6', '#6366f1', '#f43f5e', '#84cc16', '#06b6d4', '#8b5cf6', '#d946ef'
                    ].map(c => (
                      <button
                        key={c}
                        onClick={() => updateText({ fill: c })}
                        className={`aspect-square rounded-lg border-2 hover:scale-110 transition-transform ${selectedEl.fill === c ? 'border-purple-600 scale-110' : 'border-gray-200'
                          }`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ) : (

              <div className="text-center py-8 text-gray-400">
                <p className="text-sm">Select a text on canvas<br />to edit its style</p>
              </div>
            )}
          </div>
        );

      case "image":
        return (
          <div
            onClick={triggerImageUpload}
            className="p-10 border-4 border-dashed border-purple-300 rounded-xl cursor-pointer hover:bg-purple-50 transition-colors text-center"
          >
            <ImageIcon className="mx-auto mb-2 text-purple-600" size={32} />
            <p className="text-gray-600">Click to upload Image</p>
            <p className="text-xs text-gray-400 mt-1">Double-click image to crop</p>
          </div>
        );

      case "sticker":
        return (
          <div>
            <p className="text-sm text-gray-500 mb-3">Choose a sticker:</p>
            <div className="grid grid-cols-3 gap-3">
              {stickers.map((sticker, i) => (
                <button
                  key={i}
                  onClick={() => addSticker(sticker)}
                  className="aspect-square p-2 bg-gray-50 rounded-xl border hover:border-purple-500 hover:scale-105 transition-all"
                >
                  <img src={sticker} alt={`sticker-${i}`} className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-2">Or upload your own:</p>
              <button
                onClick={triggerImageUpload}
                className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:bg-gray-50"
              >
                Upload Sticker
              </button>
            </div>
          </div>
        );

      case "music":
      case "audio":
        return (
          <div
            onClick={triggerAudioUpload}
            className="p-10 border-4 border-dashed border-green-300 rounded-xl cursor-pointer hover:bg-green-50 transition-colors text-center"
          >
            <Music className="mx-auto mb-2 text-green-600" size={32} />
            <p className="text-gray-600">Click to upload Audio</p>
            <p className="text-xs text-gray-400 mt-1">QR code will be generated</p>
          </div>
        );

      case "video":
        return (
          <div
            onClick={triggerVideoUpload}
            className="p-10 border-4 border-dashed border-blue-300 rounded-xl cursor-pointer hover:bg-blue-50 transition-colors text-center"
          >
            <Video className="mx-auto mb-2 text-blue-600" size={32} />
            <p className="text-gray-600">Click to upload Video</p>
            <p className="text-xs text-gray-400 mt-1">QR code will be generated</p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full bg-white border-l flex flex-col shadow-lg w-80">
      <input type="file" ref={imageInputRef} className="hidden" accept="image/*"
        onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])} />
      <input type="file" ref={videoInputRef} className="hidden" accept="video/*"
        onChange={(e) => e.target.files[0] && handleVideoUpload(e.target.files[0])} />
      <input type="file" ref={audioInputRef} className="hidden" accept="audio/*"
        onChange={(e) => e.target.files[0] && handleAudioUpload(e.target.files[0])} />

      <div className="p-4 border-b flex justify-between items-center bg-gray-50">
        <h2 className="font-bold text-lg capitalize">
          {activeTool === "music" ? "Audio" : activeTool}
        </h2>
        <button onClick={handleClose} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
          <X size={20} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {renderContent()}
      </div>
    </div>
  );
};

export default ToolPanel;