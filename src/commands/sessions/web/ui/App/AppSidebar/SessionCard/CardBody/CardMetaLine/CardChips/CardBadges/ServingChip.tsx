import Box from "@mui/material/Box";
import { tokenBadgeSx } from "../../../../../../../designSystem/tokenBadgeSx";
import { isServing } from "../../../../../findServingSessions";
import { PortLink } from "../../../../../PortLink";
import type { SessionInfo } from "../../../../../../../types";

const sx = tokenBadgeSx("success");

export function ServingChip({ session }: { session: SessionInfo }) {
	if (!isServing(session)) return null;
	return (
		<Box component="span" sx={sx}>
			{session.port ? (
				<PortLink port={session.port} node={session.node} />
			) : (
				"serving"
			)}
		</Box>
	);
}
