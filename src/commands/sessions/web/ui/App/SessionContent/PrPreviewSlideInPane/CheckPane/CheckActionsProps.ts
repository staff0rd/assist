import type {
	CheckResult,
	LaterPhase,
} from "../../../../../../shared/askCheckInputSchema";

export type CheckActionsProps = {
	laterPhases: LaterPhase[];
	onResult: (result: CheckResult, note: string, phase?: number) => void;
	onDismiss: (note: string) => void;
};
