import Box from "@mui/material/Box";
import { phaseStatus } from "../../../../../backlog/web/ui/components/sessionsByPhase";
import type { BacklogItem } from "../../../../../backlog/web/ui/types";
import { PhoneSectionHeader } from "../PhoneSectionHeader";
import type { BacklogItemScope } from "./backlogItemPath";
import { PhoneItemChips } from "./PhoneItemChips";
import { PhoneItemPages } from "./PhoneItemPages";
import { PhonePhaseRow } from "./PhonePhaseRow";

const bodySx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
	WebkitOverflowScrolling: "touch",
	pb: 2,
} as const;

const titleSx = {
	px: 2,
	pt: 0.5,
	fontSize: 22,
	lineHeight: 1.2,
	fontWeight: 700,
	letterSpacing: "-0.01em",
} as const;

export function PhoneItemBody({
	item,
	scope,
}: {
	item: BacklogItem;
	scope: BacklogItemScope;
}) {
	const phases = item.plan ?? [];
	return (
		<Box sx={bodySx}>
			<Box sx={titleSx}>{item.name}</Box>
			<PhoneItemChips item={item} node={scope.node} />
			{phases.length > 0 && (
				<PhoneSectionHeader label="Plan" count={phases.length} />
			)}
			{phases.map((phase, i) => (
				<PhonePhaseRow
					key={phase.name}
					phase={phase}
					index={i}
					status={phaseStatus(i, item.currentPhase)}
				/>
			))}
			<PhoneItemPages item={item} scope={scope} />
		</Box>
	);
}
