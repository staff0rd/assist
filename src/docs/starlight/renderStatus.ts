import { statusGlyph } from "../../commands/sessions/web/ui/statusGlyph";

const glyphStatuses = [
	"waiting",
	"question",
	"check",
	"done",
	"error",
	"stopped",
] as const;
const dotStatuses = ["running", "verifying"] as const;

type DocsStatus = (typeof glyphStatuses)[number] | (typeof dotStatuses)[number];

const docsStatuses: readonly DocsStatus[] = [...dotStatuses, ...glyphStatuses];

function isDocsStatus(status: string): status is DocsStatus {
	return (docsStatuses as readonly string[]).includes(status);
}

function renderDot(ring: boolean): string {
	const ringCircle = ring
		? '<circle class="assist-status-ring" cx="8" cy="8" r="6.25" pathLength="100"/>'
		: "";
	return `<svg class="assist-status-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><circle cx="8" cy="8" r="3" fill="currentColor"/>${ringCircle}</svg>`;
}

export function renderStatus(status: string): string {
	if (!isDocsStatus(status))
		throw new Error(
			`Unknown :status[${status}], expected one of ${docsStatuses.join(", ")}`,
		);
	const content =
		status === "running" || status === "verifying"
			? renderDot(status === "verifying")
			: `<span class="assist-status-icon" aria-hidden="true">${statusGlyph[status]}</span>`;
	return `<span class="assist-status assist-status-${status}" title="${status}">${content}<span class="sr-only">${status}</span></span>`;
}
