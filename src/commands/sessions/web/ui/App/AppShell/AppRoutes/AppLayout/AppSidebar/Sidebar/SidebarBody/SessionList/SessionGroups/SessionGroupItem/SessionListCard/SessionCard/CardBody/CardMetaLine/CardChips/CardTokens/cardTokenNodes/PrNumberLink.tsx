import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import type { SessionInfo } from "../../../../../../../../../../../../../../../../../types";
import { usePrStatus } from "../../../../../../../../../../../../../../usePrStatus";

const sx = {
	color: "primary.main",
	opacity: 0.85,
	whiteSpace: "nowrap",
} as const;

export function PrNumberLink({
	session,
	prNumber,
}: {
	session: SessionInfo;
	prNumber: number;
}) {
	const pr = usePrStatus(session.cwd, prNumber, session.status);
	const label = `#${prNumber}`;

	if (!pr?.url)
		return (
			<Box component="span" sx={{ whiteSpace: "nowrap" }}>
				{label}
			</Box>
		);

	return (
		<Link
			href={pr.url}
			target="_blank"
			rel="noopener noreferrer"
			underline="hover"
			sx={sx}
			onMouseDown={(e) => e.stopPropagation()}
			onClick={(e) => e.stopPropagation()}
		>
			{label}
		</Link>
	);
}
