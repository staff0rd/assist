import { getDb } from "../../shared/db/getDb";
import { getCurrentOrigin } from "../backlog/getCurrentOrigin";
import { countPendingHandovers } from "./countPendingHandovers";
import { migrateDiskHandovers } from "./migrateDiskHandovers";
import { parseLoadInput } from "./parseLoadInput";
import { resolveLoadOptions } from "./resolveLoadOptions";
import type { LoadOptions } from "./types";

function advisory(count: number): string {
	const noun = count === 1 ? "handover" : "handovers";
	return `${count} unrecalled ${noun} for this repo. Run /recall to load.`;
}

function emit(message: string): string {
	const json = JSON.stringify({
		hookSpecificOutput: { hookEventName: "SessionStart" },
		systemMessage: message,
	});
	console.log(json);
	return json;
}

export async function load(options: LoadOptions = {}): Promise<string | null> {
	const opts = resolveLoadOptions(options);
	const input = await parseLoadInput(opts.stdin);
	const cwd = input.cwd ?? opts.cwdFallback;
	const origin = getCurrentOrigin(cwd);

	const orm = options.orm ?? (await getDb());
	await migrateDiskHandovers(orm, origin, cwd);

	const count = await countPendingHandovers(orm, origin);
	if (count === 0) return null;
	return emit(advisory(count));
}
