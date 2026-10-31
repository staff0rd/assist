import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { Fragment } from "react";
import type { ClientFailure } from "../../../../../../shared/ClientFailure";
import {
	clientFailuresHeaderSx,
	clientFailuresListSx,
	clientFailuresPanelSx,
} from "./clientFailuresBadgeSx";
import { describeClientFailure } from "./describeClientFailure";

export function ClientFailuresPanel({
	failures,
	onClear,
}: {
	failures: ClientFailure[];
	onClear: () => void;
}) {
	return (
		<Box sx={clientFailuresPanelSx} role="region" aria-label="Recent failures">
			<Box sx={clientFailuresHeaderSx}>
				<span>Recent failures ({failures.length})</span>
				<Button size="small" onClick={onClear}>
					Clear
				</Button>
			</Box>
			<Box sx={clientFailuresListSx}>
				{failures.map((failure, i) => {
					const row = describeClientFailure(failure);
					return (
						<Fragment key={`${failure.at}-${i}`}>
							<span className="muted">{row.time}</span>
							<span>{row.method}</span>
							<span title={row.path}>{row.path}</span>
							<span className="muted">{row.node}</span>
							<span className="outcome" title={row.outcome}>
								{row.outcome}
							</span>
							<span className="duration">{row.duration}</span>
						</Fragment>
					);
				})}
			</Box>
		</Box>
	);
}
