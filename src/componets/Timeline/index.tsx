import { useEffect, useCallback, useRef, useState } from "react";
import {
  useTimelineStore,
  zoomConfig,
  zoomPxMultiple,
  ZoomLevel,
  minTimelineSeconds,
} from "./store/TimelineStore";
import Playhead from "./components/Playhead";

export default function Timeline() {
  const timelineRef = useRef<HTMLDivElement | null>(null);
  const { zoom, setZoom, play, setPlay } = useTimelineStore();
  const [ticks, setTicks] = useState<React.ReactElement[]>([]);

  // Format time based on majorTickSeconds
  const formatTickLabel = useCallback(
    (totalSeconds: number, majorTickSeconds: number): string => {
      if (majorTickSeconds >= 60) {
        // Format as MM:SS
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}`;
      } else {
        // Format as MM:SS:MsMsMs
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = Math.floor(totalSeconds % 60);
        const milliseconds = Math.floor((totalSeconds % 1) * 1000);
        return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
          2,
          "0"
        )}:${String(milliseconds).padStart(2, "0")}`;
      }
    },
    []
  );

  // draw ticks till width of the timeline
  const drawTicks = useCallback(() => {
    const gap = zoom * zoomPxMultiple;
    const ticksHtml = [];
    const majorTickSeconds = zoomConfig[zoom].majorTickSeconds;
    const containerWidth = timelineRef.current?.offsetWidth || 0;

    // Calculate minimum width needed to show minTimelineSeconds
    // Number of ticks needed = minTimelineSeconds / majorTickSeconds
    const numTicksNeeded = Math.ceil(minTimelineSeconds / majorTickSeconds);
    const timelineSecondsBasedwidth = numTicksNeeded * gap;

    // Use container width or minimum width, but cap at a reasonable maximum (50,000px)
    // This prevents UI breaking with extremely wide timelines while still allowing detail
    const maxReasonableWidth = 50000;
    const width = Math.min(
      Math.max(containerWidth, timelineSecondsBasedwidth),
      maxReasonableWidth
    );

    if (!width) return [];

    // Only show labels if gap is large enough to prevent overlap (at least 60px)
    const shouldShowLabel = gap >= 60;

    let counter = 0;
    for (let i = 0; i < width; i += gap) {
      const totalSeconds = counter * majorTickSeconds;
      const label = formatTickLabel(totalSeconds, majorTickSeconds);

      ticksHtml.push(
        <div
          key={i}
          style={{
            height: "20px",
            width: `${gap}px`,
            minWidth: `${gap}px`,
            borderLeft: "1px solid white",
            position: "relative",
            flexShrink: 0,
          }}
        >
          {shouldShowLabel && (
            <span
              style={{
                position: "absolute",
                bottom: "0px",
                left: "2px",
                fontSize: "10px",
                whiteSpace: "nowrap",
                maxWidth: `${Math.max(gap - 4, 0)}px`,
                overflow: "hidden",
                textOverflow: "ellipsis",
                pointerEvents: "none",
              }}
            >
              {label}
            </span>
          )}
        </div>
      );
      counter++;
    }
    return ticksHtml;
  }, [zoom, formatTickLabel]);

  // Update ticks after DOM is ready and when zoom changes
  useEffect(() => {
    // Use requestAnimationFrame to ensure DOM measurements are accurate
    const updateTicks = () => {
      const newTicks = drawTicks();
      setTicks(newTicks);
    };

    // Initial render after ref is populated
    updateTicks();

    // Also update on resize
    const resizeObserver = new ResizeObserver(() => {
      updateTicks();
    });

    if (timelineRef.current) {
      resizeObserver.observe(timelineRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, [drawTicks]);

  return (
    <div className="w-full bg-neutral-900 text-white select-none">
      {/* Zoom Slider */}
      <div className="p-2 flex items-center gap-4">
        <span>Zoom</span>
        <input
          type="range"
          min="1"
          max="5"
          step="1"
          value={zoom}
          onChange={(e) => setZoom(parseInt(e.target.value) as ZoomLevel)}
          className="w-48"
        />
        <span>{zoom}x</span>
        <button onClick={() => setPlay(!play)}>
          {play ? "Pause" : "Play"}
        </button>
      </div>

      {/* Timeline Area */}
      <div className="pl-4">
        <div
          ref={timelineRef}
          className="w-full h-72 overflow-x-auto relative bg-neutral-800 "
        >
          <div className="flex" style={{ minWidth: "100%" }}>
            {ticks}
          </div>
          <Playhead play={play} timelineRef={timelineRef as React.RefObject<HTMLDivElement>} />
          {/* Timeline Inner Content */}
        </div>
      </div>
    </div>
  );
}
