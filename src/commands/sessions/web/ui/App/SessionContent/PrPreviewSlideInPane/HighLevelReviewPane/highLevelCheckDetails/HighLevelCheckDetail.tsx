import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { Box, Button, Collapse } from "@mui/material";
import type { ReactNode } from "react";
import { useState } from "react";

export function HighLevelCheckDetail({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	const [open, setOpen] = useState(true);
	return (
		<Box sx={{ mt: 0.75, minWidth: 0 }}>
			<Button
				size="small"
				onClick={() => setOpen(!open)}
				startIcon={open ? <ExpandLessIcon /> : <ExpandMoreIcon />}
				sx={{ textTransform: "none", fontSize: 12, py: 0, minWidth: 0 }}
			>
				{label}
			</Button>
			<Collapse in={open}>
				<Box sx={{ mt: 0.5, minWidth: 0 }}>{children}</Box>
			</Collapse>
		</Box>
	);
}
