import { classifyLogLine } from "./classifyLogLine";
import type { LogRules } from "./LogRules";
import type { StepError } from "./StepError";

type StepWindow = { step: number; start: number; end?: number };

export type StepErrorLog = {
	startStep(step: number, at?: number): void;
	endStep(at?: number): void;
	record(source: string, message: string, at?: number): void;
	errorsFor(step: number): StepError[];
	readonly ignored: number;
};

export function createStepErrorLog(
	rulesFor: (source: string) => LogRules,
	now: () => number = Date.now,
): StepErrorLog {
	const windows: StepWindow[] = [];
	const errors = new Map<number, StepError[]>();
	let ignored = 0;
	const open = () => windows.find((window) => window.end === undefined);
	const stepAt = (at: number) =>
		windows.find(
			(window) =>
				at >= window.start && (window.end === undefined || at < window.end),
		)?.step;
	return {
		startStep(step, at = now()) {
			const current = open();
			if (current) current.end = at;
			windows.push({ step, start: at });
		},
		endStep(at = now()) {
			const current = open();
			if (current) current.end = at;
		},
		record(source, message, at = now()) {
			const step = stepAt(at);
			if (step === undefined) return;
			const kind = classifyLogLine(message, rulesFor(source));
			if (kind === "ignored") ignored++;
			if (kind !== "error") return;
			const entry = { source, message, at: new Date(at).toISOString() };
			errors.set(step, [...(errors.get(step) ?? []), entry]);
		},
		errorsFor: (step) => errors.get(step) ?? [],
		get ignored() {
			return ignored;
		},
	};
}
