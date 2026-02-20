export type MunicipalityCatalogItem = {
  id: string;
  name: string;
  aliases: string[];
};

export const MUNICIPALITY_CATALOG: MunicipalityCatalogItem[] = [
  {
    id: "bogota-dc",
    name: "Bogota D.C.",
    aliases: ["bogota", "bogota d.c", "bogota dc", "santa fe de bogota"],
  },
  {
    id: "buenaventura-valle",
    name: "Buenaventura",
    aliases: ["buenaventura", "distrito de buenaventura"],
  },
  {
    id: "tumaco-narino",
    name: "Tumaco",
    aliases: ["tumaco", "san andres de tumaco"],
  },
  {
    id: "quibdo-choco",
    name: "Quibdo",
    aliases: ["quibdo", "san francisco de quibdo"],
  },
  {
    id: "cali-valle",
    name: "Cali",
    aliases: ["cali", "santiago de cali"],
  },
];

const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const findMunicipalityByText = (
  candidates: Array<string | null | undefined>
): MunicipalityCatalogItem | null => {
  const normalized = candidates
    .filter((value): value is string => Boolean(value && value.trim()))
    .map(normalizeText);

  for (const municipality of MUNICIPALITY_CATALOG) {
    const aliases = municipality.aliases.map(normalizeText);
    const found = normalized.some((candidate) => aliases.includes(candidate));
    if (found) return municipality;
  }

  return null;
};
