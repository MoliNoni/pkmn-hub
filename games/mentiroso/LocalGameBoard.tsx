/**
 * Responsibilities:
 * - Preserve the old import path while redirecting to the refactored local
 *   Mentiroso board entrypoint.
 * - Provide a stable compatibility layer during the rename to
 *   `LocalMentirosoBoard`.
 *
 * Move to another module if needed:
 * - Once the rest of the app imports the new component path directly, this
 *   compatibility wrapper can be removed.
 * - If local/online entrypoints are unified behind a mode router, this file
 *   should be replaced by that router instead of holding long-term logic.
 */

export { default } from "@/games/mentiroso/components/LocalMentirosoBoard";
