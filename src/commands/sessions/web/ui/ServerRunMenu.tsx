import MenuItem from "@mui/material/MenuItem";
import MenuList from "@mui/material/MenuList";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { dropdownStyle, DropdownWrapper } from "./DropdownWrapper";
import { useServerRuns } from "./useServerRuns";

export function ServerRunMenu({
	onStartRun,
	cwd,
}: {
	onStartRun: (runName: string, cwd: string) => void;
	cwd: string | undefined;
}) {
	const runs = useServerRuns(cwd);

	if (!cwd || runs.length === 0) {
		return null;
	}

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
									onStartRun(run.name, cwd);
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
