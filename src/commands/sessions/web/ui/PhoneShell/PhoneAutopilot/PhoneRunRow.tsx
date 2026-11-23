import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useState } from "react";
import type { AutopilotTick } from "../../../../daemon/autopilot/AutopilotRecord";
import { runItemsText } from "../../App/AppShell/AppRoutes/AutopilotView/runItemsText";
import { runSpan } from "../../App/AppShell/AppRoutes/AutopilotView/runSpan";
import { runSummaryLabels } from "../../App/AppShell/AppRoutes/AutopilotView/runSummaryLabels";
import { phoneRunSx as sx } from "./phoneRunSx";

export function PhoneRunRow({ run }: { run: AutopilotTick }) {
	const [open, setOpen] = useState(false);
	const { summary } = run;
	const sub = [runItemsText(run), run.reason, !summary && "no summary recorded"]
		.filter(Boolean)
		.join(" · ");
	return (
		<Box sx={sx.run} data-testid="phone-autopilot-run">
			<ButtonBase
				sx={sx.summary}
				aria-expanded={open}
				onClick={() => setOpen(!open)}
			>
				<Box component="span" sx={sx.when}>
					{runSpan(run)}
				</Box>
				<Box component="span" sx={sx.sub}>
					{sub}
				</Box>
				<ChevronRightIcon fontSize="small" sx={sx.twisty(open)} />
			</ButtonBase>
			{open && (
				<Box component="dl" sx={sx.fields}>
					{summary ? (
						runSummaryLabels.map(([key, label]) => (
							<Box key={key} sx={{ display: "contents" }}>
								<dt>{label}</dt>
								<dd>{summary[key]}</dd>
							</Box>
						))
					) : (
						<>
							<dt>—</dt>
							<dd>The run recorded no summary.</dd>
						</>
					)}
				</Box>
			)}
		</Box>
	);
}
