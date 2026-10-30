import SyncIcon from "@mui/icons-material/Sync";
import { Box, Button } from "@mui/material";
import { useState } from "react";
import { useApiNode } from "../../../../sessions/web/ui/useApiNode";
import { itemDetailPath } from "../itemDetailPath";
import { useCreateDocsRefresh } from "../useCreateDocsRefresh";
import { useDocsRefreshState } from "../useDocsRefreshState";
import { useRepoCwd } from "../useRepoCwd";
import { OpenRefreshDocsLink } from "./OpenRefreshDocsLink";
import { RefreshDocsPopover } from "./RefreshDocsPopover";
import { unsweptCountSx } from "./unsweptCountSx";

export function RefreshDocsButton({ revision }: { revision: unknown }) {
	const cwd = useRepoCwd();
	const node = useApiNode();
	const state = useDocsRefreshState(cwd, node, revision);
	const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
	const { creating, create } = useCreateDocsRefresh(cwd, node, () =>
		setAnchorEl(null),
	);
	if (!state) return null;
	if (state.openId !== undefined)
		return (
			<OpenRefreshDocsLink
				id={state.openId}
				to={itemDetailPath(state.openId, cwd, node)}
			/>
		);

	const count = state.unswept.length;
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
				stories={state.unswept}
				cwd={cwd}
				node={node}
				creating={creating}
				onClose={() => setAnchorEl(null)}
				onCreate={create}
			/>
		</>
	);
}
