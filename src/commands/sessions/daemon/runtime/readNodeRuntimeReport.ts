import { readFileSync } from "node:fs";
import { daemonPaths } from "../daemonPaths";
import type { NodeRuntimeReport } from "./NodeRuntimeReport";

export function readNodeRuntimeReport(): NodeRuntimeReport | undefined {
	try {
		return JSON.parse(readFileSync(daemonPaths.runtime, "utf8"));
	} catch {
		return undefined;
	}
}
