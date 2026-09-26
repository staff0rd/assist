import { useEffect, useRef } from "react";
import { findRepo, type MergedRepo } from "./mergeRepos";

export function useRetargetOnMachineChange(
	machine: string,
	merged: MergedRepo[],
	cwd: string,
	select: (cwd: string, node?: string) => void,
): void {
	const lastMachine = useRef(machine);
	useEffect(() => {
		if (lastMachine.current === machine) return;
		lastMachine.current = machine;
		const clone = findRepo(merged, cwd)?.clones[machine];
		if (clone) select(clone, machine);
	}, [machine, merged, cwd, select]);
}
