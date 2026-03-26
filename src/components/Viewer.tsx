import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

import type { CanvasElement, Invitation } from '../types';
import { DEFAULT_CANVAS_SIZE } from '../lib/canvas-config';
import { fetchInvitation } from '../lib/invitations-api';
import { useStageScale } from '../lib/use-stage-scale';
import { DEFAULT_REJECTION_MESSAGE, DEFAULT_SUCCESS_MESSAGE } from '../lib/invitation';

import HoliBackground from './viewer/HoliBackground';
import SuccessOverlay from './viewer/SuccessOverlay';
import ViewerStage from './viewer/ViewerStage';

const startTimedConfetti = () => {
  const duration = 15 * 1000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

  const interval = setInterval(() => {
    const timeLeft = animationEnd - Date.now();
    if (timeLeft <= 0) {
      clearInterval(interval);
      return;
    }

    const particleCount = 50 * (timeLeft / duration);
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
    confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
  }, 250);

  return () => clearInterval(interval);
};

interface ViewerResponseState {
  variant: 'success' | 'rejection';
  title: string;
  message: string;
  persistent: boolean;
}

export default function Viewer() {
  const { id } = useParams<{ id: string }>();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [responseState, setResponseState] = useState<ViewerResponseState | null>(null);
  const [noButtonScale, setNoButtonScale] = useState(1);
  const [yesButtonScale, setYesButtonScale] = useState(1);
  const [isMuted, setIsMuted] = useState(true);
  const [entranceComplete, setEntranceComplete] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const viewerFrameRef = useRef<HTMLDivElement>(null);
  const confettiCleanupRef = useRef<(() => void) | null>(null);
  const canvasSize = invitation?.canvasSize || DEFAULT_CANVAS_SIZE;
  const stageScale = useStageScale(viewerFrameRef, canvasSize.width, canvasSize.height);

  useEffect(() => {
    const loadInvitation = async () => {
      if (!id) return;

      try {
        const data = await fetchInvitation(id);
        setInvitation(data);
        setElements(data.elements);
        setEntranceComplete(false);
      } catch (fetchError) {
        console.error('Error fetching invitation:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load invitation.');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();

    return () => {
      confettiCleanupRef.current?.();
      confettiCleanupRef.current = null;
    };
  }, [id]);

  useEffect(() => {
    confettiCleanupRef.current?.();
    confettiCleanupRef.current = null;

    if (!entranceComplete || invitation?.animationType !== 'confetti') {
      return;
    }

    confettiCleanupRef.current = startTimedConfetti();

    return () => {
      confettiCleanupRef.current?.();
      confettiCleanupRef.current = null;
    };
  }, [entranceComplete, invitation?.animationType, invitation?.id]);

  useEffect(() => {
    if (!invitation?.musicUrl) {
      if (audioRef.current) audioRef.current.pause();
      return;
    }

    if (!audioRef.current) {
      audioRef.current = new Audio(invitation.musicUrl);
      audioRef.current.loop = true;
    }

    if (isMuted) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch((playError) => console.error('Audio play failed:', playError));
    }

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, [invitation?.musicUrl, isMuted]);

  useEffect(() => {
    if (responseState?.persistent) return;
    if (!responseState) return;

    const timeoutId = window.setTimeout(() => {
      setResponseState((current) => (current?.persistent ? current : null));
    }, 1600);

    return () => window.clearTimeout(timeoutId);
  }, [responseState]);

  const moveNoButton = (elementId: string, showMessage: boolean) => {
    const padding = 50;

    setElements((prev) =>
      prev.map((element) => {
        if (element.id !== elementId) return element;

        const maxX = Math.max(0, canvasSize.width - (element.width || 100) - padding * 2);
        const maxY = Math.max(0, canvasSize.height - (element.height || 50) - padding * 2);

        return {
          ...element,
          x: Math.random() * maxX + padding,
          y: Math.random() * maxY + padding,
        };
      })
    );

    setNoButtonScale((prev) => prev * 0.9);

    if (showMessage) {
      setResponseState({
        variant: 'rejection',
        title: 'Response received',
        message: invitation?.rejectionMessage || DEFAULT_REJECTION_MESSAGE,
        persistent: false,
      });
    }
  };

  const handleYesClick = () => {
    setResponseState({
      variant: 'success',
      title: 'Invitation accepted',
      message: invitation?.successMessage || DEFAULT_SUCCESS_MESSAGE,
      persistent: true,
    });

    if (invitation?.animationType === 'confetti') {
      confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#fff9ef]">
        <Loader2 className="animate-spin text-[#d3872e]" size={48} />
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#fff9ef] p-6 text-center">
        <h1 className="text-2xl font-serif text-[#2f2c28] mb-2">Oops!</h1>
        <p className="text-[#6a645a]">{error || 'Something went wrong.'}</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[linear-gradient(160deg,_#fff6ea_0%,_#fffde8_45%,_#f4ffdf_100%)] p-4 md:p-12">
      {invitation.musicUrl && (
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="absolute top-4 right-4 z-50 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-all"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="text-[#c86d75]" />}
        </button>
      )}

      {invitation.animationType === 'holi' && <HoliBackground />}

      <div
        ref={viewerFrameRef}
        className="relative z-10 flex min-h-[calc(100vh-2rem)] items-center justify-center md:min-h-[calc(100vh-6rem)]"
      >
        <div
          className="relative shrink-0"
          style={{ width: canvasSize.width * stageScale, height: canvasSize.height * stageScale }}
        >
          <div
            className="relative overflow-hidden rounded-lg bg-white shadow-2xl"
            style={{
              width: canvasSize.width,
              height: canvasSize.height,
              transform: `scale(${stageScale})`,
              transformOrigin: 'top left',
            }}
          >
            <ViewerStage
              key={invitation.id}
              elements={elements}
              backgroundColor={invitation.backgroundColor}
              canvasSize={canvasSize}
              entranceAnimation={invitation.entranceAnimation || 'fadein'}
              noButtonScale={noButtonScale}
              yesButtonScale={yesButtonScale}
              onYes={handleYesClick}
              onNoMove={(elementId) => moveNoButton(elementId, false)}
              onNoTap={(elementId) => moveNoButton(elementId, true)}
              onYesHover={(isHovering) => setYesButtonScale(isHovering ? 1.1 : 1)}
              onEntranceComplete={() => setEntranceComplete(true)}
            />
          </div>
        </div>
      </div>

      <SuccessOverlay
        isOpen={Boolean(responseState)}
        variant={responseState?.variant || 'success'}
        title={responseState?.title || ''}
        message={responseState?.message || ''}
        actionLabel={responseState?.persistent ? 'Back to invite' : undefined}
        onAction={responseState?.persistent ? () => setResponseState(null) : undefined}
        onDismiss={() => setResponseState(null)}
      />
    </div>
  );
}
