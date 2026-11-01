import type { ChipProps } from "@mui/material";

const chips: Record<string, { label: string; color: ChipProps["color"] }> = {
	running: { label: "Running", color: "info" },
	finished: { label: "Finished", color: "success" },
	failed: { label: "Failed", color: "error" },
};

export function usageJobOutcomeChip(status: string): {
	label: string;
	color: ChipProps["color"];
} {
	return chips[status] ?? { label: status, color: "default" };
}
