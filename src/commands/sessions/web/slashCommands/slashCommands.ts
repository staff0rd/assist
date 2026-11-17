import type { IncomingMessage, ServerResponse } from "node:http";
import { harnesses } from "../../../../shared/harnesses";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { listSlashCommands } from "./listSlashCommands";
import { startPointProjectCommands } from "./startPointProjectCommands";

function wantsStartPoint(req: IncomingMessage): boolean {
	const url = new URL(req.url ?? "/", "http://localhost");
	return url.searchParams.get("startPoint") === "1";
}

export async function slashCommands(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	const project = wantsStartPoint(req)
		? await startPointProjectCommands(cwd)
		: null;
	respondJson(res, 200, {
		commands: listSlashCommands(harnesses.claude.homeDir, cwd, project),
	});
}
