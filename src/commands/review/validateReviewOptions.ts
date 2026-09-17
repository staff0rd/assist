import type { ReviewOptions } from "./ReviewOptions";

export function validateReviewOptions(options: ReviewOptions): void {
	if (options.apply && options.refine) {
		console.error("Error: --apply cannot be combined with --refine.");
		process.exit(1);
	}
	if (options.backlog && (options.refine || options.apply)) {
		console.error(
			"Error: --backlog cannot be combined with --refine or --apply.",
		);
		process.exit(1);
	}
	validateCheckoutOnly(options);
	validateHighLevel(options);
}

function validateCheckoutOnly(options: ReviewOptions): void {
	if (!options.checkoutOnly) return;
	if (!options.number) {
		console.error("Error: --checkout-only requires a PR number.");
		process.exit(1);
	}
	if (options.refine || options.apply || options.backlog || options.submit) {
		console.error(
			"Error: --checkout-only cannot be combined with --refine, --apply, --backlog or --submit.",
		);
		process.exit(1);
	}
}

function validateHighLevel(options: ReviewOptions): void {
	if (!options.highLevel) return;
	if (
		options.refine ||
		options.apply ||
		options.backlog ||
		options.submit ||
		options.checkoutOnly
	) {
		console.error(
			"Error: --high-level cannot be combined with --refine, --apply, --backlog, --submit or --checkout-only.",
		);
		process.exit(1);
	}
}
