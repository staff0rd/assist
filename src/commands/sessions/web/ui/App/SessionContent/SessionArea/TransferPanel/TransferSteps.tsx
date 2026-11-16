import { keyframes } from "@emotion/react";
import Box from "@mui/material/Box";
import type { SessionTransferStage } from "../../../../../../shared/SessionInfoBase";

const spin = keyframes`
	to { transform: rotate(360deg); }
`;

type StepState = "done" | "now" | "todo";

const listSx = {
	listStyle: "none",
	m: 0,
	mt: 0.5,
	p: 0,
	display: "grid",
	gap: 0.75,
	fontSize: "0.8125rem",
	textAlign: "left",
} as const;

const stepSx: Record<StepState, object> = {
	done: { color: "text.secondary" },
	now: { color: "text.primary", fontWeight: 500 },
	todo: { color: "text.disabled" },
};

const dotBase = {
	width: 14,
	height: 14,
	borderRadius: "50%",
	border: 1.5,
	borderColor: "currentColor",
	flex: "none",
	boxSizing: "border-box",
} as const;

const dotSx: Record<StepState, object> = {
	done: { ...dotBase, bgcolor: "success.main", borderColor: "success.main" },
	now: {
		...dotBase,
		borderColor: "primary.main",
		borderTopColor: "transparent",
		animation: `${spin} 0.9s linear infinite`,
		"@media (prefers-reduced-motion: reduce)": { animation: "none" },
	},
	todo: dotBase,
};

function stepStates(stage: SessionTransferStage): [StepState, StepState] {
	return stage === "launching" ? ["done", "now"] : ["now", "todo"];
}

export function TransferSteps({
	stage,
	target,
}: {
	stage: SessionTransferStage;
	target: string;
}) {
	const labels = ["Snapshot worktree", `Launch on ${target}`];
	const states = stepStates(stage);
	return (
		<Box component="ul" sx={listSx}>
			{labels.map((label, i) => (
				<Box
					component="li"
					key={label}
					data-step-state={states[i]}
					sx={{
						display: "flex",
						alignItems: "center",
						gap: 1,
						...stepSx[states[i]],
					}}
				>
					<Box component="span" sx={dotSx[states[i]]} />
					{label}
				</Box>
			))}
		</Box>
	);
}
