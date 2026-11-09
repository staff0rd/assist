export function buildSlashCommand(
	slashCommand: string,
	description?: string,
): string {
	const trimmed = description?.trim();
	return trimmed ? `/${slashCommand} ${trimmed}` : `/${slashCommand}`;
}
