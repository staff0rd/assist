import { Box, Button, Collapse, Typography } from "@mui/material";
import { useState } from "react";
import { InlineCode } from "./InlineCode";

export function WhatChanged({ changed }: { changed: string }) {
	const [open, setOpen] = useState(false);
	return (
		<Box>
			<Button
				size="small"
				color="inherit"
				aria-expanded={open}
				onClick={() => setOpen((value) => !value)}
				sx={{ color: "text.secondary", px: 0 }}
			>
				{open ? "▾" : "▸"} What changed
			</Button>
			<Collapse in={open}>
				<Typography variant="body2" sx={{ color: "text.secondary" }}>
					<InlineCode text={changed} />
				</Typography>
			</Collapse>
		</Box>
	);
}
