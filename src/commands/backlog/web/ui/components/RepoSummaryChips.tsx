import { Chip, Stack } from "@mui/material";
import { useRepoSelectionContext } from "../../../../sessions/web/ui/useRepoSelectionContext";
import { useRepoSummaries } from "../useRepoSummaries";

const stackSx = { flexWrap: "wrap", gap: 1, mb: 2 } as const;

export function RepoSummaryChips() {
	const summaries = useRepoSummaries();
	const { setSelectedCwd } = useRepoSelectionContext();
	if (summaries.length === 0) return null;

	return (
		<Stack direction="row" sx={stackSx}>
			{summaries.map(({ origin, displayName, openCount, isCurrent, cwd }) => (
				<Chip
					key={origin}
					label={`${displayName} (${openCount})`}
					size="small"
					color={isCurrent ? "primary" : "default"}
					variant={isCurrent ? "filled" : "outlined"}
					disabled={!cwd}
					onClick={cwd ? () => setSelectedCwd(cwd) : undefined}
				/>
			))}
		</Stack>
	);
}
