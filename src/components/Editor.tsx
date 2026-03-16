import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { SketchPicker } from 'react-color';
import { nanoid } from 'nanoid';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useNavigate } from 'react-router-dom';

import { TEMPLATES, type Template } from '../templates';
import type { CanvasElement } from '../types';
import { buildInvitationPayload, estimateBytes } from '../lib/invitation';
import { uploadImageViaBackend } from '../lib/image-upload';
import { createInvitation } from '../lib/invitations-api';
import { useAuth } from '../auth/AuthContext';

import EditorElementLibrary from './editor/EditorElementLibrary';
import EditorSettingsPanel from './editor/EditorSettingsPanel';
import EditorTopBar from './editor/EditorTopBar';
import EditorStage from './editor/EditorStage';

const SAFE_DOC_LIMIT_BYTES = 900 * 1024;

export default function Editor() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [successMessage, setSuccessMessage] = useState('Yay! I love you! ❤️');
  const [animationType, setAnimationType] = useState<'confetti' | 'holi' | 'none'>('none');
  const [musicUrl, setMusicUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedId),
    [elements, selectedId]
  );

  useEffect(() => {
    if (!transformerRef.current || !selectedId) return;
    const selectedNode = stageRef.current?.findOne('#' + selectedId);
    if (!selectedNode) return;
    transformerRef.current.nodes([selectedNode]);
    transformerRef.current.getLayer().batchDraw();
  }, [selectedId]);

  const addElement = (type: CanvasElement['type'], extraProps: Partial<CanvasElement> = {}) => {
    const newElement: CanvasElement = {
      id: nanoid(),
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      rotation: 0,
      ...extraProps,
    };

    setElements((prev) => [...prev, newElement]);
    setSelectedId(newElement.id);
  };

  const updateSelected = (props: Partial<CanvasElement>) => {
    if (!selectedId) return;
    setElements((prev) => prev.map((element) => (element.id === selectedId ? { ...element, ...props } : element)));
  };

  const deleteSelected = () => {
    if (!selectedId) return;
    setElements((prev) => prev.filter((element) => element.id !== selectedId));
    setSelectedId(null);
  };

  const handleDragEnd = (id: string, event: KonvaEventObject<DragEvent>) => {
    setElements((prev) =>
      prev.map((element) =>
        element.id === id ? { ...element, x: event.target.x(), y: event.target.y() } : element
      )
    );
  };

  const handleTransformEnd = (id: string, event: KonvaEventObject<Event>) => {
    const node = event.target;
    setElements((prev) =>
      prev.map((element) =>
        element.id === id
          ? {
              ...element,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * node.scaleX()),
              height: Math.max(5, node.height() * node.scaleY()),
              rotation: node.rotation(),
            }
          : element
      )
    );
    node.scaleX(1);
    node.scaleY(1);
  };

  const applyTemplate = (template: Template) => {
    const newElements = template.elements.map((element) => ({ ...element, id: nanoid() }));
    setElements(newElements);
    setSelectedTemplateId(template.id);
    setBackgroundColor(template.backgroundColor);
    setSuccessMessage(template.successMessage ?? 'Yay! I love you! ❤️');
    setAnimationType(template.animationType ?? 'none');
    setMusicUrl(template.musicUrl ?? '');
    setSelectedId(null);
  };

  const clearCanvas = () => {
    if (!confirm('Are you sure you want to clear the canvas?')) return;
    setElements([]);
    setSelectedId(null);
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);

    const invitation = buildInvitationPayload({
      id: nanoid(10),
      elements,
      backgroundColor,
      successMessage,
      animationType,
      musicUrl,
    });

    if (estimateBytes(invitation) > SAFE_DOC_LIMIT_BYTES) {
      setIsGenerating(false);
      alert('This invite is too large to save, usually due to uploaded images. Try a smaller image or remove one.');
      return;
    }

    try {
      const id = await createInvitation(invitation);
      setShareUrl(`${window.location.origin}/invite/${id}`);
    } catch (error) {
      console.error('Error saving invitation:', error);
      alert(error instanceof Error ? error.message : 'Failed to save invitation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const src = await uploadImageViaBackend(file);
      addElement('image', { src, width: 200, height: 200 });
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(error instanceof Error ? error.message : "Couldn't upload image. Please try again.");
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Sign out failed:', error);
      alert('Could not sign out. Try again.');
    }
  };

  return (
    <div className="flex h-screen bg-[linear-gradient(160deg,_#fff6ea_0%,_#fffde8_40%,_#f4ffdf_100%)] font-sans">
      <div className="w-72 bg-white/95 border-r border-[#f3c583]/60 p-6 flex flex-col gap-8 shadow-sm overflow-y-auto">
        <EditorElementLibrary
          templates={TEMPLATES}
          selectedTemplateId={selectedTemplateId}
          onApplyTemplate={applyTemplate}
          onAddElement={addElement}
          onToggleColorPicker={() => setShowColorPicker((prev) => !prev)}
          isUploadingImage={isUploadingImage}
          onOpenUpload={() => fileInputRef.current?.click()}
          fileInputRef={fileInputRef}
          onImageUpload={handleImageUpload}
        />

        {selectedElement && (
          <EditorSettingsPanel
            selectedElement={selectedElement}
            successMessage={successMessage}
            onSuccessMessageChange={setSuccessMessage}
            animationType={animationType}
            onAnimationTypeChange={setAnimationType}
            musicUrl={musicUrl}
            onMusicUrlChange={setMusicUrl}
            onUpdateSelected={updateSelected}
            onDeleteSelected={deleteSelected}
          />
        )}

        <div className="mt-auto flex flex-col gap-3">
          <button
            onClick={clearCanvas}
            className="w-full border border-[#f3c583]/60 text-[#d3872e] p-3 rounded-xl flex items-center justify-center gap-2 hover:bg-[#fff4dd] transition-all text-xs font-medium"
          >
            Clear Canvas
          </button>
          <button
            onClick={handleGenerate}
            disabled={isGenerating}
            className="w-full bg-gradient-to-r from-[#e99497] via-[#f3c583] to-[#e8e46e] text-[#2f2c28] p-4 rounded-2xl flex items-center justify-center gap-2 hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[#f3c583]/35"
          >
            {isGenerating ? 'Generating...' : 'Generate Invitation'}
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-hidden">
        <EditorTopBar
          shareUrl={shareUrl}
          copied={copied}
          onCopy={copyToClipboard}
          onSignOut={handleSignOut}
          userEmail={user?.email ?? undefined}
        />

        <EditorStage
          elements={elements}
          selectedId={selectedId}
          backgroundColor={backgroundColor}
          stageRef={stageRef}
          transformerRef={transformerRef}
          onSelect={setSelectedId}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        />

        {showColorPicker && (
          <div className="absolute top-20 left-72 z-20 animate-in fade-in zoom-in-95">
            <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
            <SketchPicker color={backgroundColor} onChangeComplete={(color) => setBackgroundColor(color.hex)} />
          </div>
        )}
      </div>
    </div>
  );
}
