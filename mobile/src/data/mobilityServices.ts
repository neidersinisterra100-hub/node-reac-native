import { TransportServiceId } from "../store/mobilityStore";

export type MobilityServiceConfig = {
  id: TransportServiceId;
  title: string;
  description: string;
  emoji: string;
  enabled: boolean;
  routeName?: "TerrestrialFlowStack" | "FluvialFlowStack";
};

export const mobilityServices: MobilityServiceConfig[] = [
  {
    id: "terrestrial",
    title: "Transporte Terrestre",
    description: "Viajes dentro del municipio",
    emoji: "🛺",
    enabled: true,
    routeName: "TerrestrialFlowStack",
  },
  {
    id: "fluvial",
    title: "Transporte Fluvial",
    description: "Consulta salidas y compra tiquetes",
    emoji: "🚤",
    enabled: true,
    routeName: "FluvialFlowStack",
  },
  {
    id: "aereo",
    title: "Transporte Aereo",
    description: "Pronto podras reservar rutas aereas",
    emoji: "✈️",
    enabled: false,
  },
];
