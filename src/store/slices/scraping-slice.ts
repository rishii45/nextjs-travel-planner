import { StateCreator } from "zustand";

export interface ScrapingSlice {
  isScraping: boolean;
  setScraping: (isScraping: boolean) => void;
  scrapingType: "hotel" | "flight" | undefined;
  setScrapingType: (scrapingType: "hotel" | "flight" | undefined) => void;
  scrapedFlights: any
  setScrappedFlights: (scrappedFlights: any) => void;
  scrapedHotels: any;
  setScrappedHotels: (scrappedHotels: any) => void;
}

export const createScrapingSlice: StateCreator<ScrapingSlice> = (set) => ({
  isScraping: false,
  setScraping: (isScraping) => set({ isScraping }),
  scrapingType: undefined,
  setScrapingType: (scrapingType) => set({ scrapingType }),
  scrapedFlights: [],
  setScrappedFlights: (scrapedFlights) => set({ scrapedFlights }),
  scrapedHotels: [],
  setScrappedHotels: (scrapedHotels) => set({ scrapedHotels }),
});