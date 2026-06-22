import { and, eq } from "drizzle-orm";
import type { BacklogDatabase, Db } from "./Db";
import { RESET_DROP_THRESHOLD } from "./recordWindowPeak";
import { metadata, usagePeaks } from "./schema";

const MIGRATION_KEY = "usage_peaks_false_reset_cleanup";

type Row = typeof usagePeaks.$inferSelect;
type CollapsedSegment = {
	segment: number;
	usedPercentage: number;
	resetDetected: boolean;
};

/** A reading climbs back to within the threshold of `top` — so `top` was never a reset. */
const climbsBack = (top: number | undefined, peak: number): boolean =>
	top !== undefined && peak > top - RESET_DROP_THRESHOLD;

/** Pop every shallower peak `peak` climbs back to, folding them into the higher survivor. */
function mergeDown(stack: number[], peak: number): number {
	while (climbsBack(stack.at(-1), peak))
		peak = Math.max(peak, stack.pop() ?? peak);
	return peak;
}

/**
 * Collapse a cycle's segment peaks (in segment order) down to the
 * strictly-decreasing chain a genuine history would leave. A peak that climbs
 * back to within {@link RESET_DROP_THRESHOLD} of a shallower one was never a
 * reset — usage only climbs within a cycle — so it merges into that segment. The
 * survivors are renumbered from 0, with `resetDetected` set on every segment
 * except the last (each is the frozen pre-reset peak of the reset that follows).
 */
export function collapseSegments(peaks: number[]): CollapsedSegment[] {
	const stack: number[] = [];
	for (const peak of peaks) stack.push(mergeDown(stack, peak));
	return stack.map((usedPercentage, i) => ({
		segment: i,
		usedPercentage,
		resetDetected: i < stack.length - 1,
	}));
}

const sig = (s: CollapsedSegment) =>
	`${s.segment}:${s.usedPercentage}:${s.resetDetected}`;

const isUnchanged = (rows: Row[], collapsed: CollapsedSegment[]): boolean =>
	rows.length === collapsed.length &&
	rows.every((r, i) => sig(r) === sig(collapsed[i]));

const groupByCycle = (rows: Row[]): Map<string, Row[]> =>
	rows.reduce((cycles, r) => {
		const key = `${r.window} ${r.resetsAt}`;
		return cycles.set(key, [...(cycles.get(key) ?? []), r]);
	}, new Map<string, Row[]>());

const earliest = (rows: Row[]): Date =>
	rows.reduce((a, r) => (r.createdAt < a ? r.createdAt : a), rows[0].createdAt);

async function overwrite(
	tx: BacklogDatabase,
	{ window, resetsAt }: Row,
	createdAt: Date,
	collapsed: CollapsedSegment[],
): Promise<void> {
	await tx
		.delete(usagePeaks)
		.where(
			and(eq(usagePeaks.window, window), eq(usagePeaks.resetsAt, resetsAt)),
		);
	await tx
		.insert(usagePeaks)
		.values(collapsed.map((c) => ({ window, resetsAt, createdAt, ...c })));
}

/** Rewrite one cycle to its collapsed chain, unless collapsing leaves it unchanged. */
async function rewriteCycle(tx: BacklogDatabase, rows: Row[]): Promise<void> {
	const collapsed = collapseSegments(rows.map((r) => r.usedPercentage));
	if (isUnchanged(rows, collapsed)) return;
	await overwrite(tx, rows[0], earliest(rows), collapsed);
}

const loadAll = (tx: BacklogDatabase): Promise<Row[]> =>
	tx
		.select()
		.from(usagePeaks)
		.orderBy(usagePeaks.window, usagePeaks.resetsAt, usagePeaks.segment);

const markRun = (tx: BacklogDatabase) =>
	tx
		.insert(metadata)
		.values({ key: MIGRATION_KEY, value: "done" })
		.onConflictDoNothing();

async function alreadyRun(tx: BacklogDatabase): Promise<boolean> {
	const done = await tx
		.select()
		.from(metadata)
		.where(eq(metadata.key, MIGRATION_KEY));
	return done.length > 0;
}

/**
 * One-off cleanup of the false-reset rows the pre-fix {@link recordWindowPeak}
 * left behind: stale/out-of-order readings opened spurious reset segments whose
 * peaks trend upward within a cycle. Runs once per database (guarded by a
 * {@link metadata} key) and is idempotent — re-collapsing already-clean cycles
 * is a no-op. Each affected cycle is rewritten to its collapsed segment chain.
 */
export async function cleanupFalseResetSegments(db: Db): Promise<void> {
	await db.transaction(async (tx) => {
		if (await alreadyRun(tx)) return;
		for (const rows of groupByCycle(await loadAll(tx)).values()) {
			await rewriteCycle(tx, rows);
		}
		await markRun(tx);
	});
}
