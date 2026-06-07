import { loadConfigFrom } from "../../../shared/loadConfig";
import { resolveRunConfigs } from "../../../shared/resolveRunConfigs";
import { type SessionClient, sendTo } from "./broadcast";

export function handleRunConfigs(client: SessionClient, cwd: string): void {
	try {
		const { config, configDir } = loadConfigFrom(cwd);
		const configs = resolveRunConfigs(config.run, configDir);
		sendTo(client, {
			type: "run-configs",
			configs: configs.map(({ name, params }) => ({ name, params })),
		});
	} catch {
		sendTo(client, { type: "run-configs", configs: [] });
	}
}
