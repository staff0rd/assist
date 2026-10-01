import Chip from "@mui/material/Chip";
import { isServing } from "../../../../../findServingSessions";
import { PortLink } from "../../../../../PortLink";
import type { SessionInfo } from "../../../../../../../types";

const chipSx = { height: 18, fontSize: "0.65rem" };

export function ServingChip({ session }: { session: SessionInfo }) {
	if (!isServing(session)) return null;
	const label = session.port ? (
		<>
			serving <PortLink port={session.port} />
		</>
	) : (
		"serving"
	);
	return <Chip label={label} color="success" size="small" sx={chipSx} />;
}
