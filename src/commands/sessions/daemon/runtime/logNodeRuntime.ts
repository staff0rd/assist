import { writeFileSync } from "node:fs";
import { daemonLog } from "../daemonLog";
import { daemonPaths } from "../daemonPaths";
import { currentDeclared } from "./currentDeclared";
import type { NodeRuntimeReport } from "./NodeRuntimeReport";
import { nodeRuntimeMismatch } from "./nodeRuntimeMismatch";
import { probeHarnessCli } from "./probeHarnessCli";

const HARNESS_CLIS = ["claude", "codex", "pi"];

function describeProbe(probe: NodeRuntimeReport["harnesses"][number]): string {
	if (probe.error) return `harness ${probe.name}: ${probe.error}`;
	return `harness ${probe.name}: ${probe.path} (${probe.version ?? "unknown version"})`;
}

export async function logNodeRuntime(): Promise<void> {
	const node = { version: process.version, path: process.execPath };
	const declared = currentDeclared();
	daemonLog(
		`runtime: node ${node.version} (${node.path})${
			declared
				? `; sessions.nodeVersion "${declared.spec}"`
				: "; sessions.nodeVersion not set"
		}`,
	);
	const mismatch = nodeRuntimeMismatch(node, declared);
	if (mismatch) daemonLog(`runtime: ${mismatch}`);
	const harnesses = await Promise.all(HARNESS_CLIS.map(probeHarnessCli));
	for (const probe of harnesses) daemonLog(`runtime: ${describeProbe(probe)}`);
	const report: NodeRuntimeReport = { node, declared, mismatch, harnesses };
	try {
		writeFileSync(daemonPaths.runtime, JSON.stringify(report, null, 2));
	} catch (error) {
		daemonLog(
			`runtime: could not write ${daemonPaths.runtime}: ${error instanceof Error ? error.message : String(error)}`,
		);
	}
}
