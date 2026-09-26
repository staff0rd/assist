import CloudDownloadIcon from "@mui/icons-material/CloudDownloadOutlined";
import { Chip, Tooltip } from "@mui/material";
import type { RepoSummary } from "../fetchRepoSummaries";
import type { ClonePrompt } from "./launchClone";
import { cloneTooltip } from "./cloneTooltip";

type RepoChipProps = {
	summary: RepoSummary;
	node?: string;
	onSelectCwd: (cwd: string) => void;
	onRequestClone: (target: ClonePrompt) => void;
};

const clonableSx = { borderStyle: "dashed" } as const;

export function RepoChip({
	summary,
	node,
	onSelectCwd,
	onRequestClone,
}: RepoChipProps) {
	const { origin, displayName, openCount, isCurrent, cwd, cloneTarget } =
		summary;
	const clonable = !cwd && !!cloneTarget;
	const onClick = cwd
		? () => onSelectCwd(cwd)
		: clonable && cloneTarget
			? () => onRequestClone({ origin, cloneTarget, displayName, node })
			: undefined;

	const chip = (
		<Chip
			label={`${displayName} (${openCount})`}
			size="small"
			color={isCurrent ? "primary" : "default"}
			variant={isCurrent ? "filled" : "outlined"}
			disabled={!cwd && !clonable}
			onClick={onClick}
			icon={clonable ? <CloudDownloadIcon /> : undefined}
			sx={clonable ? clonableSx : undefined}
		/>
	);
	if (!clonable || !cloneTarget) return chip;
	return (
		<Tooltip describeChild title={cloneTooltip(node, cloneTarget)}>
			{chip}
		</Tooltip>
	);
}
