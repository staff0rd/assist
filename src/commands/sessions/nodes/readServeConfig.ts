import type { TailscaleServeConfig } from "./planServe";
import { runTailscale } from "./runTailscale";

export async function readServeConfig(): Promise<TailscaleServeConfig> {
	const stdout = (await runTailscale(["serve", "status", "--json"])).trim();
	return stdout ? (JSON.parse(stdout) as TailscaleServeConfig) : {};
}
