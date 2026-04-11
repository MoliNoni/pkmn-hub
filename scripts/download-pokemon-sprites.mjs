import { mkdir } from "node:fs/promises";
import path from "node:path";

import sharp from "sharp";

const START_ID = 1;
const END_ID = 1025;
const API_BASE_URL = "https://pokeapi.co/api/v2/pokemon";
const OUTPUT_DIR = path.join(process.cwd(), "sprites");

function sanitizeFileName(name) {
  return name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9-]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
}

async function fetchPokemon(id) {
  const response = await fetch(`${API_BASE_URL}/${id}`);

  if (!response.ok) {
    throw new Error(`PokeAPI returned status ${response.status}`);
  }

  const pokemon = await response.json();
  const name = sanitizeFileName(pokemon?.name ?? "");
  const spriteUrl = pokemon?.sprites?.front_default;

  if (!name) {
    throw new Error("Pokemon name missing");
  }

  if (typeof spriteUrl !== "string" || !spriteUrl) {
    throw new Error("Sprite not available");
  }

  return { name, spriteUrl };
}

async function fetchSpriteBuffer(spriteUrl) {
  const response = await fetch(spriteUrl);

  if (!response.ok) {
    throw new Error(`Sprite download failed with status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function saveAsWebp(buffer, destinationPath) {
  await sharp(buffer).webp({ quality: 90 }).toFile(destinationPath);
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });

  let downloaded = 0;
  let skipped = 0;

  for (let id = START_ID; id <= END_ID; id += 1) {
    try {
      const { name, spriteUrl } = await fetchPokemon(id);
      const spriteBuffer = await fetchSpriteBuffer(spriteUrl);
      const destinationPath = path.join(OUTPUT_DIR, `${name}.webp`);

      await saveAsWebp(spriteBuffer, destinationPath);

      downloaded += 1;
      console.log(`[${id}/${END_ID}] saved ${name}.webp`);
    } catch (error) {
      skipped += 1;
      const message = error instanceof Error ? error.message : "Unknown error";
      console.warn(`[${id}/${END_ID}] skipped: ${message}`);
    }
  }

  console.log(
    `Finished. Saved ${downloaded} sprite(s) to ${OUTPUT_DIR}. Skipped ${skipped}.`,
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
