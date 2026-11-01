import type { BacklogDatabase } from "../../shared/db/Db";
import { finishJobRun } from "../../shared/db/finishJobRun";
import type { JobTrigger } from "../../shared/db/jobRuns";
import { startJobRun } from "../../shared/db/startJobRun";
import { emptyScanUsage } from "./emptyScanUsage";
import type { InboxScanListener, InboxScanUsage } from "./InboxScanEvent";

type ScanSummary = { flagged: number; added: number; usage: InboxScanUsage };

function usageColumns(usage: InboxScanUsage) {
	return {
		inputTokens: usage.input,
		outputTokens: usage.output,
		cacheReadTokens: usage.cacheRead,
		cacheWriteTokens: usage.cacheWrite,
		costUsd: usage.costUsd,
	};
}

export async function withInboxScanJob(
	orm: BacklogDatabase,
	trigger: JobTrigger,
	listener: InboxScanListener,
	scan: (listener: InboxScanListener) => Promise<ScanSummary>,
): Promise<ScanSummary> {
	const startedAt = new Date();
	const id = await startJobRun(orm, { kind: "inbox-scan", trigger, startedAt });
	let usage = emptyScanUsage();
	let model: string | null = null;
	const finish = (status: "finished" | "failed", detail: string) => {
		const finishedAt = new Date();
		return finishJobRun(orm, id, {
			status,
			finishedAt,
			durationMs: finishedAt.getTime() - startedAt.getTime(),
			model,
			...usageColumns(usage),
			detail,
		});
	};
	try {
		const result = await scan({
			...listener,
			onUsage: (next) => {
				usage = next;
				listener.onUsage?.(next);
			},
			onModel: (next) => {
				model = next;
				listener.onModel?.(next);
			},
		});
		usage = result.usage;
		await finish("finished", `${result.flagged} flagged · ${result.added} new`);
		return result;
	} catch (error) {
		const message = error instanceof Error ? error.message : String(error);
		await finish("failed", message).catch(() => {});
		throw error;
	}
}
