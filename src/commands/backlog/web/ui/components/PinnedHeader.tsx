import { Box, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material";
import type { BacklogItem } from "../types";
import { BackButton } from "./BackButton";
import { canPlay } from "./canPlay";
import { DeleteAction } from "./DeleteAction";
import { ItemMeta } from "./ItemMeta";
import { PlayAction } from "./PlayAction";
import { RefineAction } from "./RefineAction";
import { useStuckSentinel } from "./useStuckSentinel";

const headerSx = {
	justifyContent: "space-between",
	alignItems: "center",
	mb: 2,
} as const;

function stuckShadow(theme: Theme) {
	return theme.palette.mode === "dark"
		? "0 8px 8px -9px rgba(0, 0, 0, 0.8)"
		: "0 6px 6px -7px rgba(0, 0, 0, 0.2)";
}

function pinnedSx(stuck: boolean): SxProps<Theme> {
	return (theme) => ({
		position: "sticky",
		top: 0,
		zIndex: 1,
		bgcolor: "background.default",
		mx: -2,
		px: 2,
		pb: 2,
		borderBottom: 1,
		borderColor: "divider",
		boxShadow: stuck ? stuckShadow(theme) : "none",
		transition: theme.transitions.create("box-shadow"),
	});
}

export function PinnedHeader({
	item,
	onDeleted,
	onStatusChange,
}: {
	item: BacklogItem;
	onDeleted: () => Promise<void>;
	onStatusChange: (status: BacklogItem["status"]) => void;
}) {
	const { sentinelRef, stuck } = useStuckSentinel();
	return (
		<>
			<Box ref={sentinelRef} sx={{ height: 0 }} />
			<Box sx={pinnedSx(stuck)}>
				<Stack direction="row" sx={headerSx}>
					<BackButton to="/backlog" />
					<Stack direction="row" spacing={1}>
						{canPlay(item) && <PlayAction itemId={item.id} />}
						<RefineAction itemId={item.id} />
						<DeleteAction itemId={item.id} onDeleted={onDeleted} />
					</Stack>
				</Stack>
				<Typography variant="h5" component="h2">
					{item.name}
				</Typography>
				<ItemMeta item={item} onStatusChange={onStatusChange} />
			</Box>
		</>
	);
}
