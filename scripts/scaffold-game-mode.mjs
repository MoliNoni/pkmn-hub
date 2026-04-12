import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

function normalizeModeName(value) {
  return value.trim().toLowerCase().replace(/\s+/g, "-");
}

function toPascalCase(value) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

async function ensureFile(filePath, contents) {
  await mkdir(path.dirname(filePath), { recursive: true });
  await writeFile(filePath, contents, { flag: "wx" });
}

async function main() {
  const rawModeName = process.argv[2] ?? "";
  const modeName = normalizeModeName(rawModeName);

  if (!modeName) {
    throw new Error(
      "Usage: node scripts/scaffold-game-mode.mjs <mode-name>. Example: node scripts/scaffold-game-mode.mjs quien-es-quien",
    );
  }

  const pascalName = toPascalCase(modeName);
  const gameType = `${modeName}-local`;
  const modeDir = path.join(process.cwd(), "games", modeName);

  const files = [
    {
      path: path.join(modeDir, "types.ts"),
      contents: `export type ${pascalName}GameState = {\n  gameId: string;\n  game: "${gameType}";\n};\n\nexport type ${pascalName}TurnRequest = {\n  gameType: "${gameType}";\n  action: "init";\n};\n`,
    },
    {
      path: path.join(modeDir, "store.ts"),
      contents: `import { createInMemoryGameStore } from "@/games/shared/gameSessionStore";\nimport type { ${pascalName}GameState } from "@/games/${modeName}/types";\n\nconst store = createInMemoryGameStore<${pascalName}GameState>();\n\nexport const saveGame = store.save;\nexport const getGameOrThrow = (gameId: string) =>\n  store.getOrThrow(gameId, "No se encontro la partida.");\n`,
    },
    {
      path: path.join(modeDir, "service.ts"),
      contents: `import type { ${pascalName}GameState } from "@/games/${modeName}/types";\n\nexport async function create${pascalName}Game(): Promise<${pascalName}GameState> {\n  return {\n    gameId: crypto.randomUUID(),\n    game: "${gameType}",\n  };\n}\n`,
    },
    {
      path: path.join(modeDir, "definition.ts"),
      contents: `import type { GameDefinition } from "@/games/shared/gameDefinition";\nimport { create${pascalName}Game } from "@/games/${modeName}/service";\nimport type { ${pascalName}GameState, ${pascalName}TurnRequest } from "@/games/${modeName}/types";\n\nfunction isObject(value: unknown): value is Record<string, unknown> {\n  return Boolean(value) && typeof value === "object";\n}\n\nfunction is${pascalName}TurnRequest(value: unknown): value is ${pascalName}TurnRequest {\n  return (\n    isObject(value) &&\n    value.gameType === "${gameType}" &&\n    value.action === "init"\n  );\n}\n\nexport const ${modeName.replace(/-/g, "")}GameDefinition: GameDefinition<${pascalName}TurnRequest, ${pascalName}GameState> = {\n  gameType: "${gameType}",\n  isRequest: is${pascalName}TurnRequest,\n  handleAction: async () => create${pascalName}Game(),\n};\n`,
    },
    {
      path: path.join(modeDir, "components", `${pascalName}Board.tsx`),
      contents: `export default function ${pascalName}Board() {\n  return <section>${pascalName} placeholder</section>;\n}\n`,
    },
    {
      path: path.join(modeDir, "README.md"),
      contents: `# ${pascalName}\n\nScaffold generado para el modo \`${modeName}\`.\n\n## Archivos base\n- \`types.ts\`\n- \`service.ts\`\n- \`store.ts\`\n- \`definition.ts\`\n- \`components/${pascalName}Board.tsx\`\n`,
    },
  ];

  for (const file of files) {
    await ensureFile(file.path, file.contents);
  }

  console.log(`Scaffold created for ${modeName} in ${modeDir}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
