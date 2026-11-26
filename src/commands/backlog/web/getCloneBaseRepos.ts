import type { IncomingMessage, ServerResponse } from "node:http";
import { expandTilde } from "../../../shared/expandTilde";
import { loadConfig } from "../../../shared/loadConfig";
import { respondJson } from "../../../shared/web";
import { originForCwd } from "../../sessions/daemon/originForCwd";
import { listCloneBaseRepos } from "./listCloneBaseRepos";

export function getCloneBaseRepos(
	_req: IncomingMessage,
	res: ServerResponse,
): void {
	const baseDir = expandTilde(loadConfig().clone.baseDir);
	const repos = listCloneBaseRepos(baseDir).map((repo) => ({
		...repo,
		origin: originForCwd(repo.cwd),
	}));
	respondJson(res, 200, { repos });
}
