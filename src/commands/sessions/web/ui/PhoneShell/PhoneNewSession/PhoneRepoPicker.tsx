import CheckIcon from "@mui/icons-material/Check";
import Box from "@mui/material/Box";
import { useState } from "react";
import { filterReposByName } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionDialog/NewSessionFields/RepoCombobox/useRepoCombobox/filterReposByName";
import { repoLabel } from "../../App/repoLabel";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { PhoneSheetItem } from "../PhoneActions/PhoneSheetItem";
import { PhoneSearchField } from "../PhoneSearchField";

export function PhoneRepoPicker({
	repos,
	value,
	onPick,
}: {
	repos: string[];
	value: string;
	onPick: (cwd: string) => void;
}) {
	const [query, setQuery] = useState("");
	const filtered = filterReposByName(repos, query);
	return (
		<>
			<PhoneSearchField
				value={query}
				onChange={setQuery}
				placeholder="Filter repos"
			/>
			<Box sx={nodeListSx.group}>
				{filtered.map((cwd) => (
					<PhoneSheetItem
						key={cwd}
						label={repoLabel(cwd) || cwd}
						detail={cwd}
						end={cwd === value && <CheckIcon sx={{ color: "primary.main" }} />}
						onClick={() => onPick(cwd)}
					/>
				))}
			</Box>
		</>
	);
}
