import type { ReviewMode } from "./ReviewDropdown";

export function reviewModeArgs(mode: ReviewMode): string[] {
	switch (mode) {
		case "review-comments":
			return ["review-comments"];
		case "review-post":
			return ["review", "--no-prompt", "--submit"];
		default:
			return ["review"];
	}
}
