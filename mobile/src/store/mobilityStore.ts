import { create } from "zustand";

export type TransportServiceId = "terrestrial" | "fluvial" | "aereo";

type MobilityState = {
  municipalityId: string | null;
  municipalityName: string | null;
  selectedService: TransportServiceId | null;
  locationPermissionGranted: boolean | null;
  isManualSelectionRequired: boolean;
  setMunicipality: (payload: { id: string; name: string }) => void;
  setSelectedService: (service: TransportServiceId | null) => void;
  setLocationPermissionGranted: (granted: boolean) => void;
  requireManualSelection: (required: boolean) => void;
};

export const useMobilityStore = create<MobilityState>((set) => ({
  municipalityId: null,
  municipalityName: null,
  selectedService: null,
  locationPermissionGranted: null,
  isManualSelectionRequired: false,
  setMunicipality: ({ id, name }) =>
    set({
      municipalityId: id,
      municipalityName: name,
      selectedService: null,
      isManualSelectionRequired: false,
    }),
  setSelectedService: (service) => set({ selectedService: service }),
  setLocationPermissionGranted: (granted) =>
    set({ locationPermissionGranted: granted }),
  requireManualSelection: (required) =>
    set({ isManualSelectionRequired: required }),
}));
