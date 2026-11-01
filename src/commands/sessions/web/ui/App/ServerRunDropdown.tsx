import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import type { ServerRunInfo } from "../../handleServerRuns";
import { FilterTrigger } from "../FilterTrigger";

export function ServerRunDropdown({
	runs,
	onSelect,
}: {
	runs: ServerRunInfo[];
	onSelect: (runName: string, replace?: boolean) => void;
}) {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLDivElement>(null);
	const close = () => setOpen(false);

	return (
		<Paper
			ref={anchorRef}
			variant="outlined"
			sx={{ display: "inline-flex", border: "none" }}
		>
			<FilterTrigger
				label="server"
				open={open}
				onClick={() => setOpen(!open)}
			/>
			<Menu
				anchorEl={anchorRef.current}
				open={open}
				onClose={close}
				anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
				transformOrigin={{ vertical: "top", horizontal: "right" }}
				slotProps={{
					paper: { sx: { width: 200, maxHeight: 200 } },
					list: { dense: true, disablePadding: true },
				}}
			>
				{runs.map((run) => (
					<MenuItem
						key={run.name}
						onClick={(e) => {
							close();
							onSelect(run.name, e.shiftKey || undefined);
						}}
						sx={{ py: 0.75 }}
					>
						<Typography sx={{ fontSize: 13 }}>{run.name}</Typography>
					</MenuItem>
				))}
			</Menu>
		</Paper>
	);
}
