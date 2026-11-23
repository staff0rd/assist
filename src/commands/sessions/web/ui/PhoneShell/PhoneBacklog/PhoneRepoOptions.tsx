import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { PhoneSheetItem } from "../PhoneActions/PhoneSheetItem";
import type { PhoneRepoChoice } from "./PhoneRepoChoice";

function matches(repo: PhoneRepoChoice, query: string): boolean {
	const q = query.trim().toLowerCase();
	return (
		!q ||
		repo.displayName.toLowerCase().includes(q) ||
		repo.origin.toLowerCase().includes(q)
	);
}

export function PhoneRepoOptions({
	repos,
	query,
	value,
	onPick,
}: {
	repos: PhoneRepoChoice[];
	query: string;
	value: string | undefined;
	onPick: (origin: string) => void;
}) {
	return (
		<Box sx={nodeListSx.group}>
			{repos
				.filter((repo) => matches(repo, query))
				.map((repo) => (
					<PhoneSheetItem
						key={repo.origin}
						label={repo.displayName}
						detail={repo.cwd}
						end={
							<>
								{repo.openCount}
								{repo.origin === value && (
									<CheckIcon sx={{ color: "primary.main" }} />
								)}
							</>
						}
						onClick={() => onPick(repo.origin)}
					/>
				))}
		</Box>
	);
}
