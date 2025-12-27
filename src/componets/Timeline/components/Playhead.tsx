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
  const playheadRef = useRef<HTMLDivElement>(null);

  const [isDragging, setIsDragging] = useState(false);
  const edgeScrollRafRef = useRef<number | null>(null);
  const edgeScrollVelocityRef = useRef(0); // px per frame (~60fps)
  const lastDragClientXRef = useRef<number | null>(null);

  // Function to scroll the timeline to keep playhead in view
  const scrollToPlayhead = (position: number) => {
    if (!timelineRef.current) return;

    const container = timelineRef.current;
    const containerWidth = container.offsetWidth;
    const scrollLeft = container.scrollLeft;
    const scrollRight = scrollLeft + containerWidth;

    // Add some padding to keep playhead away from edges
    const padding = 50;

    // If playhead is beyond the right edge, scroll right
    if (position > scrollRight - padding) {
      container.scrollLeft = position - containerWidth + padding;
    }
    // If playhead is beyond the left edge, scroll left
    else if (position < scrollLeft + padding) {
      container.scrollLeft = position - padding;
    }
  };

  const updateDragFromClientX = (clientX: number) => {
    if (!timelineRef.current) return;
    const container = timelineRef.current;
    const rect = container.getBoundingClientRect();
    const scrollLeft = container.scrollLeft;

    const newPosition = clientX - rect.left + scrollLeft;
    const clampedPosition = Math.max(0, newPosition);

    setPlayHeadPosition(clampedPosition);
    const nextElapsed = (clampedPosition / zoomConfig[zoom].pxPerSecond) * 1000;
    setElapsedTime(nextElapsed);
  };

  const stopEdgeScroll = () => {
    edgeScrollVelocityRef.current = 0;
    if (edgeScrollRafRef.current != null) {
      cancelAnimationFrame(edgeScrollRafRef.current);
      edgeScrollRafRef.current = null;
    }
  };

  const startEdgeScrollLoop = () => {
    if (edgeScrollRafRef.current != null) return;

    const tick = () => {
      // If drag ended, stop.
      if (!isDragging || !timelineRef.current) {
        stopEdgeScroll();
        return;
      }

      const container = timelineRef.current;
      const velocity = edgeScrollVelocityRef.current;

      if (velocity !== 0) {
        const maxScroll = container.scrollWidth - container.clientWidth;
        const nextScrollLeft = Math.min(maxScroll, Math.max(0, container.scrollLeft + velocity));
        container.scrollLeft = nextScrollLeft;

        // Important: as we scroll, recompute playhead position from the last mouse X so it
        // continues moving smoothly (otherwise it "sticks" until the next mousemove).
        if (lastDragClientXRef.current != null) {
          updateDragFromClientX(lastDragClientXRef.current);
        }
      }

      edgeScrollRafRef.current = requestAnimationFrame(tick);
    };

    edgeScrollRafRef.current = requestAnimationFrame(tick);
  };

  // Set scroll velocity based on pointer proximity to edges (no timers restarted on every move).
  const setEdgeScrollVelocityFromClientX = (clientX: number) => {
    if (!timelineRef.current) return;
    const container = timelineRef.current;
    const rect = container.getBoundingClientRect();

    const edgeThreshold = 120; // px from edge
    const maxSpeed = 28; // px per frame (~1680px/sec @ 60fps)

    const distanceFromLeft = clientX - rect.left;
    const distanceFromRight = rect.right - clientX;

    let v = 0;
    if (distanceFromLeft > 0 && distanceFromLeft < edgeThreshold) {
      const t = 1 - distanceFromLeft / edgeThreshold; // 0..1
      v = -maxSpeed * t * t; // ease-in
    } else if (distanceFromRight > 0 && distanceFromRight < edgeThreshold) {
      const t = 1 - distanceFromRight / edgeThreshold; // 0..1
      v = maxSpeed * t * t; // ease-in
    }

    edgeScrollVelocityRef.current = v;
    if (v !== 0) startEdgeScrollLoop();
  };

  const animate = (time: number) => {
    if (lastTimeRef.current == null) {
      lastTimeRef.current = time;
    }

    const deltaMs = time - lastTimeRef.current;
    lastTimeRef.current = time;

    const pxPerSecond = zoomConfig[zoom].pxPerSecond;
    const deltaPx = (deltaMs / 1000) * pxPerSecond;

    setPlayHeadPosition((prev) => {
      const newPosition = prev + deltaPx;
      scrollToPlayhead(newPosition);
      return newPosition;
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
      const newPosition = elapsedTime / 1000 * zoomConfig[zoom].pxPerSecond;
      setPlayHeadPosition(newPosition);
      scrollToPlayhead(newPosition);
   }, [zoom]);

  const handleMouseMove = (e: MouseEvent) => {
    if (timelineRef.current) {
      lastDragClientXRef.current = e.clientX;
      setEdgeScrollVelocityFromClientX(e.clientX);
      updateDragFromClientX(e.clientX);
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    e.preventDefault();
    setIsDragging(false);
    lastDragClientXRef.current = null;
    stopEdgeScroll(); // Stop auto-scrolling when drag ends
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      lastDragClientXRef.current = null;
      stopEdgeScroll(); // Clean up auto-scroll on unmount
    };
  }, [isDragging]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  return (
    <div
      className="absolute top-0 left-0 w-1 h-full bg-red-500 cursor-ew-resize"
      style={{ left: `${playHeadPosition}px` }}
      onMouseDown={handleMouseDown}
      ref={playheadRef}
    >
      <div className="w-[0.5px] h-full bg-red-500"></div>
    </div>
  );
}
