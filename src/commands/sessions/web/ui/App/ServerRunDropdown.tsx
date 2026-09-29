import Box from "@mui/material/Box";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { useRef, useState } from "react";
import type { ServerRunInfo } from "../../handleServerRuns";
import { FilterTrigger } from "../FilterTrigger";

export function ServerRunDropdown({
	runs,
	onSelect,
}: {
	runs: ServerRunInfo[];
	onSelect: (runName: string) => void;
}) {
	const [open, setOpen] = useState(false);
	const anchorRef = useRef<HTMLDivElement>(null);
	const close = () => setOpen(false);

	return (
		<Box ref={anchorRef} sx={{ display: "inline-flex" }}>
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
						onClick={() => {
							close();
							onSelect(run.name);
						}}
						sx={{ py: 0.75 }}
					>
						<Typography sx={{ fontSize: 13 }}>{run.name}</Typography>
					</MenuItem>
				))}
			</Menu>
		</Box>
	);
}
