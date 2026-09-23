import CloudDownloadIcon from "@mui/icons-material/CloudDownloadOutlined";
import { Chip, Tooltip } from "@mui/material";
import type { RepoSummary } from "../fetchRepoSummaries";
import type { ClonePrompt } from "./resolveCloneWatch";

type RepoChipProps = {
	summary: RepoSummary;
	onSelectCwd: (cwd: string) => void;
	onRequestClone: (target: ClonePrompt) => void;
};

const clonableSx = { borderStyle: "dashed" } as const;

export function RepoChip({
	summary,
	onSelectCwd,
	onRequestClone,
}: RepoChipProps) {
	const { origin, displayName, openCount, isCurrent, cwd, cloneTarget } =
		summary;
	const clonable = !cwd && !!cloneTarget;
	const onClick = cwd
		? () => onSelectCwd(cwd)
		: clonable && cloneTarget
			? () => onRequestClone({ origin, cloneTarget, displayName })
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
	if (!clonable) return chip;
	return (
		<Tooltip
			describeChild
			title={`Not cloned locally — click to clone into ${cloneTarget}`}
		>
			{chip}
		</Tooltip>
	);
}
