import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import type { ReactNode } from "react";
import { InRepoGroupContext } from "./useInRepoGroupContext";
import { useTopBarLayoutContext } from "../../../../../../../../useTopBarLayoutContext";

const containerSx = { mb: 0.5 } as const;

const headerSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	px: "10px",
	pt: 1,
	pb: 0.5,
	bgcolor: "background.paper",
} as const;

const stickyHeaderSx = {
	...headerSx,
	position: "sticky",
	top: 0,
	zIndex: 1,
} as const;

const labelSx = {
	minWidth: 0,
	overflow: "hidden",
	textOverflow: "ellipsis",
	whiteSpace: "nowrap",
	color: "text.secondary",
} as const;

const caretSx = { color: "text.disabled", fontSize: "0.6rem" } as const;

const countSx = {
	color: "text.disabled",
	fontVariantNumeric: "tabular-nums",
} as const;

const ruleSx = { flex: 1, height: "1px", bgcolor: "divider" } as const;

const bodySx = { ml: "17px", borderLeft: 1, borderColor: "divider" } as const;

export function SessionGroupSection({
	label,
	count,
	children,
}: {
	label: string;
	count: number;
	children: ReactNode;
}) {
	const topBar = useTopBarLayoutContext();
	return (
		<Box sx={containerSx}>
			<Box sx={topBar ? stickyHeaderSx : headerSx}>
				<Typography variant="caption" sx={caretSx}>
					▾
				</Typography>
				<Typography variant="body2" title={label} sx={labelSx}>
					{label}
				</Typography>
				<Typography variant="caption" sx={countSx}>
					{count}
				</Typography>
				<Box sx={ruleSx} />
			</Box>
			<Box sx={bodySx}>
				<InRepoGroupContext.Provider value>
					{children}
				</InRepoGroupContext.Provider>
			</Box>
		</Box>
	);
}
