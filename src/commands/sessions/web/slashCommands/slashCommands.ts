import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { listSlashCommands } from "./listSlashCommands";
import { requestedSlashSources } from "./requestedSlashSources";
import { startPointProjectCommands } from "./startPointProjectCommands";

export async function slashCommands(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const { sources, startPoint } = requestedSlashSources(req);
	const project = startPoint
		? await startPointProjectCommands(cwd, sources.projectDirs)
		: null;
	respondJson(res, 200, {
		commands: listSlashCommands(sources, cwd, project),
	});
}
