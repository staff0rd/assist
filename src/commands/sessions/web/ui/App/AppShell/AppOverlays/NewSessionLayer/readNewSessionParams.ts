import { type NewSessionMode, newSessionModes } from "./newSessionModes";

type NewSessionParams = {
	prefill: string | null;
	cwd: string | null;
	mode: NewSessionMode | undefined;
	node: string | null;
};

export const newSessionParamNames = ["new", "newCwd", "newMode", "newNode"];

function parseMode(value: string | null): NewSessionMode | undefined {
	return value && value in newSessionModes
		? (value as NewSessionMode)
		: undefined;
}

export function readNewSessionParams(
	searchParams: URLSearchParams,
): NewSessionParams {
	return {
		prefill: searchParams.get("new"),
		cwd: searchParams.get("newCwd"),
		mode: parseMode(searchParams.get("newMode")),
		node: searchParams.get("newNode"),
	};
}
