import type { ExtensionUpdateStatus } from "../sessions/shared/ExtensionUpdateStatus";

export function formatExtensionUpdate(status: ExtensionUpdateStatus): string {
	if (!status.latest)
		return "latest signed: unknown (updates.json unreachable)";
	if (!status.behind) return `latest signed: v${status.latest} (up to date)`;
	return `latest signed: v${status.latest} (behind; the assist web UI offers the install link)`;
}
