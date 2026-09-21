import { create } from 'zustand';
import { plates } from '../data';
import {
  loadSpottedPlates,
  mergeSpottedPlates,
  saveSpottedPlates,
} from '../services/plateCollectionStorage';

interface PlateCollectionStore {
  spottedCodes: string[];
  loaded: boolean;
  loadCollection: () => Promise<void>;
  recordSpotted: (codes: string[]) => void;
}

export const usePlateCollectionStore = create<PlateCollectionStore>((set, get) => ({
  spottedCodes: [],
  loaded: false,

  loadCollection: async () => {
    const spottedCodes = await loadSpottedPlates();
    set({ spottedCodes, loaded: true });
  },

  recordSpotted: (codes) => {
    if (codes.length === 0) {
      return;
    }
    const spottedCodes = mergeSpottedPlates(get().spottedCodes, codes);
    set({ spottedCodes });
    void saveSpottedPlates(spottedCodes);
  },
}));

export function plateCollectionTotal(): number {
  return plates.length;
}
