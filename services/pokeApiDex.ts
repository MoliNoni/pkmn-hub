import { getCachedJson } from "@/services/pokeApiCache";
import type { ThemeEntityKind } from "@/types/types";

type NamedApiResource = {
  name: string;
  url: string;
};

type ApiResource = {
  url: string;
};

type ResourceListResponse<T> = {
  results: T[];
};

type PokeApiPokemonResponse = {
  id: number;
  name: string;
  species: NamedApiResource;
  sprites?: {
    front_default?: string | null;
  };
  types: Array<{
    slot: number;
    type: NamedApiResource;
  }>;
  abilities: Array<{
    is_hidden: boolean;
    ability: NamedApiResource;
  }>;
};

type PokeApiPokemonSpeciesResponse = {
  id: number;
  name: string;
  generation: NamedApiResource;
  evolution_chain: {
    url: string;
  };
  varieties: Array<{
    is_default: boolean;
    pokemon: NamedApiResource;
  }>;
};

type PokeApiEvolutionDetail = {
  item: NamedApiResource | null;
  min_happiness: number | null;
  needs_overworld_rain: boolean;
  trigger: NamedApiResource;
};

type PokeApiEvolutionChainNode = {
  species: NamedApiResource;
  evolution_details: PokeApiEvolutionDetail[];
  evolves_to: PokeApiEvolutionChainNode[];
};

type PokeApiEvolutionChainResponse = {
  id: number;
  chain: PokeApiEvolutionChainNode;
};

type PokeApiItemResponse = {
  id: number;
  name: string;
  category: NamedApiResource;
  attributes: NamedApiResource[];
  effect_entries: Array<{
    short_effect: string;
    language: NamedApiResource;
  }>;
  held_by_pokemon: Array<{
    pokemon: NamedApiResource;
  }>;
};

type PokeApiMoveResponse = {
  id: number;
  name: string;
  type: NamedApiResource;
  power: number | null;
  accuracy: number | null;
  learned_by_pokemon: NamedApiResource[];
};

type PokeApiMachineResponse = {
  id: number;
  item: NamedApiResource;
  move: NamedApiResource;
};

export type PokemonDexEntry = {
  kind: "pokemon";
  id: number;
  name: string;
  displayName: string;
  spriteUrl?: string;
  types: string[];
  abilities: string[];
  hiddenAbilities: string[];
  generation: string;
  evolution: {
    chainId: number;
    speciesName: string;
    speciesInChain: string[];
    evolvesToCount: number;
    changesType: boolean;
    spansDifferentGenerations: boolean;
    hasAbilityVariation: boolean;
    hasMegaEvolution: boolean;
    hasBranchingEvolution: boolean;
    methods: {
      stone: boolean;
      trade: boolean;
      happiness: boolean;
      weather: boolean;
    };
  };
};

export type ItemDexEntry = {
  kind: "item";
  id: number;
  name: string;
  displayName: string;
  category: string;
  attributes: string[];
  effectText: string;
  heldByPokemonCount: number;
  isHpHealingItem: boolean;
  isPokeball: boolean;
  isEvolutionItem: boolean;
  machineMoveType: string | null;
};

export type MoveDexEntry = {
  kind: "move";
  id: number;
  name: string;
  displayName: string;
  type: string;
  power: number | null;
  accuracy: number | null;
  learnedByPokemon: string[];
};

type DexEntryByKind = {
  item: ItemDexEntry;
  move: MoveDexEntry;
  pokemon: PokemonDexEntry;
};

type EvolutionNodeSnapshot = {
  speciesName: string;
  detailsFromParent: PokeApiEvolutionDetail[];
  children: string[];
};

const dexCache = new Map<string, DexEntryByKind[ThemeEntityKind] | null>();
const namedListCache = new Map<string, string[]>();
const machineTypeCache = new Map<string, string | null>();
const REGIONAL_FORM_GENERATIONS: Record<string, string> = {
  alola: "generation-vii",
  galar: "generation-viii",
  hisui: "generation-viii",
  paldea: "generation-ix",
};

