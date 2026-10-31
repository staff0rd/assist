import type { MouseEvent } from "react";
import { reportCaughtError } from "../../../clientFailures/reportCaughtError";

const confirmMs = 1200;

export function copyCodeOnClick(event: MouseEvent<HTMLElement>): void {
	const button = (event.target as Element).closest<HTMLButtonElement>(
		"button.copy-code",
	);
	if (!button) return;
	void navigator.clipboard
		?.writeText(button.dataset.copy ?? "")
		.then(() => {
			button.classList.add("copied");
			button.title = "Copied";
			setTimeout(() => {
				button.classList.remove("copied");
				button.title = "Copy";
			}, confirmMs);
		})
		.catch((error: unknown) => reportCaughtError(error, "copy code"));
}
