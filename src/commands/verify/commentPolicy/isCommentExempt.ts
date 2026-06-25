import { MAINTAINABILITY_OVERRIDE_MARKER } from "../../complexity/maintainability/parseMaintainabilityOverride";

const MACHINE_DIRECTIVES = [
	"oxlint-disable",
	"oxlint-enable",
	"@ts-expect-error",
	"@ts-ignore",
	"@ts-nocheck",
	"eslint-disable",
	"eslint-enable",
	"prettier-ignore",
	"istanbul ignore",
	"v8 ignore",
	"c8 ignore",
	"@vitest-environment",
	MAINTAINABILITY_OVERRIDE_MARKER,
];

export function isCommentExempt(text: string, markers: string[]): boolean {
	const lower = text.toLowerCase();
	if (MACHINE_DIRECTIVES.some((d) => lower.includes(d))) return true;
	return markers.some((m) => lower.includes(m.toLowerCase()));
}
