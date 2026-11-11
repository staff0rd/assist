import type { IncomingMessage, ServerResponse } from "node:http";
import { harnesses } from "../../../../shared/harnesses";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { listSlashCommands } from "./listSlashCommands";

export function slashCommands(req: IncomingMessage, res: ServerResponse): void {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	respondJson(res, 200, {
		commands: listSlashCommands(harnesses.claude.homeDir, cwd),
	});
}
