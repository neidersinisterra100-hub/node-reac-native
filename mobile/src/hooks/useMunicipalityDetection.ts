import { useCallback, useEffect, useState } from "react";
import { findMunicipalityByText } from "../data/municipalityCatalog";
import { useMobilityStore } from "../store/mobilityStore";

type ReverseGeocodeResult = {
  city?: string | null;
  district?: string | null;
  subregion?: string | null;
  region?: string | null;
};

type DetectionStatus = "idle" | "loading" | "resolved" | "manual_required";

export const useMunicipalityDetection = () => {
  const [status, setStatus] = useState<DetectionStatus>("idle");
  const setMunicipality = useMobilityStore((state) => state.setMunicipality);
  const setLocationPermissionGranted = useMobilityStore(
    (state) => state.setLocationPermissionGranted
  );
  const requireManualSelection = useMobilityStore(
    (state) => state.requireManualSelection
  );

  const detectMunicipality = useCallback(async () => {
    setStatus("loading");

    let locationModule: any;
    try {
      locationModule = require("expo-location");
    } catch (error) {
      console.warn("expo-location no esta instalado", error);
      setLocationPermissionGranted(false);
      requireManualSelection(true);
      setStatus("manual_required");
      return;
    }

    try {
      const permission = await locationModule.requestForegroundPermissionsAsync();
      const granted = permission.status === "granted";
      setLocationPermissionGranted(granted);

      if (!granted) {
        requireManualSelection(true);
        setStatus("manual_required");
        return;
      }

      const position = await locationModule.getCurrentPositionAsync({
        accuracy: locationModule.Accuracy.Balanced,
      });

      const geocode: ReverseGeocodeResult[] =
        await locationModule.reverseGeocodeAsync({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

      const current = geocode[0];
      const match = findMunicipalityByText([
        current?.city,
        current?.district,
        current?.subregion,
        current?.region,
      ]);

      if (!match) {
        requireManualSelection(true);
        setStatus("manual_required");
        return;
      }

      setMunicipality({ id: match.id, name: match.name });
      requireManualSelection(false);
      setStatus("resolved");
    } catch (error) {
      console.warn("No se pudo detectar el municipio por geolocalizacion", error);
      requireManualSelection(true);
      setStatus("manual_required");
    }
  }, [
    requireManualSelection,
    setLocationPermissionGranted,
    setMunicipality,
  ]);

  useEffect(() => {
    detectMunicipality();
  }, [detectMunicipality]);

  return {
    status,
    retryDetection: detectMunicipality,
  };
};
