import { create } from 'zustand';

interface AutoSyncTriggerState {
    dataVersion: number;
    markChanged: () => void;
}

export const useAutoSyncTriggerStore = create<AutoSyncTriggerState>((set) => ({
    dataVersion: 0,
    markChanged: () =>
        set((state) => ({
            dataVersion: state.dataVersion + 1,
        })),
}));
