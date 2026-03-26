import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { SketchPicker } from 'react-color';
import { nanoid } from 'nanoid';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { TEMPLATES, type Template } from '../templates';
import type { BillingOverview, CanvasElement, CanvasSize, Invitation, InviteSummary, PlanId } from '../types';
import {
  buildInvitationPayload,
  DEFAULT_ENTRANCE_ANIMATION,
  DEFAULT_REJECTION_MESSAGE,
  DEFAULT_SUCCESS_MESSAGE,
  estimateBytes,
  sanitizeCanvasSize,
  sanitizeElement,
} from '../lib/invitation';
import { clampElementToCanvas, resizeElementsForCanvas } from '../lib/canvas-size';
import { DEFAULT_CANVAS_SIZE } from '../lib/canvas-config';
import {
  archiveInvitation,
  createCustomerPortalSession,
  fetchBillingOverview,
  fetchMyInvitations,
  startPlanCheckout,
} from '../lib/billing-api';
import { startKonvaElementAnimation } from '../lib/element-animation';
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
  const [searchParams] = useSearchParams();
  const { user, signOut } = useAuth();
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [successMessage, setSuccessMessage] = useState(DEFAULT_SUCCESS_MESSAGE);
  const [rejectionMessage, setRejectionMessage] = useState(DEFAULT_REJECTION_MESSAGE);
  const [animationType, setAnimationType] = useState<'confetti' | 'holi' | 'none'>('none');
  const [entranceAnimation, setEntranceAnimation] =
    useState<NonNullable<Invitation['entranceAnimation']>>(DEFAULT_ENTRANCE_ANIMATION);
  const [canvasSize, setCanvasSize] = useState<CanvasSize>(DEFAULT_CANVAS_SIZE);
  const [musicUrl, setMusicUrl] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [billingOverview, setBillingOverview] = useState<BillingOverview | null>(null);
  const [myInvitations, setMyInvitations] = useState<InviteSummary[]>([]);
  const [isAccountLoading, setIsAccountLoading] = useState(true);
  const [billingAction, setBillingAction] = useState<PlanId | 'portal' | null>(null);
  const [billingNotice, setBillingNotice] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<any>(null);
  const transformerRef = useRef<any>(null);
  const previewAnimationCleanupRef = useRef<(() => void) | null>(null);

  const selectedElement = useMemo(
    () => elements.find((element) => element.id === selectedId),
    [elements, selectedId]
  );
  const currentPlan = billingOverview?.currentPlan ?? null;
  const activeInvites = myInvitations.filter((invitation) => invitation.status === 'active');
  const isAtInviteLimit =
    billingOverview?.usage.maxActiveInvites !== null &&
    billingOverview?.usage.remainingActiveInvites === 0;

  const refreshAccountData = useCallback(async () => {
    if (!user) {
      setBillingOverview(null);
      setMyInvitations([]);
      setIsAccountLoading(false);
      return;
    }

    setIsAccountLoading(true);
    try {
      const [nextBillingOverview, nextInvitations] = await Promise.all([
        fetchBillingOverview(),
        fetchMyInvitations(),
      ]);
      setBillingOverview(nextBillingOverview);
      setMyInvitations(nextInvitations);
    } catch (error) {
      console.error('Failed to load account state:', error);
      setBillingNotice(
        error instanceof Error ? error.message : 'Could not load billing and invitation status.'
      );
    } finally {
      setIsAccountLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!transformerRef.current || !selectedId) return;
    const selectedNode = stageRef.current?.findOne('#' + selectedId);
    if (!selectedNode) return;
    transformerRef.current.nodes([selectedNode]);
    transformerRef.current.getLayer().batchDraw();
  }, [elements, selectedId]);

  useEffect(() => {
    return () => {
      previewAnimationCleanupRef.current?.();
    };
  }, []);

  useEffect(() => {
    previewAnimationCleanupRef.current?.();
    previewAnimationCleanupRef.current = null;
  }, [selectedId]);

  useEffect(() => {
    void refreshAccountData();
  }, [refreshAccountData]);

  useEffect(() => {
    if (searchParams.get('billing') === 'return') {
      setBillingNotice('Payment detected. Billing status can take a few seconds to refresh.');
      void refreshAccountData();
    }
  }, [refreshAccountData, searchParams]);

  useEffect(() => {
    if (!currentPlan) {
      return;
    }

    if (!currentPlan.capabilities.allowCustomResponseMessages) {
      setSuccessMessage(DEFAULT_SUCCESS_MESSAGE);
      setRejectionMessage(DEFAULT_REJECTION_MESSAGE);
    }

    if (!currentPlan.capabilities.allowMusic && musicUrl) {
      setMusicUrl('');
    }

    if (!currentPlan.capabilities.allowPostLoadEffects && animationType !== 'none') {
      setAnimationType('none');
    }

    if (
      !currentPlan.capabilities.allowPremiumEntranceAnimations &&
      ['envelope', 'slideup', 'cardflip'].includes(entranceAnimation)
    ) {
      setEntranceAnimation(DEFAULT_ENTRANCE_ANIMATION);
    }
  }, [
    animationType,
    currentPlan,
    entranceAnimation,
    musicUrl,
    setAnimationType,
    setEntranceAnimation,
    setMusicUrl,
    setRejectionMessage,
    setSuccessMessage,
  ]);

  const addElement = (type: CanvasElement['type'], extraProps: Partial<CanvasElement> = {}) => {
    const newElement = sanitizeElement({
      id: nanoid(),
      type,
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      fill: '#3b82f6',
      rotation: 0,
      ...extraProps,
    } as CanvasElement);

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
        element.id === id
          ? clampElementToCanvas(
              {
                ...element,
                x: event.target.x(),
                y: event.target.y(),
              },
              canvasSize
            )
          : element
      )
    );
  };

  const handleTransformEnd = (id: string, event: KonvaEventObject<Event>) => {
    const node = event.target;
    setElements((prev) =>
      prev.map((element) =>
        element.id === id
          ? clampElementToCanvas(
              {
                ...element,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * node.scaleX()),
                height: Math.max(5, node.height() * node.scaleY()),
                rotation: node.rotation(),
                ...(element.type === 'button' ? { buttonSize: 'custom' as const } : {}),
              },
              canvasSize
            )
          : element
      )
    );
    node.scaleX(1);
    node.scaleY(1);
  };

  const handleCanvasSizeChange = (nextCanvasSize: CanvasSize) => {
    const safeCanvasSize = sanitizeCanvasSize(nextCanvasSize);
    setElements((prev) => resizeElementsForCanvas(prev, canvasSize, safeCanvasSize));
    setCanvasSize(safeCanvasSize);
  };

  const handlePreviewSelectedAnimation = () => {
    if (!selectedId) {
      return;
    }

    const selectedNode = stageRef.current?.findOne('#' + selectedId);
    if (!selectedNode) {
      return;
    }

    const element = elements.find((entry) => entry.id === selectedId);
    if (!element?.elementAnimation || element.elementAnimation.type === 'none') {
      return;
    }

    previewAnimationCleanupRef.current?.();
    previewAnimationCleanupRef.current = startKonvaElementAnimation(
      selectedNode,
      element.elementAnimation,
      {
        loopOverride: false,
        onComplete: () => {
          previewAnimationCleanupRef.current = null;
        },
      }
    );
  };

  const applyTemplate = (template: Template) => {
    const newElements = template.elements.map((element) =>
      sanitizeElement({ ...element, id: nanoid() } as CanvasElement)
    );
    setElements(newElements);
    setSelectedTemplateId(template.id);
    setBackgroundColor(template.backgroundColor);
    setSuccessMessage(template.successMessage ?? DEFAULT_SUCCESS_MESSAGE);
    setRejectionMessage(template.rejectionMessage ?? DEFAULT_REJECTION_MESSAGE);
    setAnimationType(template.animationType ?? 'none');
    setEntranceAnimation(template.entranceAnimation ?? DEFAULT_ENTRANCE_ANIMATION);
    setCanvasSize(sanitizeCanvasSize(template.canvasSize ?? DEFAULT_CANVAS_SIZE));
    setMusicUrl(template.musicUrl ?? '');
    setSelectedId(null);
  };

  const handleTemplateSelect = (template: Template) => {
    const isPremiumTemplate = template.accessTier === 'premium';
    const canUsePremiumTemplates = currentPlan?.capabilities.templateAccess === 'all';

    if (isPremiumTemplate && !canUsePremiumTemplates) {
      setBillingNotice(`${template.name} is available on paid plans only.`);
      return;
    }

    applyTemplate(template);
  };

  const clearCanvas = () => {
    if (!confirm('Are you sure you want to clear the canvas?')) return;
    setElements([]);
    setSelectedId(null);
  };

  const handlePlanCheckout = async (planId: PlanId) => {
    setBillingAction(planId);

    try {
      const result = await startPlanCheckout(planId);
      if (result.mode === 'changed') {
        setBillingNotice(result.message || 'Plan change requested. Refreshing account state.');
        await refreshAccountData();
        return;
      }

      if (!result.checkoutUrl) {
        throw new Error('Checkout session did not return a URL.');
      }

      window.location.href = result.checkoutUrl;
    } catch (error) {
      console.error('Checkout start failed:', error);
      alert(error instanceof Error ? error.message : 'Could not start checkout.');
    } finally {
      setBillingAction(null);
    }
  };

  const handleOpenBillingPortal = async () => {
    setBillingAction('portal');

    try {
      const portalUrl = await createCustomerPortalSession();
      window.location.href = portalUrl;
    } catch (error) {
      console.error('Opening billing portal failed:', error);
      alert(error instanceof Error ? error.message : 'Could not open billing portal.');
    } finally {
      setBillingAction(null);
    }
  };

  const copyToClipboard = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    if (isAtInviteLimit) {
      alert('Your current plan has reached its active invite limit. Archive an invite or upgrade.');
      return;
    }

    setIsGenerating(true);

    const invitation = buildInvitationPayload({
      id: nanoid(10),
      elements,
      backgroundColor,
      successMessage,
      rejectionMessage,
      animationType,
      entranceAnimation,
      musicUrl,
      canvasSize,
      templateId: selectedTemplateId || undefined,
    });

    if (estimateBytes(invitation) > SAFE_DOC_LIMIT_BYTES) {
      setIsGenerating(false);
      alert('This invite is too large to save, usually due to uploaded images. Try a smaller image or remove one.');
      return;
    }

    try {
      const id = await createInvitation(invitation);
      setShareUrl(`${window.location.origin}/invite/${id}`);
      await refreshAccountData();
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

  const handleArchiveInvite = async (id: string) => {
    if (!confirm('Archive this invite? Archived invites stop counting toward your plan limit.')) {
      return;
    }

    try {
      await archiveInvitation(id);
      if (shareUrl?.endsWith(`/invite/${id}`)) {
        setShareUrl(null);
      }
      await refreshAccountData();
    } catch (error) {
      console.error('Archive failed:', error);
      alert(error instanceof Error ? error.message : 'Could not archive invitation.');
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
    <div className="flex h-screen overflow-hidden flex-col bg-[linear-gradient(160deg,_#fff6ea_0%,_#fffde8_40%,_#f4ffdf_100%)] font-sans xl:flex-row">
      <div className="w-full shrink-0 border-b border-[#f3c583]/60 bg-white/95 p-4 shadow-sm xl:flex xl:h-full xl:w-80 xl:flex-col xl:overflow-hidden xl:border-b-0 xl:border-r xl:p-6">
        <div className="flex max-h-[42vh] flex-col gap-8 overflow-y-auto pr-1 xl:min-h-0 xl:max-h-none xl:flex-1 xl:pr-2">
          <EditorElementLibrary
            templates={TEMPLATES}
            selectedTemplateId={selectedTemplateId}
            onApplyTemplate={handleTemplateSelect}
            onAddElement={addElement}
            onToggleColorPicker={() => setShowColorPicker((prev) => !prev)}
            isUploadingImage={isUploadingImage}
            onOpenUpload={() => fileInputRef.current?.click()}
            fileInputRef={fileInputRef}
            onImageUpload={handleImageUpload}
            templateAccess={currentPlan?.capabilities.templateAccess || 'core'}
          />

          <EditorSettingsPanel
            selectedElement={selectedElement ?? null}
            successMessage={successMessage}
            rejectionMessage={rejectionMessage}
            onSuccessMessageChange={setSuccessMessage}
            onRejectionMessageChange={setRejectionMessage}
            animationType={animationType}
            onAnimationTypeChange={setAnimationType}
            entranceAnimation={entranceAnimation}
            onEntranceAnimationChange={setEntranceAnimation}
            canvasSize={canvasSize}
            onCanvasSizeChange={handleCanvasSizeChange}
            musicUrl={musicUrl}
            onMusicUrlChange={setMusicUrl}
            onUpdateSelected={updateSelected}
            onDeleteSelected={deleteSelected}
            onPreviewSelectedAnimation={handlePreviewSelectedAnimation}
            planCapabilities={currentPlan?.capabilities}
            currentPlanLabel={currentPlan?.label || 'Starter'}
            onUpgradeRequest={handlePlanCheckout}
          />

          <div className="rounded-2xl border border-[#f3c583]/45 bg-[#fffaf0] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#c86d75]">
                  Current Plan
                </p>
                <p className="mt-2 text-lg font-bold text-[#2f2c28]">
                  {currentPlan?.label || 'Loading...'}
                </p>
                <p className="text-xs text-[#6a645a]">
                  {billingOverview
                    ? billingOverview.usage.maxActiveInvites === null
                      ? `${billingOverview.usage.activeInvites} active invites`
                      : `${billingOverview.usage.activeInvites}/${billingOverview.usage.maxActiveInvites} active invites`
                    : 'Fetching limits...'}
                </p>
              </div>

              {billingOverview?.profile.hasCustomerPortal ? (
                <button
                  type="button"
                  onClick={handleOpenBillingPortal}
                  disabled={billingAction === 'portal'}
                  className="rounded-xl border border-[#b3e283] bg-[#f7ffe9] px-3 py-2 text-xs font-semibold text-[#3f6630] disabled:opacity-60"
                >
                  {billingAction === 'portal' ? 'Opening...' : 'Manage Billing'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handlePlanCheckout('creator')}
                  disabled={billingAction !== null}
                  className="rounded-xl border border-[#e99497]/60 bg-white px-3 py-2 text-xs font-semibold text-[#c86d75] disabled:opacity-60"
                >
                  Upgrade
                </button>
              )}
            </div>

            {billingNotice && (
              <p className="mt-3 rounded-xl bg-white px-3 py-2 text-xs text-[#6a645a]">
                {billingNotice}
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-[#f3c583]/45 bg-white p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#c86d75]">
                  Active Invites
                </p>
                <p className="mt-1 text-xs text-[#6a645a]">
                  Archive old links to free up plan capacity.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-col gap-3">
              {isAccountLoading && (
                <p className="text-xs text-[#6a645a]">Loading your invitations...</p>
              )}

              {!isAccountLoading && activeInvites.length === 0 && (
                <p className="text-xs text-[#6a645a]">No active invites yet.</p>
              )}

              {activeInvites.map((invitation) => (
                <div
                  key={invitation.id}
                  className="flex items-center justify-between gap-3 rounded-2xl bg-[#fffaf0] px-3 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#2f2c28]">
                      {invitation.title || 'Untitled invite'}
                    </p>
                    <p className="text-[11px] text-[#6a645a]">
                      {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleArchiveInvite(invitation.id)}
                    className="rounded-xl border border-[#f3c583]/60 px-3 py-2 text-[11px] font-semibold text-[#d3872e]"
                  >
                    Archive
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-auto flex flex-col gap-3">
            <button
              onClick={clearCanvas}
              className="w-full rounded-xl border border-[#f3c583]/60 p-3 text-xs font-medium text-[#d3872e] transition-all hover:bg-[#fff4dd]"
            >
              Clear Canvas
            </button>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || isAccountLoading || Boolean(isAtInviteLimit)}
              className="w-full rounded-2xl bg-gradient-to-r from-[#e99497] via-[#f3c583] to-[#e8e46e] p-4 text-[#2f2c28] shadow-lg shadow-[#f3c583]/35 transition-all hover:opacity-90 disabled:opacity-50"
            >
              {isGenerating
                ? 'Generating...'
                : isAtInviteLimit
                  ? 'Active Invite Limit Reached'
                  : 'Generate Invitation'}
            </button>
          </div>
        </div>
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
        <EditorTopBar
          shareUrl={shareUrl}
          copied={copied}
          onCopy={copyToClipboard}
          onSignOut={handleSignOut}
          userEmail={user?.email ?? undefined}
          currentPlanLabel={currentPlan?.label}
          usageLabel={
            billingOverview
              ? billingOverview.usage.maxActiveInvites === null
                ? `${billingOverview.usage.activeInvites} active`
                : `${billingOverview.usage.activeInvites}/${billingOverview.usage.maxActiveInvites} active`
              : undefined
          }
          onManageBilling={handleOpenBillingPortal}
          onUpgrade={() => handlePlanCheckout('creator')}
          hasCustomerPortal={Boolean(billingOverview?.profile.hasCustomerPortal)}
          billingBusy={billingAction !== null}
        />

        <EditorStage
          elements={elements}
          selectedId={selectedId}
          canvasSize={canvasSize}
          backgroundColor={backgroundColor}
          stageRef={stageRef}
          transformerRef={transformerRef}
          onSelect={setSelectedId}
          onDragEnd={handleDragEnd}
          onTransformEnd={handleTransformEnd}
        />

        {showColorPicker && (
          <div className="absolute inset-x-4 top-20 z-20 animate-in fade-in zoom-in-95 xl:left-72 xl:right-auto">
            <div className="fixed inset-0" onClick={() => setShowColorPicker(false)} />
            <SketchPicker color={backgroundColor} onChangeComplete={(color) => setBackgroundColor(color.hex)} />
          </div>
        )}
      </div>
    </div>
  );
}
