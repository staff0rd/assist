import { getCurrentOrigin } from "../../backlog/getCurrentOrigin";
import { resolveRunConfig } from "./resolveRunConfig";

export type ServerRunMeta = {
	server: boolean;
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
	return { server: true, port: config.port, origin: getCurrentOrigin(dir) };
}
