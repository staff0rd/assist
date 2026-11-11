import type { IncomingMessage, ServerResponse } from "node:http";
import { harnesses } from "../../../../shared/harnesses";
import { respondJson } from "../../../../shared/web";
import { getCwdParam } from "../getCwdParam";
import { readSlashCommands } from "./readSlashCommands";

export function slashCommands(req: IncomingMessage, res: ServerResponse): void {
	if (!getCwdParam(req, res)) return;
	respondJson(res, 200, {
		commands: readSlashCommands(harnesses.claude.homeDir, "user"),
	});
}
