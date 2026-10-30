import CheckIcon from "@mui/icons-material/Check";
import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import InputBase from "@mui/material/InputBase";
import { useState } from "react";
import { filterReposByName } from "../../App/AppShell/AppOverlays/NewSessionLayer/NewSessionDialog/NewSessionFields/RepoCombobox/useRepoCombobox/filterReposByName";
import { repoLabel } from "../../App/repoLabel";
import { raisedBgcolor } from "../../designSystem/raisedBgcolor";
import { nodeListSx } from "../../HomeNodeGate/nodeListSx";
import { PhoneSheetItem } from "../PhoneActions/PhoneSheetItem";

const searchSx = {
	mx: 2,
	mb: 0.75,
	height: 38,
	px: 1.25,
	gap: 1,
	borderRadius: "10px",
	bgcolor: raisedBgcolor,
	fontSize: 16,
} as const;

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
			<InputBase
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				placeholder="Filter repos"
				startAdornment={<SearchIcon fontSize="small" color="disabled" />}
				sx={searchSx}
				inputProps={{ "aria-label": "Filter repos" }}
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
