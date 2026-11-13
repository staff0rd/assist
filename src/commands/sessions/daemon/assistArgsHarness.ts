import type { HarnessDefaultsType } from "../../backlog/resolveHarness";
import { harnessKinds } from "../../../shared/harnessKinds";
import type { HarnessKind } from "../../../shared/harnesses";
import { loadConfigFrom } from "../../../shared/loadConfigFrom";
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

function isHarnessKind(value: string): value is HarnessKind {
	return (harnessKinds as readonly string[]).includes(value);
}

export function assistArgsHarness(
	args: string[],
	cwd: string | undefined,
): HarnessKind | undefined {
	const value = flagValue(args);
	if (value) return isHarnessKind(value) ? value : undefined;
	try {
		const { harness } = loadConfigFrom(cwd ?? process.cwd());
		const type = defaultsType(args);
		return (type && harness.defaults?.[type]?.harness) || harness.engine;
	} catch (error) {
		daemonLog(
			`assist ${args.join(" ")}: harness not resolved from config (${error instanceof Error ? error.message : String(error)})`,
		);
		return undefined;
	}
}
