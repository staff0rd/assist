import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { runCommandToCompletion } from "../../run/runCommandToCompletion";
import { performRestart, type RestartWebDeps } from "./restartWeb";

type SelfUpdateDeps = RestartWebDeps & {
	runUpdate?: () => Promise<void>;
};

async function runAssistUpdate(): Promise<void> {
	const result = await runCommandToCompletion("assist", ["update"]);
	if (result.kind === "failed") throw new Error(result.message);
	if (result.exitCode !== 0)
		throw new Error(`assist update exited with code ${result.exitCode}`);
}

export async function selfUpdate(
	_req: IncomingMessage,
	res: ServerResponse,
	deps: SelfUpdateDeps = {},
): Promise<void> {
	const { runUpdate = runAssistUpdate, ...restartDeps } = deps;
	console.log("self-update: requested by a linked node; running assist update");
	try {
		await runUpdate();
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		console.log(`self-update: failed: ${message}`);
		respondJson(res, 500, { error: message });
		return;
	}
	console.log("self-update: updated; restarting daemon and web server");
	await new Promise<void>((resolve) => {
		res.once("finish", resolve);
		respondJson(res, 200, { ok: true });
	});
	await performRestart("both", restartDeps);
}
