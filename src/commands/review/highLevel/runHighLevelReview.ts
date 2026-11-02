import { getCurrentPrNumber } from "../../prs/shared";
import { announceSavedReview } from "./announceSavedReview";
import type { HighLevelSlicing } from "./gatherHighLevelSlices";
import { gatherHighLevelSubject } from "./gatherHighLevelSubject";
import { openHighLevelOverlay } from "./openHighLevelOverlay";
import { printHighLevelChecklist } from "./printHighLevelChecklist";

function resolvePrNumber(number: string | undefined): number {
	if (number === undefined) return getCurrentPrNumber();
	const parsed = Number(number);
	if (!Number.isInteger(parsed) || parsed <= 0) {
		console.error(`Error: \`${number}\` is not a pull request number.`);
		process.exit(1);
	}
	return parsed;
}

function gatherSubject(
	prNumber: number,
	force: boolean,
	slicing: HighLevelSlicing | undefined,
) {
	try {
		return gatherHighLevelSubject(prNumber, force, slicing);
	} catch (error) {
		console.error(
			`Error: ${error instanceof Error ? error.message : String(error)}`,
		);
		process.exit(1);
	}
}

function sessionId(): string | undefined {
	const id = process.env.ASSIST_SESSION_ID;
	return process.env.ASSIST_SESSION === "1" && id ? id : undefined;
}

export async function runHighLevelReview(
	number: string | undefined,
	options: { force?: boolean; slices?: string } = {},
): Promise<void> {
	const force = options.force === true;
	const session = sessionId();
	const slicing = session
		? { force, ...(options.slices ? { slicesFile: options.slices } : {}) }
		: undefined;
	const subject = gatherSubject(resolvePrNumber(number), force, slicing);
	announceSavedReview(subject, force);
	if (!session) return printHighLevelChecklist(subject);
	await openHighLevelOverlay(session, subject);
}
