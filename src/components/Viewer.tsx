import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Volume2, VolumeX } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import confetti from 'canvas-confetti';

import type { CanvasElement, Invitation } from '../types';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../lib/canvas-config';
import { fetchInvitation } from '../lib/invitations-api';

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

export default function Viewer() {
  const { id } = useParams<{ id: string }>();

  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [elements, setElements] = useState<CanvasElement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [noButtonScale, setNoButtonScale] = useState(1);
  const [yesButtonScale, setYesButtonScale] = useState(1);
  const [isMuted, setIsMuted] = useState(true);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let cleanupConfetti: (() => void) | undefined;

    const loadInvitation = async () => {
      if (!id) return;

      try {
        const data = await fetchInvitation(id);
        setInvitation(data);
        setElements(data.elements);

        if (data.animationType === 'confetti') {
          cleanupConfetti = startTimedConfetti();
        }
      } catch (fetchError) {
        console.error('Error fetching invitation:', fetchError);
        setError(fetchError instanceof Error ? fetchError.message : 'Failed to load invitation.');
      } finally {
        setLoading(false);
      }
    };

    loadInvitation();

    return () => {
      if (cleanupConfetti) cleanupConfetti();
    };
  }, [id]);

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

  const handleNoInteraction = (elementId: string) => {
    const padding = 50;

    setElements((prev) =>
      prev.map((element) => {
        if (element.id !== elementId) return element;

        return {
          ...element,
          x: Math.random() * (STAGE_WIDTH - (element.width || 100) - padding * 2) + padding,
          y: Math.random() * (STAGE_HEIGHT - (element.height || 50) - padding * 2) + padding,
        };
      })
    );

    setNoButtonScale((prev) => prev * 0.9);
  };

  const handleYesClick = () => {
    setIsSuccess(true);
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
    <div className="min-h-screen bg-[linear-gradient(160deg,_#fff6ea_0%,_#fffde8_45%,_#f4ffdf_100%)] flex items-center justify-center p-4 md:p-12 relative overflow-hidden">
      {invitation.musicUrl && (
        <button
          onClick={() => setIsMuted((prev) => !prev)}
          className="absolute top-4 right-4 z-50 p-3 bg-white/80 backdrop-blur rounded-full shadow-lg hover:bg-white transition-all"
        >
          {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} className="text-[#c86d75]" />}
        </button>
      )}

      {invitation.animationType === 'holi' && <HoliBackground />}

      <AnimatePresence>
        {isSuccess ? (
          <SuccessOverlay
            message={invitation.successMessage || 'Yay! I love you! ❤️'}
            onBack={() => setIsSuccess(false)}
          />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="shadow-2xl rounded-lg overflow-hidden bg-white relative z-10"
            style={{ width: STAGE_WIDTH, height: STAGE_HEIGHT }}
          >
            <ViewerStage
              elements={elements}
              backgroundColor={invitation.backgroundColor}
              noButtonScale={noButtonScale}
              yesButtonScale={yesButtonScale}
              onYes={handleYesClick}
              onNo={handleNoInteraction}
              onYesHover={(isHovering) => setYesButtonScale(isHovering ? 1.1 : 1)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
