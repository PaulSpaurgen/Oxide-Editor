import { useRef, useState, useEffect } from "react";
import { useTimelineStore } from "../store/TimelineStore";
import { zoomConfig } from "../store/TimelineStore";
export default function MediaTrack({
  timelineRef,
}: {
  timelineRef: React.RefObject<HTMLDivElement>;
}) {
  const { mediaItems, zoom, setMediaItems } = useTimelineStore();
  const dragItemRef = useRef<HTMLDivElement>(null);
  const currentSelectedItemRef = useRef<HTMLDivElement>(null);
  const mouseMovementoffsetRef = useRef(0);
  const [isDragging, setIsDragging] = useState(false);

  const onmousedown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragItemRef.current = e.target as HTMLDivElement;
    dragItemRef.current.style.zIndex = "1000";
    mouseMovementoffsetRef.current =
      e.clientX -
      (dragItemRef.current as HTMLDivElement).getBoundingClientRect().left;
    setIsDragging(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (dragItemRef.current) {
      dragItemRef.current.style.left = `${
        e.clientX - mouseMovementoffsetRef.current
      }px`;
    }
  };

  const handleMouseUp = (e: MouseEvent) => {
    
    setIsDragging(false);
    if (dragItemRef.current) {
      dragItemRef.current.style.zIndex = "1";
    }
    const itemId = (e.target as HTMLDivElement).dataset.id;
    // ToDo: 
    // 1. new start is less than 0, set it to 0
    // 2. Search for nearest safe position in the array and set the new start to that position
    // 3. If there is a nearest end position, set the new start to that position
    const updatedMediaItems = mediaItems.map((item) => {
      if (item.id === itemId) {
        const newStart = (e.clientX - mouseMovementoffsetRef.current) / zoomConfig[zoom].pxPerSecond * 1000;
        console.log(Math.max(0, newStart));
        
        return {
          ...item,
          start: newStart < 0 ? 0 : newStart,
        };
      }
      return item;
    });
    setMediaItems(updatedMediaItems);
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

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {};

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
