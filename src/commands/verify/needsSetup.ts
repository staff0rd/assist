type ToolStatus = {
	hasPackage: boolean;
	hasScript: boolean;
	isOutdated: boolean;
};

export function needsSetup(status: ToolStatus): boolean {
	return !status.hasScript || !status.hasPackage || status.isOutdated;
}

export function getStatusLabel(status: ToolStatus): string {
	if (status.isOutdated) return " (outdated)";
	if (!status.hasScript) return "";
	if (!status.hasPackage) return " (package missing)";
	return "";
}
