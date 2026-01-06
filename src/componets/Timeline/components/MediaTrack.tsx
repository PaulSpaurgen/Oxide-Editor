import { useRef, useState, useEffect } from "react";
import { useTimelineStore } from "../store/TimelineStore";
import { zoomConfig } from "../store/TimelineStore";
export default function MediaTrack({
  timelineRef,
}: {
  timelineRef: React.RefObject<HTMLDivElement>;
}) {
  const { mediaItems, zoom } = useTimelineStore();
  const dragItemRef = useRef<HTMLDivElement>(null);
  const currentSelectedItemRef = useRef<HTMLDivElement>(null);
  const mouseMOvementoffsetRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);


  const onmousedown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragItemRef.current = e.target as HTMLDivElement;
    dragItemRef.current.style.zIndex = "1000";
    mouseMOvementoffsetRef.current =
      e.clientX -
      (dragItemRef.current as HTMLDivElement).getBoundingClientRect().left;
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragItemRef.current) {
      dragItemRef.current.style.left = `${
        e.clientX - mouseMOvementoffsetRef.current
      }px`;
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    setIsDragging(false);
    if (dragItemRef.current) {
      dragItemRef.current.style.zIndex = "1";
    }
    
 
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

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
  
  };

  return (
    <div
      className={`absolute top-[50px] left-0 w-[${timelineRef.current?.offsetWidth}px] h-[30px] bg-gray-800 `}
    >
      {mediaItems.map((item) => (
        <div
          key={item.id}
          className="absolute top-0 left-0 w-full h-[30px] bg-white border-2 border-red-500"
          style={{
            left: `${(item.start / 1000) * zoomConfig[zoom].pxPerSecond}px`,
            width: `${(item.duration / 1000) * zoomConfig[zoom].pxPerSecond}px`,
          }}
          data-id={item.id}
          onMouseDown={onmousedown}
          onClick={onClick}
        ></div>
      ))}
    </div>
  );
}
