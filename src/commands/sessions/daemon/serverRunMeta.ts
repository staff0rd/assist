import { getCurrentOrigin } from "../../backlog/getCurrentOrigin";
import { resolveRunConfig } from "./resolveRunConfig";

const DEFAULT_SERVER_GROUP = "default";

export type ServerRunMeta = {
	server: boolean;
	group?: string;
	port?: number;
	origin?: string;
};

export function serverRunMeta(
	runName: string,
	cwd: string | undefined,
): ServerRunMeta {
	const dir = cwd ?? process.cwd();
	const config = resolveRunConfig(runName, dir);
	if (!config?.server) return { server: false };
	return {
		server: true,
		group:
			typeof config.server === "string" ? config.server : DEFAULT_SERVER_GROUP,
		port: config.port,
		origin: getCurrentOrigin(dir),
	};
}
