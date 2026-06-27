import { create } from 'zustand';

interface AutoSyncTriggerStore {
    dataVersion: number;
    markChanged: () => void;
}

export const useAutoSyncTriggerStore = create<AutoSyncTriggerStore>((set) => ({
    dataVersion: 0,
    markChanged: () =>
        set((state) => ({
            dataVersion: state.dataVersion + 1,
        })),
}));
