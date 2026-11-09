import type { HarnessKind } from "../../shared/harnesses";

export type ReviewOptions = {
	prompt?: boolean;
	submit?: boolean;
	force?: boolean;
	refine?: boolean;
	apply?: boolean;
	backlog?: boolean;
	checkoutOnly?: boolean;
	highLevel?: boolean;
	configure?: boolean;
	slices?: string;
	scope?: string;
	answer?: string[];
	verbose?: boolean;
	addressComments?: boolean;
	announce?: boolean;
	number?: string;
	harness?: HarnessKind;
};
