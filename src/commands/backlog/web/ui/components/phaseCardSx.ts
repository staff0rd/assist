import type { PhaseStatus } from "../types";

const statusStyles: Record<
	PhaseStatus,
	{ borderColor: string; bgcolor: string; ring?: string }
> = {
	done: { borderColor: "success.light", bgcolor: "success.light" },
	current: {
		borderColor: "info.main",
		bgcolor: "info.light",
		ring: "info.light",
	},
	upcoming: { borderColor: "divider", bgcolor: "background.paper" },
};

export function phaseCardSx(status: PhaseStatus) {
	const styles = statusStyles[status];
	return {
		p: 2,
		borderColor: styles.ring ? "info.main" : styles.borderColor,
		bgcolor: styles.bgcolor,
		...(styles.ring ? { boxShadow: "0 0 0 2px" as const } : {}),
	};
}

export const markers: Record<PhaseStatus, string> = {
	done: "✓",
	current: "•",
	upcoming: "•",
};
