import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import { Box, ButtonBase, Collapse, Typography } from "@mui/material";
import { useState } from "react";
import { InlineCode } from "./InlineCode";

export function WhatChanged({ changed }: { changed: string }) {
	const [open, setOpen] = useState(false);
	return (
		<Box>
			<ButtonBase
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
				sx={{ gap: 0.5, color: "text.secondary", borderRadius: 1 }}
			>
				<ChevronRightIcon
					fontSize="small"
					sx={{
						transform: open ? "rotate(90deg)" : "none",
						transition: "transform 0.15s",
					}}
				/>
				<Typography variant="overline" sx={{ letterSpacing: 1 }}>
					What changed
				</Typography>
			</ButtonBase>
			<Collapse in={open}>
				<Typography variant="body2" sx={{ color: "text.secondary", pl: 3 }}>
					<InlineCode text={changed} />
				</Typography>
			</Collapse>
		</Box>
	);
}
