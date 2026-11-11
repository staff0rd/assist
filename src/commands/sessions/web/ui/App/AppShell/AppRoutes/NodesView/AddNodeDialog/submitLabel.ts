import type { AddNodeStep } from "./FoundNode";

export function submitLabel(step: AddNodeStep): string {
	switch (step.kind) {
		case "idle":
			return "Check";
		case "checking":
			return "Checking…";
		case "found":
			return `Link ${step.node.name}`;
		case "linking":
			return `Linking ${step.node.name}…`;
	}
}
