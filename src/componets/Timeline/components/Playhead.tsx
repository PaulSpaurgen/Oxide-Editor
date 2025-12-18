import { useEffect, useRef, useState } from "react";
import { useTimelineStore, zoomConfig } from "../store/TimelineStore";
interface PlayheadProps {
  play: boolean;
  timelineRef: React.RefObject<HTMLDivElement>;
}

export default function Playhead({ play, timelineRef }: PlayheadProps) {
  const {
    zoom,
    playHeadPosition,
    setPlayHeadPosition,
    setElapsedTime,
    elapsedTime,
  } = useTimelineStore();
  const rafIdRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  const [isDragging, setIsDragging] = useState(false);

  const animate = (time: number) => {
    if (lastTimeRef.current == null) {
      lastTimeRef.current = time;
    }

    const deltaMs = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const pxPerSecond = zoomConfig[zoom].pxPerSecond;
    const deltaPx = (deltaMs / 1000) * pxPerSecond;

    setPlayHeadPosition((prev) => {
      return prev + deltaPx;
    });
    setElapsedTime((prev) => prev + deltaMs);
    rafIdRef.current = requestAnimationFrame(animate);
  };


  useEffect(() => {
    if (play) {
      rafIdRef.current = requestAnimationFrame(animate);
    } else {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = null;
    }

    return () => {
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }
      lastTimeRef.current = null;
    };
  }, [play, zoom]);

   useEffect(() => {
      const newPoistion = elapsedTime / 1000 * zoomConfig[zoom].pxPerSecond;
      setPlayHeadPosition(newPoistion);
   }, [zoom]);

  const handleMouseMove = (e: MouseEvent) => {
    if (timelineRef.current) {
      const rect = timelineRef.current.getBoundingClientRect();
      const scrollLeft = timelineRef.current.scrollLeft;
      const newPosition = e.clientX - rect.left + scrollLeft;
      if (newPosition < 0) {
        setPlayHeadPosition(0);
      } else {
        setPlayHeadPosition(newPosition);
        const elapsedTime = (newPosition / zoomConfig[zoom].pxPerSecond) * 1000;
        setElapsedTime(elapsedTime);
      }
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      className="absolute top-0 left-0 w-[1px] h-full bg-red-500 cursor-ew-resize"
      style={{ left: `${playHeadPosition}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-1 h-full bg-red-500"></div>
    </div>
  );
}
