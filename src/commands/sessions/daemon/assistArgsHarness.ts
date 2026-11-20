import type { HarnessDefaultsType } from "../../backlog/resolveHarness";
import { isHarnessKind } from "../../../shared/isHarnessKind";
import type { HarnessKind } from "../../../shared/harnesses";
import { loadMergedRawConfig } from "../../../shared/loadConfigFrom";
import { assistConfigSchema } from "../../../shared/types";
import { asRecord } from "../shared/asRecord";
import { daemonLog } from "./daemonLog";

function flagValue(args: string[]): string | undefined {
	const index = args.indexOf("--harness");
	if (index !== -1) return args[index + 1];
	return args.find((arg) => arg.startsWith("--harness="))?.slice(10);
}

function defaultsType(args: string[]): HarnessDefaultsType | undefined {
	if (args[0] === "draft" || args[0] === "bug") return args[0];
	if (args[0] === "next" || (args[0] === "backlog" && args[1] === "run"))
		return "run";
	return undefined;
}

function harnessIgnoringUnknownKeys(
	raw: Record<string, unknown>,
	type: HarnessDefaultsType | undefined,
): HarnessKind {
	const section = asRecord(raw.harness) ?? {};
	const typed = type
		? asRecord(asRecord(section.defaults)?.[type])?.harness
		: undefined;
	const value =
		typed ||
		section.engine ||
		assistConfigSchema.shape.harness.parse(undefined).engine;
	if (!isHarnessKind(value))
		throw new Error(`unknown harness "${String(value)}"`);
	return value;
}

export function assistArgsHarness(
	args: string[],
	cwd: string | undefined,
): HarnessKind | undefined {
	const value = flagValue(args);
	if (value) return isHarnessKind(value) ? value : undefined;
	try {
		return harnessIgnoringUnknownKeys(
			loadMergedRawConfig(cwd ?? process.cwd()),
			defaultsType(args),
		);
	} catch (error) {
		const reason = error instanceof Error ? error.message : String(error);
		daemonLog(
			`assist ${args.join(" ")}: harness not resolved from config (${reason})`,
		);
		throw new Error(
			`could not resolve the harness from config (${reason}); if assist was upgraded since the daemon started, restart the daemon`,
		);
	}
}
