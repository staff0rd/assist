import type { Session } from "./createSession";
import { spawnPty } from "./spawnPty";
import { startOrHoldPty } from "./startOrHoldPty";

export type AssistSessionMeta = {
	title?: string;
	subtitle?: string;
	inPlace?: boolean;
	autoApprove?: boolean;
};

export function createAssistSession(
	id: string,
	assistArgs: string[],
	cwd?: string,
	meta?: AssistSessionMeta,
	holdPty?: boolean,
): Session {
	const startedAt = Date.now();
	return {
		id,
		name: `assist ${assistArgs.join(" ")}`,
		title: meta?.title,
		subtitle: meta?.subtitle,
		commandType: "assist",
		status: "running",
		startedAt,
		runningMs: 0,
		runningSince: startedAt,
		waitingSince: null,
		...startOrHoldPty(
			() => spawnPty(["assist", ...assistArgs], cwd, id),
			holdPty,
		),
		scrollback: "",
		assistArgs,
		cwd,
		...(meta?.autoApprove && { autoApprove: true }),
	};
}
