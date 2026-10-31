import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import { useState } from "react";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { PhoneSheetItem } from "../PhoneActions/PhoneSheetItem";
import { PhoneRepoSheet } from "./PhoneRepoSheet";
import type { PhoneBacklogRepo } from "./usePhoneBacklogRepos";

export function PhoneRepoSelect({
	repos,
	repo,
	onPick,
}: {
	repos: PhoneBacklogRepo[];
	repo: PhoneBacklogRepo | undefined;
	onPick: (origin: string) => void;
}) {
	const [open, setOpen] = useState(false);
	return (
		<>
			<Box sx={[nodeListSx.group, { flex: "none", mt: 0 }]}>
				<PhoneSheetItem
					label="Repo"
					detail={repo?.cwd}
					end={
						<>
							{repo?.displayName}
							<ChevronRightIcon fontSize="small" />
						</>
					}
					onClick={repos.length > 1 ? () => setOpen(true) : undefined}
				/>
			</Box>
			<PhoneRepoSheet
				open={open}
				repos={repos}
				value={repo?.origin}
				onPick={onPick}
				onClose={() => setOpen(false)}
			/>
		</>
	);
}
