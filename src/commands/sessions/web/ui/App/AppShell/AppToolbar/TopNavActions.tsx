import Stack from "@mui/material/Stack";
import type { AssistLaunchMeta } from "../../../createSessionAction";
import { prLaunchMeta } from "../../prLaunchMeta";
import { ReviewDropdown } from "./TopNavActions/ReviewDropdown";
import { ServerRunMenu } from "./TopNavActions/ServerRunMenu";
import { useRepoSelectionContext } from "../../../useRepoSelectionContext";

export function TopNavActions({
	onCreateAssist,
	onStartRun,
}: {
	onCreateAssist: (
		args: string[],
		cwd?: string,
		meta?: AssistLaunchMeta,
	) => void;
	onStartRun: (
		runName: string,
		cwd: string,
		replace?: boolean,
		launchedFrom?: string,
		node?: string,
	) => void;
}) {
	const { selectedCwd, selectedNode } = useRepoSelectionContext();

	return (
		<Stack
			direction="row"
			spacing={0.5}
			sx={{ alignItems: "center", "&:not(:empty)": { ml: 2 } }}
		>
			<ReviewDropdown
				cwd={selectedCwd}
				disabled={!selectedCwd}
				onSelect={(pr, args) =>
					onCreateAssist([...args, String(pr.number)], selectedCwd, {
						...prLaunchMeta(pr),
						node: selectedNode,
					})
				}
			/>
			<ServerRunMenu
				onStartRun={(runName, cwd) =>
					onStartRun(runName, cwd, undefined, undefined, selectedNode)
				}
				cwd={selectedCwd}
			/>
		</Stack>
	);
}
