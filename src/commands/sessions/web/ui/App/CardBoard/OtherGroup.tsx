import Box from "@mui/material/Box";
import { useState } from "react";
import type { BoardGroupProps } from "./BoardGroupProps";
import { boardGridSx } from "./boardGridSx";
import { OtherCard } from "./OtherCard";
import { OtherGroupToggle } from "./OtherGroupToggle";

export function OtherGroup({ sessions, openId, onOpen }: BoardGroupProps) {
	const [expanded, setExpanded] = useState(false);
	if (sessions.length === 0) return null;
	return (
		<Box
			component="section"
			aria-label="Other"
			sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}
		>
			<OtherGroupToggle
				count={sessions.length}
				expanded={expanded}
				onToggle={() => setExpanded((e) => !e)}
			/>
			{expanded && (
				<Box sx={boardGridSx}>
					{sessions.map((s) => (
						<OtherCard
							key={s.id}
							session={s}
							selected={s.id === openId}
							onOpen={() => onOpen(s.id)}
						/>
					))}
				</Box>
			)}
		</Box>
	);
}
