import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import { ScanActivityRow } from "./ScanActivityPanel/ScanActivityRow";
import { ScanActivitySummary } from "./ScanActivityPanel/ScanActivitySummary";
import { useAutoOpen } from "./ScanActivityPanel/useAutoOpen";
import type { InboxScanRun } from "./types";
import { useInboxStatus } from "./useInboxStatus";

const panelSx = {
	bgcolor: "background.paper",
	borderRadius: 2,
	mb: 3,
} as const;

function RunPanel({ run }: { run: InboxScanRun }) {
	const [open, setOpen] = useAutoOpen(run);
	return (
		<Box sx={panelSx}>
			<ScanActivitySummary
				run={run}
				open={open}
				onToggle={() => setOpen(!open)}
			/>
			<Collapse in={open} unmountOnExit>
				<Box sx={{ px: 2, pb: 1.5, maxHeight: 360, overflowY: "auto" }}>
					{run.events.length === 0 ? (
						<Typography variant="caption" color="text.secondary">
							Waiting for the first tool call…
						</Typography>
					) : (
						run.events.map((event, index) => (
							<ScanActivityRow
								key={`${event.at}-${index}`}
								event={event}
								startedAt={run.startedAt}
							/>
						))
					)}
				</Box>
			</Collapse>
		</Box>
	);
}

export function ScanActivityPanel() {
	const run = useInboxStatus()?.run;
	return run ? <RunPanel run={run} /> : null;
}
