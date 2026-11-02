import type { IncomingMessage, ServerResponse } from "node:http";
import { expandTilde } from "../../../shared/expandTilde";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { listNoteRepos } from "./listNoteRepos";

export function getNoteRepos(_req: IncomingMessage, res: ServerResponse): void {
	const baseDir = expandTilde(loadConfig().clone.baseDir);
	respondJson(res, 200, { repos: listNoteRepos(baseDir) });
}
