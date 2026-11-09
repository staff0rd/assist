import { reviewPrCommentsFeature } from "../shared/harnessAdapters/prFeatures";
import type { HarnessKind } from "../shared/harnesses";
import { launchPrSkill } from "./launchPrSkill";

type ReviewPrCommentsOptions = {
	announce?: boolean;
	auto?: boolean;
	resumeSessionId?: string;
	harness?: HarnessKind;
};

function buildArgs(
	number: string | undefined,
	announce: boolean,
	options: ReviewPrCommentsOptions,
): string | undefined {
	const args = [
		...(options.auto ? ["--auto"] : []),
		...(announce ? [`--announce ${number}`] : []),
	];
	return args.length ? args.join(" ") : undefined;
}

function validateAnnounce(number: string | undefined, announce: boolean): void {
	if (!announce || number) return;
	console.error("Error: --announce requires a PR number.");
	process.exit(1);
}

export async function reviewPrComments(
	number?: string,
	options: ReviewPrCommentsOptions = {},
): Promise<void> {
	const announce = options.announce === true;
	validateAnnounce(number, announce);
	await launchPrSkill({
		feature: reviewPrCommentsFeature,
		skill: "review-pr-comments",
		args: buildArgs(number, announce, options),
		number,
		harness: options.harness,
		resumeSessionId: options.resumeSessionId,
	});
}
