import { useEffect, useRef, useState } from "react";
import { useTimelineStore, zoomConfig } from "../store/TimelineStore";
interface PlayheadProps {
  play: boolean;
  timelineRef: React.RefObject<HTMLDivElement>;
}

export default function Playhead({ play, timelineRef }: PlayheadProps) {
  const { zoom, playHeadPosition, setPlayHeadPosition } = useTimelineStore();
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
      console.log({ prev, deltaMs, pxPerSecond,  deltaPx });
      return prev + deltaPx;
    });

    rafIdRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (play) {
      console.log("play");
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

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const scrollLeft = timelineRef.current.scrollLeft;
        const scrollWidth = timelineRef.current.scrollWidth;

        // Calculate position relative to the scrollable content (not just visible area)
        const newPosition = e.clientX - rect.left + scrollLeft;

        // Clamp position within timeline bounds (use scrollWidth for full scrollable width)
        const clampedPosition = Math.max(0, Math.min(newPosition, scrollWidth));
        setPlayHeadPosition(clampedPosition);
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, timelineRef, setPlayHeadPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      className="absolute top-0 left-0 w-1 h-full bg-red-500 cursor-ew-resize"
      style={{ left: `${playHeadPosition}px` }}
      onMouseDown={handleMouseDown}
    >
      <div className="w-1 h-full bg-red-500"></div>
    </div>
  );
}
