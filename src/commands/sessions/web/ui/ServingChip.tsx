import Chip from "@mui/material/Chip";
import type { SessionInfo } from "./types";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function ServingChip({ session }: { session: SessionInfo }) {
	const live = session.status !== "done" && session.status !== "error";
	if (session.commandType !== "run" || !session.server || !live) return null;
	const label = session.port ? `serving :${session.port}` : "serving";
	return <Chip label={label} color="success" size="small" sx={chipSx} />;
}
