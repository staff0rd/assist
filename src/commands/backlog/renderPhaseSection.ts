import { differingDependsOn } from "./dependsOn/differingDependsOn";
import { formatDependsOn } from "./dependsOn/formatDependsOn";

type PhaseSection = {
	name: string;
	tasks: string[];
	manualChecks?: string[];
	dependsOn?: number[];
};

export function renderPhaseSection(phase: PhaseSection, idx: number): string {
	const parts = [
		`### Phase ${idx + 1}: ${phase.name}`,
		phase.tasks.map((task) => `- ${task}`).join("\n"),
	];

	const dependsOn = differingDependsOn(phase.dependsOn, idx + 1);
	if (dependsOn)
		parts.splice(1, 0, `**Depends on:** ${formatDependsOn(dependsOn)}`);

	const manualChecks = phase.manualChecks ?? [];
	if (manualChecks.length > 0)
		parts.push(
			"**Manual checks:**",
			manualChecks.map((check) => `- ${check}`).join("\n"),
		);

	return parts.join("\n\n");
}
