import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
	GroupCloseButton,
	groupCloseClassName,
} from "./GroupHeader/GroupCloseButton";
import { useTopBarLayoutContext } from "../../../../../../../useTopBarLayoutContext";

const headerSx = {
	display: "flex",
	alignItems: "center",
	gap: 1,
	px: "10px",
	pt: 1,
	pb: 0.5,
	bgcolor: "background.paper",
	[`&:hover .${groupCloseClassName}`]: { opacity: 1 },
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

export function GroupHeader({
	label,
	sessionIds,
	onDismiss,
}: {
	label: string;
	sessionIds: string[];
	onDismiss: (id: string) => void;
}) {
	const topBar = useTopBarLayoutContext();
	return (
		<Box sx={topBar ? stickyHeaderSx : headerSx}>
			<Typography variant="caption" sx={caretSx}>
				▾
			</Typography>
			<Typography variant="body2" title={label} sx={labelSx}>
				{label}
			</Typography>
			<Typography variant="caption" sx={countSx}>
				{sessionIds.length}
			</Typography>
			<Box sx={ruleSx} />
			<GroupCloseButton
				label={label}
				sessionIds={sessionIds}
				onDismiss={onDismiss}
			/>
		</Box>
	);
}
