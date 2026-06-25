export const MAINTAINABILITY_OVERRIDE_MARKER =
	"assist-maintainability-override";

const OVERRIDE_MARKER =
	/^\s*\/\/\s*assist-maintainability-override:?\s*(-?\d+)\s*$/;

export function parseMaintainabilityOverride(
	content: string,
): number | undefined {
	const lines = content.split("\n").slice(0, 10);

	for (const line of lines) {
		const match = line.match(OVERRIDE_MARKER);
		if (!match) continue;

		const value = Number(match[1]);
		if (Number.isInteger(value) && value >= 0 && value <= 100) {
			return value;
		}
		return undefined;
	}

	return undefined;
}
