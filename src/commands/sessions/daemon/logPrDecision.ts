import { daemonLog } from "./daemonLog";

function count(value: unknown): number {
	return Array.isArray(value) ? value.length : 0;
}

export function logPrDecision(
	id: string,
	requestId: string,
	d: Record<string, unknown>,
): void {
	daemonLog(
		`pr-decision received: id=${id} requestId=${requestId} decision=${d.decision} comments=${count(d.comments)} screenshots=${count(d.screenshots)} checklist=${count(d.checklist)} reviewEvent=${d.reviewEvent} reviewComments=${count(d.reviewComments)} reviewAfter=${d.reviewAfter === true} announceAfter=${d.announceAfter === true} draft=${d.draft} autoMerge=${d.autoMerge === true} autostart=${d.autostart === true} answers=${d.answers && typeof d.answers === "object" ? Object.keys(d.answers).length : 0}`,
	);
}
