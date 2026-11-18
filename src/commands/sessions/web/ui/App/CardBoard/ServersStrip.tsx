import Box from "@mui/material/Box";
import type { SessionInfo } from "../../types";
import { ServerPill } from "./ServerPill";

export function ServersStrip({
	sessions,
	openId,
	onOpen,
}: {
	sessions: SessionInfo[];
	openId: string | undefined;
	onOpen: (id: string) => void;
}) {
	if (sessions.length === 0) return null;
	return (
		<Box
			component="section"
			aria-label="Servers"
			sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}
		>
			<Box
				component="h2"
				sx={{
					m: 0,
					mr: 0.5,
					typography: "caption",
					fontWeight: 600,
					letterSpacing: "0.06em",
					textTransform: "uppercase",
					color: "text.secondary",
				}}
			>
				Servers
			</Box>
			{sessions.map((s) => (
				<ServerPill
					key={s.id}
					session={s}
					selected={s.id === openId}
					onOpen={() => onOpen(s.id)}
				/>
			))}
		</Box>
	);
}
