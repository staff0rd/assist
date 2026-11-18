import { Box, Stack, Typography } from "@mui/material";
import { BackButton } from "./BackButton";
import { HeaderActions, type HeaderContentProps } from "./HeaderActions";
import { ItemMeta } from "./ItemMeta";
import { sessionTextSize } from "../../../../sessions/web/ui/App/sessionTextSize";

const slateHeaderSx = {
	justifyContent: "space-between",
	alignItems: "flex-start",
	flexWrap: "wrap",
	gap: 1.5,
} as const;

const slateTitleBlockSx = { display: "grid", gap: "6px", minWidth: 0 } as const;

const slateTitleSx = {
	m: 0,
	fontSize: sessionTextSize(24),
	fontWeight: 600,
	lineHeight: 1.25,
	letterSpacing: "-0.015em",
} as const;

export function SlateHeaderContent({
	item,
	onDeleted,
	onStatusChange,
}: HeaderContentProps) {
	return (
		<Stack direction="row" sx={slateHeaderSx}>
			<Box sx={slateTitleBlockSx}>
				<BackButton to="/backlog" />
				<Typography component="h2" sx={slateTitleSx}>
					{item.name}
				</Typography>
				<ItemMeta item={item} onStatusChange={onStatusChange} />
			</Box>
			<HeaderActions item={item} onDeleted={onDeleted} />
		</Stack>
	);
}
