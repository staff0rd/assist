import type { WebSocket } from "ws";
import { loadConfigFrom } from "../../../shared/loadConfig";
import { resolveRunConfigs } from "../../../shared/resolveRunConfigs";

export function handleRunConfigs(ws: WebSocket, cwd: string): void {
	try {
		const { config, configDir } = loadConfigFrom(cwd);
		const configs = resolveRunConfigs(config.run, configDir);
		ws.send(
			JSON.stringify({
				type: "run-configs",
				configs: configs.map(({ name, params }) => ({ name, params })),
			}),
		);
	} catch {
		ws.send(JSON.stringify({ type: "run-configs", configs: [] }));
	}
}
