import { Stack } from "@mui/material";
import type { ReactNode } from "react";
import type { HighLevelCheckResult } from "../../../../../../../review/highLevel/types";
import { HighLevelCheckGroup } from "./HighLevelChecklistBody/HighLevelCheckGroup";
import type { useHighLevelChecklist } from "./useHighLevelChecklist";

export function HighLevelChecklistBody({
	checks,
	checklist,
	details,
}: {
	checks: HighLevelCheckResult[];
	checklist: ReturnType<typeof useHighLevelChecklist>;
	details: Record<string, ReactNode>;
}) {
	return (
		<Stack spacing={2} sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 2 }}>
			<HighLevelCheckGroup
				heading="Evaluated for you"
				checks={checks.filter((check) => check.kind === "deterministic")}
				checklist={checklist}
				details={details}
			/>
			<HighLevelCheckGroup
				heading="Yours to judge"
				checks={checks.filter((check) => check.kind === "manual")}
				checklist={checklist}
				details={details}
			/>
		</Stack>
	);
}
