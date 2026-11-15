import { landTree } from "./landTree";

export function parallelPhaseNumber(): number | undefined {
	const phase = Number(process.env.ASSIST_BACKLOG_PHASE);
	return landTree() && Number.isInteger(phase) ? phase : undefined;
}
