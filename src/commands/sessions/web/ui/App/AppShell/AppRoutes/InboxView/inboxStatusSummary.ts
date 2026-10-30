import { formatRelativeTime } from "../../../../formatRelativeTime";
import type { InboxStatus } from "./types";

export function inboxStatusSummary(status: InboxStatus | undefined): string {
	if (!status) return "";
	if (status.scanning) return "Scanning Gmail and Slack…";
	const last = status.lastScanAt
		? `Last scanned ${formatRelativeTime(status.lastScanAt)}`
		: "Never scanned";
	const schedule = status.intervalMinutes
		? `scans every ${status.intervalMinutes} min`
		: "scheduled scans off";
	return `${last} · ${schedule}`;
}
