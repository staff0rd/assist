import Stack from "@mui/material/Stack";
import type { AssistLaunchMeta } from "../../../createSessionAction";
import { NewSessionButton } from "./TopNavActions/NewSessionButton";
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
	onStartRun: (runName: string, cwd: string) => void;
}) {
	const { selectedCwd } = useRepoSelectionContext();

	return (
		<Stack direction="row" spacing={0.5} sx={{ alignItems: "center" }}>
			<NewSessionButton />
			<ReviewDropdown
				cwd={selectedCwd}
				disabled={!selectedCwd}
				onSelect={(pr, args) =>
					onCreateAssist(
						[...args, String(pr.number)],
						selectedCwd,
						prLaunchMeta(pr),
					)
				}
			/>
			<ServerRunMenu onStartRun={onStartRun} cwd={selectedCwd} />
		</Stack>
	);
}
