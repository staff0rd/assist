import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { restartDaemon } from "../daemon/restartDaemon";
import { reExecWebServer } from "./restartMenu/reExecWebServer";

type RestartTarget = "daemon" | "webserver" | "both";

const TARGETS: RestartTarget[] = ["daemon", "webserver", "both"];

type RestartWebDeps = {
	restartDaemonFn?: () => Promise<void>;
	reExecFn?: () => void;
};

export async function restartWeb(
	req: IncomingMessage,
	res: ServerResponse,
	deps: RestartWebDeps = {},
): Promise<void> {
	const { restartDaemonFn = restartDaemon, reExecFn = reExecWebServer } = deps;
	const url = new URL(req.url ?? "/", "http://localhost");
	const target = url.searchParams.get("target");
	if (!target || !TARGETS.includes(target as RestartTarget)) {
		respondJson(res, 400, { error: "Invalid target" });
		return;
	}

	// why: a webserver re-exec replaces this process, so the response must fully flush before restarting or the client never hears back
	await new Promise<void>((resolve) => {
		res.once("finish", resolve);
		respondJson(res, 200, { ok: true });
	});

	if (target === "daemon" || target === "both") {
		await restartDaemonFn();
	}
	if (target === "webserver" || target === "both") {
		reExecFn();
	}
}
