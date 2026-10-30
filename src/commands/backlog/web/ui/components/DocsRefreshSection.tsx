import { Box, Link, Stack, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { formatItemId } from "../../../formatItemId";
import { itemDetailPath } from "../itemDetailPath";
import type { LinkedItem } from "../types";
import { useRepoCwd } from "../useRepoCwd";
import { itemSectionAnchor } from "./itemSectionAnchor";
import { sectionHeadingSx } from "./sectionHeadingSx";
import { StatusIcon } from "./StatusIcon";

const idSx = {
	color: "text.secondary",
	mr: 1,
	fontFamily: "fontFamilyMono",
} as const;

export function DocsRefreshSection({ stories }: { stories: LinkedItem[] }) {
	const cwd = useRepoCwd();
	const node = useApiNode();
	if (stories.length === 0) return null;
	const sorted = stories.slice().sort((a, b) => a.id - b.id);
	return (
		<Box {...itemSectionAnchor("docsRefreshFor")}>
			<Typography variant="overline" sx={sectionHeadingSx}>
				Refreshes docs for
			</Typography>
			<Stack spacing={0.5}>
				{sorted.map((story) => (
					<Stack
						key={story.id}
						direction="row"
						spacing={1}
						sx={{ alignItems: "center" }}
					>
						<StatusIcon status={story.status} />
						<Typography variant="body2">
							<Box component="span" sx={idSx}>
								{formatItemId(story.id)}
							</Box>
							<Link
								component={RouterLink}
								to={itemDetailPath(story.id, cwd, node)}
							>
								{story.name}
							</Link>
						</Typography>
					</Stack>
				))}
			</Stack>
		</Box>
	);
}
