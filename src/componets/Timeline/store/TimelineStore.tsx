import { create } from "zustand";

export const zoomPxMultiple = 100;
export const minTimelineSeconds = 300;

export const zoomConfig = {
  1: {
    majorTickSeconds: 300,
    pxPerSecond: function() {
      return Number((this.majorTickSeconds / zoomPxMultiple).toFixed(2));
    },

  },
  2: {
    majorTickSeconds: 60,
    pxPerSecond: function() {
      return Number((this.majorTickSeconds / zoomPxMultiple *2).toFixed(2));
    },
  },
  3: {
    majorTickSeconds: 30,
    pxPerSecond: function() {
      return Number((this.majorTickSeconds / zoomPxMultiple *3).toFixed(2));
    },
  },
  4: {
    majorTickSeconds: 10,
    pxPerSecond: function() {
      return Number((this.majorTickSeconds / zoomPxMultiple *4).toFixed(2));
    },
  },
  5: {
    majorTickSeconds: 1,
    pxPerSecond: function() {
      return Number((this.majorTickSeconds / zoomPxMultiple *5).toFixed(2));
    },
  },
};
export type ZoomLevel = keyof typeof zoomConfig;

export type MediaItem = {
  id: string;
  start: number;
  end: number;
};

interface TimelineStore {
  play: boolean;
  zoom: ZoomLevel;
  playHeadPosition: number;
  setZoom: (zoom: ZoomLevel) => void;
  setPlay: (play: boolean) => void;
  setPlayHeadPosition: (playHeadPosition: number) => void;
}
export const useTimelineStore = create<TimelineStore>((set) => ({
  play: false,
  zoom: 3,
  playHeadPosition: 0,
  setZoom: (zoom: ZoomLevel) => set({ zoom }),
  setPlay: (play: boolean) => set({ play }),
  setPlayHeadPosition: (playHeadPosition: number) => set({ playHeadPosition }),
}));
