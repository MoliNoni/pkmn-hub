/**
 * Responsibilities:
 * - Hold pure tree-navigation helpers for the theme selector.
 * - Keep `ThemeNode` traversal logic outside React components so it can be
 *   tested, reused, and shared by local/online modes.
 *
 * Move to another module if needed:
 * - If multiple games use hierarchical selectors, promote these helpers to a
 *   shared UI-tree utility package.
 * - If theme search/filtering or breadcrumbs become richer, consider a
 *   dedicated theme-selector domain module with memoized selectors.
 */

import type { ThemeNode } from "@/types/types";

export function findFirstSelectableThemeNode(
  nodes: ThemeNode[],
): ThemeNode | null {
  for (const node of nodes) {
    if (node.themeTemplateId) {
      return node;
    }

    const nestedNode = findFirstSelectableThemeNode(node.children);

    if (nestedNode) {
      return nestedNode;
    }
  }

  return null;
}

export function findThemeNodeById(
  nodes: ThemeNode[],
  themeId: string,
): ThemeNode | null {
  for (const node of nodes) {
    if (node.themeTemplateId === themeId) {
      return node;
    }

    const nestedNode = findThemeNodeById(node.children, themeId);

    if (nestedNode) {
      return nestedNode;
    }
  }

  return null;
}

export function findThemeNodeByNodeId(
  nodes: ThemeNode[],
  nodeId: string,
): ThemeNode | null {
  for (const node of nodes) {
    if (node.id === nodeId) {
      return node;
    }

    const nestedNode = findThemeNodeByNodeId(node.children, nodeId);

    if (nestedNode) {
      return nestedNode;
    }
  }

  return null;
}

export function findThemeNodePath(
  nodes: ThemeNode[],
  themeId: string,
  trail: string[] = [],
): string[] | null {
  for (const node of nodes) {
    const nextTrail = [...trail, node.label];

    if (node.themeTemplateId === themeId) {
      return nextTrail;
    }

    const nestedMatch = findThemeNodePath(node.children, themeId, nextTrail);

    if (nestedMatch) {
      return nestedMatch;
    }
  }

  return null;
}

export function getNodeChildrenAtPath(
  nodes: ThemeNode[],
  path: string[],
): ThemeNode[] {
  if (!path.length) {
    return [];
  }

  const currentNode = findThemeNodeByNodeId(nodes, path[0]);

  if (!currentNode) {
    return [];
  }

  if (path.length === 1) {
    return currentNode.children;
  }

  return getNodeChildrenAtPath(currentNode.children, path.slice(1));
}
