import { Heart, Image as ImageIcon, Layout, Palette, Sparkles, Square, Sun, Type, User } from 'lucide-react';
import type { ChangeEvent, ReactNode, RefObject } from 'react';
import { Template } from '../../templates';
import type { CanvasElement } from '../../types';
import { BUTTON_SIZE_PRESETS } from '../../lib/canvas-config';

interface EditorElementLibraryProps {
  templates: Template[];
  selectedTemplateId: string | null;
  onApplyTemplate: (template: Template) => void;
  onAddElement: (type: CanvasElement['type'], extraProps?: Partial<CanvasElement>) => void;
  onToggleColorPicker: () => void;
  isUploadingImage: boolean;
  onOpenUpload: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
  onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
  templateAccess: 'core' | 'all';
}

export default function EditorElementLibrary({
  templates,
  selectedTemplateId,
  onApplyTemplate,
  onAddElement,
  onToggleColorPicker,
  isUploadingImage,
  onOpenUpload,
  fileInputRef,
  onImageUpload,
  templateAccess,
}: EditorElementLibraryProps) {
  const templateVisuals: Record<string, { icon: ReactNode; accent: string; chip: string }> = {
    valentine: {
      icon: <Heart size={14} />,
      accent: 'from-[#e99497] to-[#f3c583]',
      chip: 'Romantic',
    },
    'birthday-party': {
      icon: <Sparkles size={14} />,
      accent: 'from-[#f3c583] to-[#e8e46e]',
      chip: 'Party',
    },
    'holi-fest': {
      icon: <Sun size={14} />,
      accent: 'from-[#e8e46e] to-[#b3e283]',
      chip: 'Festival',
    },
    birthday: {
      icon: <Sparkles size={14} />,
      accent: 'from-[#b3e283] to-[#e99497]',
      chip: 'Classic',
    },
  };

  return (
    <div>
      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#c86d75] mb-4">Templates</h2>
      <div className="grid grid-cols-1 gap-3 mb-6">
        {templates.map((template) => {
          const isLocked = template.accessTier === 'premium' && templateAccess !== 'all';
          return (
          <div
            key={template.id}
            className={`group relative overflow-hidden rounded-2xl border bg-white text-left transition-all ${
              selectedTemplateId === template.id
                ? 'border-[#e99497] shadow-md shadow-[#e99497]/20'
                : 'border-[#f3c583]/45 hover:border-[#e8e46e] hover:shadow-sm'
            }`}
          >
            <div className={`h-1.5 w-full bg-gradient-to-r ${templateVisuals[template.id]?.accent || 'from-[#e99497] to-[#b3e283]'}`} />
            <button onClick={() => onApplyTemplate(template)} className="w-full p-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-7 w-7 place-items-center rounded-full bg-[#fff4dd] text-[#c86d75]">
                    {templateVisuals[template.id]?.icon || <Layout size={14} />}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#2f2c28]">{template.name}</p>
                    <p className="mt-0.5 text-[10px] text-[#6a645a]">One-click canvas starter</p>
                  </div>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    isLocked
                      ? 'bg-[#fff0f0] text-[#c2484f]'
                      : 'bg-[#f7ffe9] text-[#4b6a2e]'
                  }`}
                >
                  {isLocked ? 'Premium' : templateVisuals[template.id]?.chip || 'Template'}
                </span>
              </div>
            </button>
            {selectedTemplateId === template.id && (
              <div className="pointer-events-none absolute bottom-2 right-2 rounded-full bg-[#e99497] px-2 py-0.5 text-[10px] font-bold text-white">
                Applied
              </div>
            )}
          </div>
          );
        })}
      </div>

      <h2 className="text-xs font-semibold uppercase tracking-wider text-[#c86d75] mb-4">Add Elements</h2>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() =>
            onAddElement('text', {
              text: 'New Text',
              fontSize: 24,
              fontFamily: 'Inter',
              fontWeight: 'normal',
              textAlign: 'left',
              lineHeight: 1.2,
              fill: '#000000',
              width: 240,
              height: 48,
            })
          }
          className="flex flex-col items-center justify-center p-3 border border-[#f3c583]/45 rounded-xl hover:bg-[#fff4dd] transition-colors"
        >
          <Type size={20} className="text-[#c86d75] mb-1" />
          <span className="text-[10px] font-medium text-[#6a645a]">Text</span>
        </button>

        <button
          onClick={() => onAddElement('shape', { width: 100, height: 100 })}
          className="flex flex-col items-center justify-center p-3 border border-[#f3c583]/45 rounded-xl hover:bg-[#fff4dd] transition-colors"
        >
          <Square size={20} className="text-[#c86d75] mb-1" />
          <span className="text-[10px] font-medium text-[#6a645a]">Square</span>
        </button>

        <button
          onClick={() => onAddElement('character', { characterPart: 'heart', fill: '#fcd34d' })}
          className="flex flex-col items-center justify-center p-3 border border-[#f3c583]/45 rounded-xl hover:bg-[#fff4dd] transition-colors"
        >
          <User size={20} className="text-[#c86d75] mb-1" />
          <span className="text-[10px] font-medium text-[#6a645a]">Heart</span>
        </button>

        <button
          onClick={() =>
            onAddElement('button', {
              text: 'Yes',
              buttonType: 'yes',
              fill: '#10b981',
              textColor: '#ffffff',
              fontFamily: 'Inter',
              fontWeight: 'bold',
              borderRadius: 24,
              buttonSize: 'medium',
              paddingX: BUTTON_SIZE_PRESETS.medium.paddingX,
              paddingY: BUTTON_SIZE_PRESETS.medium.paddingY,
              width: BUTTON_SIZE_PRESETS.medium.width,
              height: BUTTON_SIZE_PRESETS.medium.height,
            })
          }
          className="flex flex-col items-center justify-center p-3 border border-[#f3c583]/45 rounded-xl hover:bg-[#fff4dd] transition-colors"
        >
          <Square size={20} className="text-[#c86d75] mb-1" />
          <span className="text-[10px] font-medium text-[#6a645a]">Yes Button</span>
        </button>

        <button
          onClick={() =>
            onAddElement('button', {
              text: 'No',
              buttonType: 'no',
              fill: '#ef4444',
              textColor: '#ffffff',
              fontFamily: 'Inter',
              fontWeight: 'bold',
              borderRadius: 24,
              buttonSize: 'medium',
              paddingX: BUTTON_SIZE_PRESETS.medium.paddingX,
              paddingY: BUTTON_SIZE_PRESETS.medium.paddingY,
              width: BUTTON_SIZE_PRESETS.medium.width,
              height: BUTTON_SIZE_PRESETS.medium.height,
            })
          }
          className="flex flex-col items-center justify-center p-3 border border-[#f3c583]/45 rounded-xl hover:bg-[#fff4dd] transition-colors"
        >
          <Square size={20} className="text-[#c86d75] mb-1" />
          <span className="text-[10px] font-medium text-[#6a645a]">No Button</span>
        </button>

        <button
          onClick={onToggleColorPicker}
          className="flex flex-col items-center justify-center p-3 border border-[#f3c583]/45 rounded-xl hover:bg-[#fff4dd] transition-colors"
        >
          <Palette size={20} className="text-[#c86d75] mb-1" />
          <span className="text-[10px] font-medium text-[#6a645a]">BG Color</span>
        </button>

        <button
          onClick={onOpenUpload}
          disabled={isUploadingImage}
          className="flex flex-col items-center justify-center p-3 border border-[#f3c583]/45 rounded-xl hover:bg-[#fff4dd] transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          <ImageIcon size={20} className="text-[#c86d75] mb-1" />
          <span className="text-[10px] font-medium text-[#6a645a]">{isUploadingImage ? 'Uploading...' : 'Upload'}</span>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onImageUpload}
            className="hidden"
            accept="image/*"
          />
        </button>
      </div>
    </div>
  );
}
