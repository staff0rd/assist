import SyncIcon from "@mui/icons-material/Sync";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import type { DocsRefreshState } from "../../../loadDocsRefreshState";
import { useCreateDocsRefresh } from "../useCreateDocsRefresh";
import { RefreshDocsPopover } from "./RefreshDocsPopover";
import { unsweptCountSx } from "./unsweptCountSx";

export function RefreshDocsMenu({
	stories,
	cwd,
	node,
}: {
	stories: DocsRefreshState["unswept"];
	cwd: string | undefined;
	node: string | undefined;
}) {
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const { creating, create } = useCreateDocsRefresh(cwd, node, () =>
		setAnchorEl(null),
	);
	const count = stories.length;
	return (
		<>
			<Button
				variant="outlined"
				size="small"
				startIcon={<SyncIcon />}
				disabled={count === 0}
				aria-haspopup="dialog"
				aria-expanded={Boolean(anchorEl)}
				onClick={(e) => setAnchorEl(e.currentTarget)}
			>
				Refresh docs
				{count > 0 && (
					<Box component="span" sx={unsweptCountSx}>
						{count}
					</Box>
				)}
			</Button>
			<RefreshDocsPopover
				anchorEl={anchorEl}
				stories={stories}
				cwd={cwd}
				node={node}
				creating={creating}
				onClose={() => setAnchorEl(null)}
				onCreate={create}
			/>
		</>
	);
}
