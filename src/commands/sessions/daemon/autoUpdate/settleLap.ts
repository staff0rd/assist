import { stripAnsi } from "../../../../shared/stripAnsi";
import { decideLap, type LapEnd } from "../../../watch/decideLap";
import type { AutoUpdateDeps } from "./AutoUpdateDeps";
import { backOff } from "./backOff";

const DIVERGED_EXIT_CODE = 3;

export async function settleLap(
	lap: number,
	{ end, tail }: { end: LapEnd; tail: string },
	deps: AutoUpdateDeps,
): Promise<string | undefined> {
	const how = end.signal ? `killed by ${end.signal}` : `exited ${end.code}`;
	if (end.code === DIVERGED_EXIT_CODE) {
		let held: string;
		try {
			held = deps.escalate(tail);
		} catch (error) {
			const reason = error instanceof Error ? error.message : String(error);
			await backOff(
				`lap ${lap} ${how} (divergence); escalation refused: ${reason.replaceAll("\n", " ")}`,
				deps,
			);
			return undefined;
		}
		deps.note(`lap ${lap} ${how} (divergence); escalated to session ${held}`);
		return held;
	}
	if (deps.paused()) deps.note(`lap ${lap} ${how}; paused`);
	else if (decideLap(end, false).kind === "relaunch")
		deps.note(`lap ${lap} ${how}; relaunching`);
	else {
		const why = lastLine(tail);
		await backOff(`lap ${lap} ${how}${why ? `: ${why}` : ""}`, deps);
	}
	return undefined;
}

function lastLine(text: string): string | undefined {
	return stripAnsi(text)
		.split(/\r?\n|\r/)
		.map((line) => line.trim())
		.filter(Boolean)
		.pop();
}