function normalizeName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function getRegionalFormGeneration(name: string): string | null {
  const regionalSuffix = Object.keys(REGIONAL_FORM_GENERATIONS).find((suffix) =>
    name.endsWith(`-${suffix}`),
  );

  return regionalSuffix ? REGIONAL_FORM_GENERATIONS[regionalSuffix] : null;
}

function formatDisplayName(value: string): string {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function extractIdFromUrl(url: string): string {
  return url.split("/").filter(Boolean).at(-1) ?? "";
}

async function getNamedResource<T>(
  namespace: string,
  endpoint: string,
  nameOrId: string,
): Promise<T | null> {
  const normalized = normalizeName(nameOrId);

  if (!normalized) {
    return null;
  }

  return getCachedJson<T>(
    namespace,
    normalized,
    `https://pokeapi.co/api/v2/${endpoint}/${normalized}`,
  );
}

async function getResourceByUrl<T>(
  namespace: string,
  url: string,
): Promise<T | null> {
  return getCachedJson<T>(namespace, extractIdFromUrl(url), url);
}

async function getNamedList(endpoint: string, limit = 2000): Promise<string[]> {
  const cacheKey = `${endpoint}:${limit}`;

  if (namedListCache.has(cacheKey)) {
    return namedListCache.get(cacheKey) ?? [];
  }

  const response = await getCachedJson<ResourceListResponse<NamedApiResource>>(
    "lists",
    cacheKey,
    `https://pokeapi.co/api/v2/${endpoint}?limit=${limit}`,
  );
  const results = response?.results.map((entry) => entry.name) ?? [];

  namedListCache.set(cacheKey, results);
  return results;
}

async function getUnnamedList(endpoint: string, limit = 2000): Promise<string[]> {
  const cacheKey = `${endpoint}:${limit}`;

  if (namedListCache.has(cacheKey)) {
    return namedListCache.get(cacheKey) ?? [];
  }

  const response = await getCachedJson<ResourceListResponse<ApiResource>>(
    "lists",
    cacheKey,
    `https://pokeapi.co/api/v2/${endpoint}?limit=${limit}`,
  );
  const results = response?.results.map((entry) => entry.url) ?? [];

  namedListCache.set(cacheKey, results);
  return results;
}

async function getPokemonSpeciesByName(
  name: string,
): Promise<PokeApiPokemonSpeciesResponse | null> {
  return getNamedResource<PokeApiPokemonSpeciesResponse>(
    "pokemon-species",
    "pokemon-species",
    name,
  );
}

async function getPokemonApiByName(
  name: string,
): Promise<PokeApiPokemonResponse | null> {
  return getNamedResource<PokeApiPokemonResponse>("pokemon", "pokemon", name);
}

async function getMoveApiByName(name: string): Promise<PokeApiMoveResponse | null> {
  return getNamedResource<PokeApiMoveResponse>("move", "move", name);
}

async function getItemApiByName(name: string): Promise<PokeApiItemResponse | null> {
  return getNamedResource<PokeApiItemResponse>("item", "item", name);
}

function flattenEvolutionChain(
  node: PokeApiEvolutionChainNode,
  snapshots: EvolutionNodeSnapshot[] = [],
): EvolutionNodeSnapshot[] {
  snapshots.push({
    speciesName: node.species.name,
    detailsFromParent: node.evolution_details,
    children: node.evolves_to.map((child) => child.species.name),
  });

  node.evolves_to.forEach((child) => flattenEvolutionChain(child, snapshots));
  return snapshots;
}

function collectDescendants(
  speciesName: string,
  nodeMap: Map<string, EvolutionNodeSnapshot>,
): string[] {
  const node = nodeMap.get(speciesName);

  if (!node) {
    return [];
  }

  return node.children.flatMap((child) => [child, ...collectDescendants(child, nodeMap)]);
}

function getEvolutionMethodFlags(
  nodes: EvolutionNodeSnapshot[],
): PokemonDexEntry["evolution"]["methods"] {
  return nodes.reduce(
    (flags, node) => {
      node.detailsFromParent.forEach((detail) => {
        if (detail.item?.name?.includes("stone")) {
          flags.stone = true;
        }

        if (detail.trigger.name === "trade") {
          flags.trade = true;
        }

        if (detail.min_happiness !== null) {
          flags.happiness = true;
        }

        if (detail.needs_overworld_rain) {
          flags.weather = true;
        }
      });

      return flags;
    },
    {
      stone: false,
      trade: false,
      happiness: false,
      weather: false,
    } as PokemonDexEntry["evolution"]["methods"],
  );
}

async function buildPokemonDexEntry(name: string): Promise<PokemonDexEntry | null> {
  const pokemon = await getPokemonApiByName(name);

  if (!pokemon) {
    return null;
  }

  const species =
    (await getPokemonSpeciesByName(pokemon.species.name)) ??
    (await getPokemonSpeciesByName(pokemon.name));

  if (!species) {
    return null;
  }

  const evolutionChain = await getResourceByUrl<PokeApiEvolutionChainResponse>(
    "evolution-chain",
    species.evolution_chain.url,
  );

  if (!evolutionChain) {
    return null;
  }

  const nodes = flattenEvolutionChain(evolutionChain.chain);
  const nodeMap = new Map(nodes.map((node) => [node.speciesName, node]));
  const chainSpecies = nodes.map((node) => node.speciesName);
  const descendants = collectDescendants(species.name, nodeMap);
  const branching = nodes.some((node) => node.children.length > 1);
  const methods = getEvolutionMethodFlags(nodes);
  const chainSpeciesDetails = await Promise.all(
    chainSpecies.map(async (speciesName) => {
      const chainSpeciesData = await getPokemonSpeciesByName(speciesName);
      const defaultPokemonName =
        chainSpeciesData?.varieties.find((variant) => variant.is_default)?.pokemon
          .name ?? speciesName;
      const chainPokemon = await getPokemonApiByName(defaultPokemonName);

      return {
        defaultPokemonName,
        generation: chainSpeciesData?.generation.name ?? "",
        speciesData: chainSpeciesData,
        types: chainPokemon?.types
          .sort((left, right) => left.slot - right.slot)
          .map((entry) => entry.type.name) ?? [],
        abilities:
          chainPokemon?.abilities.map((ability) => ability.ability.name).sort() ?? [],
      };
    }),
  );
  const typeSignatures = new Set(
    chainSpeciesDetails.map((entry) => entry.types.join("|")).filter(Boolean),
  );
  const abilitySignatures = new Set(
    chainSpeciesDetails.map((entry) => entry.abilities.join("|")).filter(Boolean),
  );
  const generations = new Set(
    chainSpeciesDetails.map((entry) => entry.generation).filter(Boolean),
  );
  chainSpeciesDetails.forEach((entry) => {
    entry.speciesData?.varieties.forEach((variant) => {
      const regionalGeneration = getRegionalFormGeneration(variant.pokemon.name);

      if (regionalGeneration) {
        generations.add(regionalGeneration);
      }
    });
  });
  const hasMegaEvolution = chainSpeciesDetails.some((entry) =>
    entry.speciesData?.varieties.some((variant) => variant.pokemon.name.includes("-mega")),
  );

  return {
    kind: "pokemon",
    id: pokemon.id,
    name: pokemon.name,
    displayName: formatDisplayName(pokemon.name),
    spriteUrl: pokemon.sprites?.front_default ?? undefined,
    types: pokemon.types
      .sort((left, right) => left.slot - right.slot)
      .map((entry) => entry.type.name),
    abilities: pokemon.abilities
      .filter((ability) => !ability.is_hidden)
      .map((ability) => ability.ability.name),
    hiddenAbilities: pokemon.abilities
      .filter((ability) => ability.is_hidden)
      .map((ability) => ability.ability.name),
    generation: species.generation.name,
    evolution: {
      chainId: evolutionChain.id,
      speciesName: species.name,
      speciesInChain: chainSpecies,
      evolvesToCount: descendants.length,
      changesType: typeSignatures.size > 1,
      spansDifferentGenerations: generations.size > 1,
      hasAbilityVariation: abilitySignatures.size > 1,
      hasMegaEvolution,
      hasBranchingEvolution: branching,
      methods,
    },
  };
}

async function getMachineMoveType(itemName: string): Promise<string | null> {
  const normalized = normalizeName(itemName);

  if (machineTypeCache.has(normalized)) {
    return machineTypeCache.get(normalized) ?? null;
  }

  const machineUrls = await getUnnamedList("machine", 2500);

  for (const machineUrl of machineUrls) {
    const machine = await getResourceByUrl<PokeApiMachineResponse>("machine", machineUrl);

    if (!machine || machine.item.name !== normalized) {
      continue;
    }

    const move = await getMoveApiByName(machine.move.name);
    const moveType = move?.type.name ?? null;

    machineTypeCache.set(normalized, moveType);
    return moveType;
  }

  machineTypeCache.set(normalized, null);
  return null;
}

async function buildItemDexEntry(name: string): Promise<ItemDexEntry | null> {
  const item = await getItemApiByName(name);

  if (!item) {
    return null;
  }

  const effectText =
    item.effect_entries.find((entry) => entry.language.name === "en")?.short_effect ??
    "";
  const lowerEffect = effectText.toLowerCase();

  return {
    kind: "item",
    id: item.id,
    name: item.name,
    displayName: formatDisplayName(item.name),
    category: item.category.name,
    attributes: item.attributes.map((attribute) => attribute.name),
    effectText,
    heldByPokemonCount: item.held_by_pokemon.length,
    isHpHealingItem:
      lowerEffect.includes("restore") ||
      lowerEffect.includes("heals") ||
      lowerEffect.includes("regains hp"),
    isPokeball: item.category.name === "poke-balls",
    isEvolutionItem:
      item.category.name.includes("evolution") ||
      lowerEffect.includes("evolves") ||
      lowerEffect.includes("evolution"),
    machineMoveType: await getMachineMoveType(item.name),
  };
}

async function buildMoveDexEntry(name: string): Promise<MoveDexEntry | null> {
  const move = await getMoveApiByName(name);

  if (!move) {
    return null;
  }

  return {
    kind: "move",
    id: move.id,
    name: move.name,
    displayName: formatDisplayName(move.name),
    type: move.type.name,
    power: move.power,
    accuracy: move.accuracy,
    learnedByPokemon: move.learned_by_pokemon.map((pokemon) => pokemon.name),
  };
}

export async function getDexEntryByName<K extends ThemeEntityKind>(
  kind: K,
  name: string,
): Promise<DexEntryByKind[K] | null> {
  const normalized = normalizeName(name);
  const cacheKey = `${kind}:${normalized}`;

  if (!normalized) {
    return null;
  }

  if (dexCache.has(cacheKey)) {
    return dexCache.get(cacheKey) as DexEntryByKind[K] | null;
  }

  const entry =
    kind === "pokemon"
      ? await buildPokemonDexEntry(normalized)
      : kind === "item"
        ? await buildItemDexEntry(normalized)
        : await buildMoveDexEntry(normalized);

  dexCache.set(cacheKey, entry);
  return entry as DexEntryByKind[K] | null;
}

export async function getAbilityNames(): Promise<string[]> {
  return getNamedList("ability", 400);
}

export async function getPokemonNames(): Promise<string[]> {
  return getNamedList("pokemon", 1500);
}

export function sanitizeDexEntryNames(names: string[]): string[] {
  return [...new Set(names.map(normalizeName).filter(Boolean))];
}

export function normalizeDexEntryName(name: string): string {
  return normalizeName(name);
}
