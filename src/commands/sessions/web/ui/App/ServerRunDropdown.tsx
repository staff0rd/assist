import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import type { ServerRunInfo } from "../../handleServerRuns";
import { dropdownStyle, DropdownWrapper } from "../DropdownWrapper";

export function ServerRunDropdown({
	runs,
	onSelect,
}: {
	runs: ServerRunInfo[];
	onSelect: (runName: string) => void;
}) {
	return (
		<DropdownWrapper label="server">
			{(close) => (
				<Paper
					elevation={4}
					sx={{ ...dropdownStyle, left: "auto", width: 200 }}
				>
					<MenuList dense disablePadding>
						{runs.map((run) => (
							<MenuItem
								key={run.name}
								onMouseDown={(e) => e.preventDefault()}
								onClick={() => {
									onSelect(run.name);
									close();
								}}
								sx={{ py: 0.75 }}
							>
								<Typography sx={{ fontSize: 13 }}>{run.name}</Typography>
							</MenuItem>
						))}
					</MenuList>
				</Paper>
			)}
		</DropdownWrapper>
	);
}
