import { Paper } from "@mui/material";
import type { PhaseStatus, PhaseUsage, PlanPhase } from "../types";
import { ManualChecks } from "./ManualChecks";
import { PhaseHeader } from "./PhaseHeader";
import { PhaseUsageLine } from "./PhaseUsageLine";
import { TaskList } from "./TaskList";

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

function paperSx(styles: {
	borderColor: string;
	bgcolor: string;
	ring?: string;
}) {
	return {
		p: 2,
		borderColor: styles.borderColor,
		bgcolor: styles.bgcolor,
		...(styles.ring
			? { boxShadow: `0 0 0 2px` as const, borderColor: "info.main" }
			: {}),
	};
}

const markers: Record<PhaseStatus, string> = {
	done: "\u2713",
	current: "\u2022",
	upcoming: "\u2022",
};
type PhaseCardProps = {
	phase: PlanPhase;
	index: number;
	status: PhaseStatus;
	itemId?: number;
	usage?: PhaseUsage;
	onRewind?: () => Promise<void>;
};

export function PhaseCard({
	phase,
	index,
	status,
	itemId,
	usage,
	onRewind,
}: PhaseCardProps) {
	const checks = phase.manualChecks ?? [];
	return (
		<Paper variant="outlined" sx={paperSx(statusStyles[status])}>
			<PhaseHeader
				phase={phase}
				index={index}
				status={status}
				itemId={itemId}
				onRewind={onRewind}
			/>
			{usage && <PhaseUsageLine usage={usage} />}
			<TaskList tasks={phase.tasks} marker={markers[status]} />
			{checks.length > 0 && <ManualChecks checks={checks} />}
		</Paper>
	);
}
