import type { SessionStatus } from "../../types";

const COLORS: Partial<Record<SessionStatus, string>> = {
	error: "error.main",
	done: "success.main",
};

export function otherChipColor(status: SessionStatus): string {
	return COLORS[status] ?? "text.secondary";
}
