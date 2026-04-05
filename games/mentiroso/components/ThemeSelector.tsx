/**
 * Responsibilities:
 * - Render the hierarchical theme selector and its parameter inputs.
 * - Keep the menu interaction details isolated from the rest of the board.
 * - Translate a tree of `ThemeNode` objects into clickable nested menus.
 *
 * Move to another module if needed:
 * - If other games use a similar hierarchical chooser, promote this component
 *   to a shared selector package with game-specific render adapters.
 * - If accessibility, keyboard navigation, or search become priorities,
 *   consider splitting menu rendering, focus management, and parameter forms
 *   into smaller UI primitives.
 */

import { getNodeChildrenAtPath } from "@/games/mentiroso/themeMenuUtils";
import type {
  ThemeInputDefinition,
  ThemeNode,
  ThemeParams,
} from "@/types/types";

type ThemeSelectorProps = {
  onMenuClick: (node: ThemeNode, level: number) => void;
  onParamChange: (key: string, value: string) => void;
  openPath: string[];
  selectedThemeId: string | null;
  selectedThemeNode: ThemeNode | null;
  selectedThemePath: string[] | null;
  themeNodes: ThemeNode[];
  themeParams: ThemeParams;
};

type ThemeMenuLevelProps = {
  allNodes: ThemeNode[];
  level: number;
  nodes: ThemeNode[];
  onNodeClick: (node: ThemeNode, level: number) => void;
  openPath: string[];
  selectedThemeId: string | null;
};

function ThemeMenuLevel({
  allNodes,
  level,
  nodes,
  onNodeClick,
  openPath,
  selectedThemeId,
}: ThemeMenuLevelProps) {
  if (!nodes.length) {
    return null;
  }

  const wrapperClassName =
    level === 0
      ? "mt-5 flex flex-wrap items-start justify-center gap-3"
      : "flex min-w-[18rem] flex-col gap-3 rounded-[1.2rem] border border-white/10 bg-[#180814]/95 p-3 shadow-[0_16px_40px_rgba(0,0,0,0.45)]";

  return (
    <div className={wrapperClassName}>
      {nodes.map((node) => {
        const isOpen = openPath[level] === node.id;
        const isSelected = node.themeTemplateId === selectedThemeId;
        const childNodes =
          isOpen && node.children.length
            ? getNodeChildrenAtPath(allNodes, [...openPath.slice(0, level), node.id])
            : [];
        const childWrapperClassName =
          level === 0
            ? "absolute bottom-full left-0 mb-3"
            : "absolute left-full top-0 ml-3";

        return (
          <div key={node.id} className="relative">
            <button
              type="button"
              onClick={() => onNodeClick(node, level)}
              className={`flex min-h-[4.25rem] min-w-[15rem] items-center justify-between gap-3 rounded-[1.2rem] border px-4 py-3 text-left text-sm transition ${
                isOpen || isSelected
                  ? "border-amber-300 bg-amber-400/20 text-amber-100"
                  : "border-white/10 bg-white/8 text-white hover:border-white/25 hover:bg-white/12"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-base text-white/65">▸</span>
                <span>{node.label}</span>
              </div>
              {node.children.length ? (
                <span className="text-xs text-white/55">▸</span>
              ) : null}
            </button>

            {childNodes.length ? (
              <div className={childWrapperClassName}>
                <ThemeMenuLevel
                  allNodes={allNodes}
                  level={level + 1}
                  nodes={childNodes}
                  onNodeClick={onNodeClick}
                  openPath={openPath}
                  selectedThemeId={selectedThemeId}
                />
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}

function ThemeParamField(props: {
  definition: ThemeInputDefinition;
  onChange: (key: string, value: string) => void;
  value: string;
}) {
  const { definition, onChange, value } = props;

  if (definition.type === "select") {
    return (
      <label className="flex flex-col gap-2 text-sm text-white/85">
        <span>{definition.label}</span>
        <select
          value={value}
          onChange={(event) => onChange(definition.key, event.target.value)}
          className="rounded-2xl border border-white/15 bg-white/92 px-4 py-3 text-sm text-slate-900 outline-none"
        >
          <option value="">{definition.placeholder ?? "Selecciona una opcion"}</option>
          {(definition.options ?? []).map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    );
  }

  return (
    <label className="flex flex-col gap-2 text-sm text-white/85">
      <span>{definition.label}</span>
      <input
        type={definition.type}
        min={definition.min}
        max={definition.max}
        maxLength={definition.type === "text" ? definition.max : undefined}
        value={value}
        onChange={(event) => onChange(definition.key, event.target.value)}
        placeholder={definition.placeholder}
        className="rounded-2xl border border-white/15 bg-white/92 px-4 py-3 text-sm text-slate-900 outline-none"
      />
    </label>
  );
}

export function ThemeSelector({
  onMenuClick,
  onParamChange,
  openPath,
  selectedThemeId,
  selectedThemeNode,
  selectedThemePath,
  themeNodes,
  themeParams,
}: ThemeSelectorProps) {
  return (
    <>
      <div className="relative">
        <ThemeMenuLevel
          allNodes={themeNodes}
          level={0}
          nodes={themeNodes}
          onNodeClick={onMenuClick}
          openPath={openPath}
          selectedThemeId={selectedThemeId}
        />
      </div>

      <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-white/6 px-4 py-4 text-left text-sm text-white/85">
        <p className="text-xs uppercase tracking-[0.35em] text-white/45">
          Tema seleccionado
        </p>
        <p className="mt-2 font-semibold text-white">
          {selectedThemePath?.join(" > ") ?? "Ninguno"}
        </p>

        {selectedThemeNode?.inputDefinitions?.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {selectedThemeNode.inputDefinitions.map((definition) => (
              <ThemeParamField
                key={`${selectedThemeNode.id}-${definition.key}`}
                definition={definition}
                onChange={onParamChange}
                value={String(themeParams[definition.key] ?? "")}
              />
            ))}
          </div>
        ) : null}
      </div>
    </>
  );
}
