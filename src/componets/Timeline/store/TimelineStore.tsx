import { create } from "zustand";
import { dummyMediaItems } from "./data";
export const zoomPxMultiple = 100;
export const minTimelineSeconds = 300;

export const zoomConfig = {
  1: {
    majorTickSeconds: 300,
    totalPX: zoomPxMultiple,
    pxPerSecond: zoomPxMultiple / 300,

  },
  2: {
    majorTickSeconds: 60,
    totalPX: zoomPxMultiple * 2,
    pxPerSecond: zoomPxMultiple * 2 / 60,
  },
  3: {
    majorTickSeconds: 30,
    totalPX: zoomPxMultiple * 3,
    pxPerSecond: zoomPxMultiple * 3 / 30,
  },
  4: {
    majorTickSeconds: 10,
    totalPX: zoomPxMultiple * 4,
    pxPerSecond: zoomPxMultiple * 4 / 10,
  },
  
  5: {
    majorTickSeconds: 5,
    totalPX: zoomPxMultiple * 5,
    pxPerSecond: zoomPxMultiple * 5 / 5,
  },
  6: {
    majorTickSeconds: 1,
    totalPX: zoomPxMultiple * 6,
    pxPerSecond: zoomPxMultiple * 6 / 1,
  },
};
export type ZoomLevel = keyof typeof zoomConfig;

export type MediaItem = {
  id: string; // unique id
  start: number; // in milliseconds
  end: number; // in milliseconds
  duration: number; // in milliseconds
  type: "video" | "audio";
};

interface TimelineStore {
  play: boolean;
  zoom: ZoomLevel;
  playHeadPosition: number;
  elapsedTime: number;
  mediaItems: MediaItem[];
  setMediaItems: (mediaItems: MediaItem[]) => void;
  setElapsedTime: (elapsedTime: number | ((prev: number) => number)) => void;
  setZoom: (zoom: ZoomLevel) => void;
  setPlay: (play: boolean) => void;
  setPlayHeadPosition: (playHeadPosition: number | ((prev: number) => number)) => void;
}
export const useTimelineStore = create<TimelineStore>((set) => ({
  play: false,
  zoom: 3,
  playHeadPosition: 0,  
  elapsedTime: 0,
  mediaItems: dummyMediaItems as MediaItem[],
  setMediaItems: (mediaItems: MediaItem[]) => set({ mediaItems }),
  setElapsedTime: (elapsedTime: number | ((prev: number) => number)) => 
    set((state) => ({
      elapsedTime: typeof elapsedTime === 'function' 
        ? elapsedTime(state.elapsedTime) 
        : elapsedTime
    })),
  setZoom: (zoom: ZoomLevel) => set({ zoom }),
  setPlay: (play: boolean) => set({ play }),
  setPlayHeadPosition: (playHeadPosition: number | ((prev: number) => number)) => 
    set((state) => ({
      playHeadPosition: typeof playHeadPosition === 'function' 
        ? playHeadPosition(state.playHeadPosition) 
        : playHeadPosition
    })),
}));
