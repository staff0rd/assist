import type { DiffPhase } from "./types";

export function sameList(a: string[], b: string[]): boolean {
	return a.length === b.length && a.every((value, idx) => value === b[idx]);
}

export function isIdenticalPhase(a: DiffPhase, b: DiffPhase): boolean {
	return (
		a.name === b.name &&
		sameList(a.tasks, b.tasks) &&
		sameList(a.manualChecks, b.manualChecks) &&
		JSON.stringify(a.dependsOn) === JSON.stringify(b.dependsOn)
	);
}

export function matchStoredPhases(
	payload: DiffPhase[],
	stored: DiffPhase[],
): (number | undefined)[] {
	const taken = new Set<number>();
	const matches: (number | undefined)[] = payload.map(() => undefined);

	const claim = (
		payloadIdx: number,
		isCandidate: (candidate: DiffPhase) => boolean,
	): void => {
		if (matches[payloadIdx] !== undefined) return;
		const storedIdx = stored.findIndex(
			(candidate, idx) => !taken.has(idx) && isCandidate(candidate),
		);
		if (storedIdx === -1) return;
		taken.add(storedIdx);
		matches[payloadIdx] = storedIdx;
	};

	payload.forEach((phase, idx) =>
		claim(idx, (candidate) => candidate.name === phase.name),
	);
	payload.forEach((phase, idx) =>
		claim(idx, (candidate) => sameList(candidate.tasks, phase.tasks)),
	);

	return matches;
}
