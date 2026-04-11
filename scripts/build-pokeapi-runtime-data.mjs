import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const CACHE_ROOT = path.join(process.cwd(), ".cache", "pokeapi");
const OUTPUT_PATH = path.join(process.cwd(), "data", "pokeapi-runtime.json");
const API_BASE_URL = "https://pokeapi.co/api/v2";
const REGIONAL_FORM_GENERATIONS = {
  alola: "generation-vii",
  galar: "generation-viii",
  hisui: "generation-viii",
  paldea: "generation-ix",
};

function normalizeName(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function formatDisplayName(value) {
  return value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function extractIdFromUrl(url) {
  return url.split("/").filter(Boolean).at(-1) ?? "";
}

function sanitizeCacheKey(key) {
  return key.replace(/[^a-z0-9-_.]/gi, "_").toLowerCase();
}

function getCacheFilePath(namespace, key) {
  return path.join(CACHE_ROOT, namespace, `${sanitizeCacheKey(key)}.json`);
}

async function readDiskCache(namespace, key) {
  try {
    const fileContents = await readFile(getCacheFilePath(namespace, key), "utf8");
    return JSON.parse(fileContents);
  } catch {
    return null;
  }
}

async function writeDiskCache(namespace, key, value) {
  const filePath = getCacheFilePath(namespace, key);
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(value), "utf8");
}

async function getCachedJson(namespace, key, url) {
  const diskValue = await readDiskCache(namespace, key);

  if (diskValue !== null) {
    return diskValue;
  }

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  const data = await response.json();
  await writeDiskCache(namespace, key, data);
  return data;
}

async function getNamedResource(namespace, endpoint, nameOrId) {
  const normalized = normalizeName(nameOrId);

  if (!normalized) {
    return null;
  }

  return getCachedJson(
    namespace,
    normalized,
    `${API_BASE_URL}/${endpoint}/${normalized}`,
  );
}

async function getResourceByUrl(namespace, url) {
  return getCachedJson(namespace, extractIdFromUrl(url), url);
}

async function getNamedList(endpoint, limit) {
  const response = await getCachedJson(
    "lists",
    `${endpoint}:${limit}`,
    `${API_BASE_URL}/${endpoint}?limit=${limit}`,
  );

  return response?.results?.map((entry) => entry.name) ?? [];
}

async function getUnnamedList(endpoint, limit) {
  const response = await getCachedJson(
    "lists",
    `${endpoint}:${limit}`,
    `${API_BASE_URL}/${endpoint}?limit=${limit}`,
  );

  return response?.results?.map((entry) => entry.url) ?? [];
}

function flattenEvolutionChain(node, snapshots = []) {
  snapshots.push({
    speciesName: node.species.name,
    detailsFromParent: node.evolution_details,
    children: node.evolves_to.map((child) => child.species.name),
  });

  node.evolves_to.forEach((child) => flattenEvolutionChain(child, snapshots));
  return snapshots;
}

function getEvolutionMethodFlags(nodes) {
  return nodes.reduce(
    (flags, node) => {
      node.detailsFromParent.forEach((detail) => {
        if (detail.item?.name?.includes("stone")) {
          flags.stone = true;
        }

        if (detail.trigger?.name === "trade") {
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
    },
  );
}

function getRegionalFormGeneration(name) {
  const regionalSuffix = Object.keys(REGIONAL_FORM_GENERATIONS).find((suffix) =>
    name.endsWith(`-${suffix}`),
  );

  return regionalSuffix ? REGIONAL_FORM_GENERATIONS[regionalSuffix] : null;
}

async function mapWithConcurrency(items, concurrency, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(items[currentIndex], currentIndex);
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(concurrency, items.length) }, () => worker()),
  );

  return results;
}

async function buildMachineMoveTypeIndex() {
  const machineUrls = await getUnnamedList("machine", 2500);
  const machines = await mapWithConcurrency(machineUrls, 12, async (machineUrl) =>
    getResourceByUrl("machine", machineUrl),
  );
  const moveNames = [...new Set(machines.flatMap((machine) => (machine?.move?.name ? [machine.move.name] : [])))];
  const moveTypeByName = new Map();

  await mapWithConcurrency(moveNames, 12, async (moveName) => {
    const move = await getNamedResource("move", "move", moveName);
    moveTypeByName.set(moveName, move?.type?.name ?? null);
  });

  return machines.reduce((index, machine) => {
    if (machine?.item?.name && machine?.move?.name) {
      index[machine.item.name] = moveTypeByName.get(machine.move.name) ?? null;
    }

    return index;
  }, {});
}

async function buildPokemonDataset() {
  const pokemonNames = await getNamedList("pokemon", 1500);
  const entries = {};
  const typeIndex = {};
  const speciesCache = new Map();
  const chainCache = new Map();

  await mapWithConcurrency(pokemonNames, 10, async (pokemonName, index) => {
    const pokemon = await getNamedResource("pokemon", "pokemon", pokemonName);

    if (!pokemon) {
      return;
    }

    let species = speciesCache.get(pokemon.species.name);

    if (!species) {
      species = await getNamedResource(
        "pokemon-species",
        "pokemon-species",
        pokemon.species.name,
      );
      speciesCache.set(pokemon.species.name, species);
    }

    if (!species) {
      return;
    }

    const chainId = extractIdFromUrl(species.evolution_chain.url);
    let evolutionChain = chainCache.get(chainId);

    if (!evolutionChain) {
      evolutionChain = await getResourceByUrl(
        "evolution-chain",
        species.evolution_chain.url,
      );
      chainCache.set(chainId, evolutionChain);
    }

    if (!evolutionChain) {
      return;
    }

    const nodes = flattenEvolutionChain(evolutionChain.chain);
    const chainSpecies = nodes.map((node) => node.speciesName);
    const branching = nodes.some((node) => node.children.length > 1);
    const methods = getEvolutionMethodFlags(nodes);
    const chainSpeciesDetails = await mapWithConcurrency(
      chainSpecies,
      8,
      async (speciesName) => {
        let chainSpeciesData = speciesCache.get(speciesName);

        if (!chainSpeciesData) {
          chainSpeciesData = await getNamedResource(
            "pokemon-species",
            "pokemon-species",
            speciesName,
          );
          speciesCache.set(speciesName, chainSpeciesData);
        }

        const defaultPokemonName =
          chainSpeciesData?.varieties?.find((variant) => variant.is_default)?.pokemon
            ?.name ?? speciesName;
        const chainPokemon = await getNamedResource(
          "pokemon",
          "pokemon",
          defaultPokemonName,
        );

        return {
          defaultPokemonName,
          generation: chainSpeciesData?.generation?.name ?? "",
          speciesData: chainSpeciesData,
          types:
            chainPokemon?.types
              ?.slice()
              .sort((left, right) => left.slot - right.slot)
              .map((entry) => entry.type.name) ?? [],
          abilities:
            chainPokemon?.abilities
              ?.map((ability) => ability.ability.name)
              .sort() ?? [],
        };
      },
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
      entry.speciesData?.varieties?.forEach((variant) => {
        const regionalGeneration = getRegionalFormGeneration(variant.pokemon.name);

        if (regionalGeneration) {
          generations.add(regionalGeneration);
        }
      });
    });

    const hasMegaEvolution = chainSpeciesDetails.some((entry) =>
      entry.speciesData?.varieties?.some((variant) =>
        variant.pokemon.name.includes("-mega"),
      ),
    );
    const normalizedName = normalizeName(pokemon.name);
    const sortedTypes =
      pokemon.types
        ?.slice()
        .sort((left, right) => left.slot - right.slot)
        .map((entry) => entry.type.name) ?? [];

    entries[normalizedName] = {
      kind: "pokemon",
      id: pokemon.id,
      name: pokemon.name,
      displayName: formatDisplayName(pokemon.name),
      spriteUrl: pokemon.sprites?.front_default ?? undefined,
      types: sortedTypes,
      abilities:
        pokemon.abilities
          ?.filter((ability) => !ability.is_hidden)
          .map((ability) => ability.ability.name) ?? [],
      hiddenAbilities:
        pokemon.abilities
          ?.filter((ability) => ability.is_hidden)
          .map((ability) => ability.ability.name) ?? [],
      generation: species.generation.name,
      evolution: {
        chainId: evolutionChain.id,
        speciesName: species.name,
        speciesInChain: chainSpecies,
        changesType: typeSignatures.size > 1,
        spansDifferentGenerations: generations.size > 1,
        hasAbilityVariation: abilitySignatures.size > 1,
        hasMegaEvolution,
        hasBranchingEvolution: branching,
        methods,
      },
    };

    sortedTypes.forEach((type) => {
      if (!typeIndex[type]) {
        typeIndex[type] = [];
      }

      typeIndex[type].push(pokemon.name);
    });

    if ((index + 1) % 100 === 0) {
      console.log(`Pokemon processed: ${index + 1}/${pokemonNames.length}`);
    }
  });

  Object.values(typeIndex).forEach((names) => names.sort());

  return {
    entries,
    pokemonNames: pokemonNames.slice().sort(),
    typeIndex,
  };
}

