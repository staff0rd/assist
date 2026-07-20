import { Chip } from "@mui/material";
import type { RepoSummary } from "../fetchRepoSummaries";
import type { ClonePrompt } from "./resolveCloneWatch";

type RepoChipProps = {
	summary: RepoSummary;
	onSelectCwd: (cwd: string) => void;
	onRequestClone: (target: ClonePrompt) => void;
};

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

	return (
		<Chip
			label={`${displayName} (${openCount})`}
			size="small"
			color={isCurrent ? "primary" : "default"}
			variant={isCurrent ? "filled" : "outlined"}
			disabled={!cwd && !clonable}
			onClick={onClick}
		/>
	);
}
