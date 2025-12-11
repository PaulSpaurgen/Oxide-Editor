import { useEffect, useRef, useState } from "react";
import { useTimelineStore } from "../store/TimelineStore";
interface PlayheadProps {
  play: boolean;
  timelineRef: React.RefObject<HTMLDivElement>;
}

export default function Playhead({ play, timelineRef }: PlayheadProps) {
  const { playHeadPosition, setPlayHeadPosition, zoom } = useTimelineStore();
  const animationFrameId = useRef<number>(0);
  const [isDragging, setIsDragging] = useState(false);

  const startAnimation = () => {
    let increment = 0;
    const animate = () => {
      increment += 1;
      setPlayHeadPosition(playHeadPosition + increment);
      animationFrameId.current = requestAnimationFrame(animate);
    };
    animationFrameId.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    if (play) {
      startAnimation();
    } else {
      cancelAnimationFrame(animationFrameId.current);
    }
    return () => {
      cancelAnimationFrame(animationFrameId.current);
    };
  }, [play, timelineRef]);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (timelineRef.current) {
        const rect = timelineRef.current.getBoundingClientRect();
        const newPosition = e.clientX - rect.left;
        
        // Clamp position within timeline bounds
        const clampedPosition = Math.max(0, Math.min(newPosition, rect.width));
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
