import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { useState } from "react";
import type {
	PhaseStatus,
	PlanPhase,
} from "../../../../../backlog/web/ui/types";
import { PhonePhaseList, phaseDetailSx } from "./PhonePhaseList";
import {
	phaseGlyph,
	phaseGlyphSx,
	phaseNameSx,
	phonePhaseRowSx,
} from "./phonePhaseRowSx";
import { phaseRowDetail } from "./phaseRowDetail";

export function PhonePhaseRow({
	phase,
	index,
	status,
}: {
	phase: PlanPhase;
	index: number;
	status: PhaseStatus;
}) {
	const [open, setOpen] = useState(false);
	return (
		<ButtonBase
			component="div"
			role="button"
			aria-expanded={open}
			sx={phonePhaseRowSx(status)}
			onClick={() => setOpen((v) => !v)}
		>
			<Box sx={phaseGlyphSx(status)}>{phaseGlyph[status]}</Box>
			<Box sx={phaseNameSx}>{phase.name}</Box>
			<Box sx={phaseDetailSx}>{phaseRowDetail(phase, index, status)}</Box>
			{open && (
				<>
					<PhonePhaseList
						title="Tasks"
						lines={phase.tasks.map((t) => t.task)}
					/>
					<PhonePhaseList
						title="Manual checks"
						lines={phase.manualChecks ?? []}
					/>
				</>
			)}
		</ButtonBase>
	);
}
