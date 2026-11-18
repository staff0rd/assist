import Box from "@mui/material/Box";
import { useState } from "react";
import type { SessionInfo } from "../../types";
import { useNowSeconds } from "../useNowSeconds";
import { boardGridSx } from "./boardGridSx";
import { OtherCard } from "./OtherCard";
import { OtherGroupToggle } from "./OtherGroupToggle";

export function OtherGroup({
	sessions,
	openId,
	compact,
	onOpen,
}: {
	sessions: SessionInfo[];
	openId: string | undefined;
	compact: boolean;
	onOpen: (id: string) => void;
}) {
	const [expanded, setExpanded] = useState(false);
	const nowMs = useNowSeconds(30_000) * 1000;
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
				<Box sx={boardGridSx(compact)}>
					{sessions.map((s) => (
						<OtherCard
							key={s.id}
							session={s}
							nowMs={nowMs}
							selected={s.id === openId}
							compact={compact}
							onOpen={() => onOpen(s.id)}
						/>
					))}
				</Box>
			)}
		</Box>
	);
}
