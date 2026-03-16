import { Trash2 } from 'lucide-react';
import type { CanvasElement, Invitation } from '../../types';
import { EDITOR_FONTS } from '../../lib/canvas-config';

interface EditorSettingsPanelProps {
  selectedElement: CanvasElement;
  successMessage: string;
  onSuccessMessageChange: (value: string) => void;
  animationType: Invitation['animationType'];
  onAnimationTypeChange: (value: Invitation['animationType']) => void;
  musicUrl: string;
  onMusicUrlChange: (value: string) => void;
  onUpdateSelected: (props: Partial<CanvasElement>) => void;
  onDeleteSelected: () => void;
}

export default function EditorSettingsPanel({
  selectedElement,
  successMessage,
  onSuccessMessageChange,
  animationType,
  onAnimationTypeChange,
  musicUrl,
  onMusicUrlChange,
  onUpdateSelected,
  onDeleteSelected,
}: EditorSettingsPanelProps) {
  return (
    <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-left-4 duration-300">
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#c86d75]">Settings</h2>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Success Message</label>
        <textarea
          value={successMessage}
          onChange={(e) => onSuccessMessageChange(e.target.value)}
          className="w-full p-2 text-sm border border-[#f3c583]/50 rounded-lg focus:ring-2 focus:ring-[#e8e46e] outline-none"
          placeholder="Message shown after 'Yes'..."
        />
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Animation</label>
        <select
          value={animationType}
          onChange={(e) => onAnimationTypeChange(e.target.value as Invitation['animationType'])}
          className="w-full p-2 text-sm border border-[#f3c583]/50 rounded-lg outline-none"
        >
          <option value="none">None</option>
          <option value="confetti">Confetti</option>
          <option value="holi">Holi Colors</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-xs font-medium text-[#5f5a50]">Music URL (MP3)</label>
        <input
          type="text"
          value={musicUrl}
          onChange={(e) => onMusicUrlChange(e.target.value)}
          className="w-full p-2 text-sm border border-[#f3c583]/50 rounded-lg focus:ring-2 focus:ring-[#e8e46e] outline-none"
          placeholder="https://example.com/music.mp3"
        />
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#c86d75]">Properties</h2>
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <label className="text-xs font-medium text-[#5f5a50]">Color</label>
          <input
            type="color"
            value={selectedElement.fill}
            onChange={(e) => onUpdateSelected({ fill: e.target.value })}
            className="w-8 h-8 rounded-md border-0 cursor-pointer"
          />
        </div>

        {selectedElement.type === 'button' && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#5f5a50]">Button Text</label>
              <input
                type="text"
                value={selectedElement.text}
                onChange={(e) => onUpdateSelected({ text: e.target.value })}
                className="w-full p-2 text-sm border border-[#f3c583]/50 rounded-lg focus:ring-2 focus:ring-[#e8e46e] outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#5f5a50]">Button Type</label>
              <select
                value={selectedElement.buttonType}
                onChange={(e) => onUpdateSelected({ buttonType: e.target.value as CanvasElement['buttonType'] })}
                className="w-full p-2 text-sm border border-[#f3c583]/50 rounded-lg outline-none"
              >
                <option value="yes">Yes (Success)</option>
                <option value="no">No (Interactive/Moves)</option>
              </select>
            </div>
          </>
        )}

        {selectedElement.type === 'text' && (
          <>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#5f5a50]">Text Content</label>
              <textarea
                value={selectedElement.text}
                onChange={(e) => onUpdateSelected({ text: e.target.value })}
                className="w-full p-2 text-sm border border-[#f3c583]/50 rounded-lg focus:ring-2 focus:ring-[#e8e46e] outline-none"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#5f5a50]">Font Size</label>
              <input
                type="range"
                min="10"
                max="100"
                value={selectedElement.fontSize}
                onChange={(e) => onUpdateSelected({ fontSize: parseInt(e.target.value, 10) })}
                className="w-full accent-[#e99497]"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-medium text-[#5f5a50]">Font Family</label>
              <select
                value={selectedElement.fontFamily}
                onChange={(e) => onUpdateSelected({ fontFamily: e.target.value })}
                className="w-full p-2 text-sm border border-[#f3c583]/50 rounded-lg outline-none"
              >
                {EDITOR_FONTS.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <button
          onClick={onDeleteSelected}
          className="flex items-center justify-center gap-2 p-3 mt-4 text-[#c2484f] hover:bg-[#fff0f0] rounded-xl transition-colors text-xs font-semibold"
        >
          <Trash2 size={16} />
          Delete Element
        </button>
      </div>
    </div>
  );
}
