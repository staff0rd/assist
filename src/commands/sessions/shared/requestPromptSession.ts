import { loadConfig } from "../../../shared/loadConfig";
import { requestSession } from "./requestSession";

export function requestPromptSession(
	prompt: string,
	cwd?: string,
	options?: { inPlace?: boolean; launchedFrom?: string },
): Promise<string> {
	return requestSession({
		type: "create",
		prompt,
		cwd,
		harness: loadConfig().harness.engine,
		inPlace: options?.inPlace === true,
		launchedFrom: options?.launchedFrom ?? process.env.ASSIST_SESSION_ID,
	});
}