async function buildItemDataset(machineMoveTypeIndex) {
  const itemNames = await getNamedList("item", 2500);
  const entries = {};

  await mapWithConcurrency(itemNames, 12, async (itemName, index) => {
    const item = await getNamedResource("item", "item", itemName);

    if (!item) {
      return;
    }

    const effectText =
      item.effect_entries?.find((entry) => entry.language.name === "en")
        ?.short_effect ?? "";
    const lowerEffect = effectText.toLowerCase();

    entries[normalizeName(item.name)] = {
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
      machineMoveType: machineMoveTypeIndex[item.name] ?? null,
    };

    if ((index + 1) % 200 === 0) {
      console.log(`Items processed: ${index + 1}/${itemNames.length}`);
    }
  });

  return entries;
}

async function buildMoveDataset() {
  const moveNames = await getNamedList("move", 2000);
  const entries = {};

  await mapWithConcurrency(moveNames, 12, async (moveName, index) => {
    const move = await getNamedResource("move", "move", moveName);

    if (!move) {
      return;
    }

    entries[normalizeName(move.name)] = {
      kind: "move",
      id: move.id,
      name: move.name,
      displayName: formatDisplayName(move.name),
      type: move.type.name,
      power: move.power,
      accuracy: move.accuracy,
      learnedByPokemon: move.learned_by_pokemon.map((pokemon) => pokemon.name),
    };

    if ((index + 1) % 200 === 0) {
      console.log(`Moves processed: ${index + 1}/${moveNames.length}`);
    }
  });

  return entries;
}

async function main() {
  console.log("Building local PokeAPI runtime dataset...");

  const machineMoveTypeIndex = await buildMachineMoveTypeIndex();
  const [abilityNames, pokemonDataset, itemEntries, moveEntries] =
    await Promise.all([
      getNamedList("ability", 400),
      buildPokemonDataset(),
      buildItemDataset(machineMoveTypeIndex),
      buildMoveDataset(),
    ]);

  const runtimeDataset = {
    generatedAt: new Date().toISOString(),
    source: "https://pokeapi.co/",
    abilityNames: abilityNames.slice().sort(),
    pokemonNames: pokemonDataset.pokemonNames,
    pokemonTypeIndex: pokemonDataset.typeIndex,
    entries: {
      pokemon: pokemonDataset.entries,
      item: itemEntries,
      move: moveEntries,
    },
  };

  await mkdir(path.dirname(OUTPUT_PATH), { recursive: true });
  await writeFile(OUTPUT_PATH, JSON.stringify(runtimeDataset), "utf8");

  console.log(`Dataset written to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error);
  process.exitCode = 1;
});
