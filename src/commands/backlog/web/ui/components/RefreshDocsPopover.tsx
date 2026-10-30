import { Button, Popover, Stack, Typography } from "@mui/material";
import type { DocsRefreshState } from "../../../loadDocsRefreshState";
import { RefreshDocsStoryList } from "./RefreshDocsStoryList";

type RefreshDocsPopoverProps = {
	anchorEl: HTMLElement | null;
	stories: DocsRefreshState["unswept"];
	cwd: string | undefined;
	node: string | undefined;
	creating: boolean;
	onClose: () => void;
	onCreate: () => void;
};

const paperSx = { width: 380, maxWidth: "calc(100vw - 48px)" } as const;
const sectionSx = { px: 2, py: 1.5 } as const;
const footerSx = { ...sectionSx, justifyContent: "flex-end" } as const;
const titleSx = { fontWeight: 600 } as const;

export function RefreshDocsPopover({
	anchorEl,
	stories,
	cwd,
	node,
	creating,
	onClose,
	onCreate,
}: RefreshDocsPopoverProps) {
	const noun = stories.length === 1 ? "story" : "stories";
	return (
		<Popover
			anchorEl={anchorEl}
			open={Boolean(anchorEl)}
			onClose={onClose}
			anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
			transformOrigin={{ vertical: "top", horizontal: "right" }}
			slotProps={{ paper: { sx: paperSx } }}
		>
			<Stack sx={sectionSx}>
				<Typography sx={titleSx}>
					{`${stories.length} ${noun} pending docs`}
				</Typography>
				<Typography variant="body2" color="text.secondary">
					Done stories not covered by a Refresh docs item yet.
				</Typography>
			</Stack>
			<RefreshDocsStoryList
				stories={stories}
				cwd={cwd}
				node={node}
				onSelect={onClose}
			/>
			<Stack direction="row" sx={footerSx}>
				<Button
					variant="contained"
					size="small"
					disabled={creating}
					onClick={onCreate}
				>
					Create Refresh docs
				</Button>
			</Stack>
		</Popover>
	);
}
