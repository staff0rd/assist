import { Box, Link } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { formatItemId } from "../../../formatItemId";
import type { DocsRefreshState } from "../../../loadDocsRefreshState";
import { itemDetailPath } from "../itemDetailPath";

const listSx = {
	listStyle: "none",
	m: 0,
	py: 0.5,
	px: 0,
	maxHeight: 240,
	overflow: "auto",
	borderBlock: 1,
	borderColor: "divider",
} as const;
const rowSx = {
	display: "flex",
	gap: 1,
	px: 2,
	py: 0.75,
	color: "text.primary",
	"&:hover": { bgcolor: "action.hover" },
} as const;
const idSx = {
	fontFamily: "fontFamilyMono",
	color: "text.disabled",
	flexShrink: 0,
} as const;
const nameSx = {
	whiteSpace: "nowrap",
	overflow: "hidden",
	textOverflow: "ellipsis",
} as const;

export function RefreshDocsStoryList({
	stories,
	cwd,
	node,
	onSelect,
}: {
	stories: DocsRefreshState["unswept"];
	cwd: string | undefined;
	node: string | undefined;
	onSelect: () => void;
}) {
	return (
		<Box component="ul" sx={listSx}>
			{stories.map((story) => (
				<li key={story.id}>
					<Link
						component={RouterLink}
						to={itemDetailPath(story.id, cwd, node)}
						underline="none"
						sx={rowSx}
						onClick={onSelect}
					>
						<Box component="span" sx={idSx}>
							{formatItemId(story.id)}
						</Box>
						<Box component="span" sx={nameSx} title={story.name}>
							{story.name}
						</Box>
					</Link>
				</li>
			))}
		</Box>
	);
}
