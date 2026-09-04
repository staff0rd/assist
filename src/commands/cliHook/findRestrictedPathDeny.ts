type HookDecision = {
	permissionDecision: "allow" | "deny";
	permissionDecisionReason: string;
};

const RESTRICTED_PATHS = [".assist/restricted"];

function restrictedPathRegex(path: string): RegExp {
	const pattern = path
		.split("/")
		.map((segment) => segment.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`))
		.join(String.raw`[/\\]`);
	return new RegExp(pattern);
}

const RESTRICTED_PATH_RULES = RESTRICTED_PATHS.map((path) => ({
	path,
	regex: restrictedPathRegex(path),
}));

export function findRestrictedPathDenyRaw(
	rawCommand: string,
): HookDecision | undefined {
	const rule = RESTRICTED_PATH_RULES.find(({ regex }) =>
		regex.test(rawCommand),
	);
	if (!rule) return undefined;

	return {
		permissionDecision: "deny",
		permissionDecisionReason: `Do not read '~/${rule.path}'. The directory is off limits to every tool and command, and no settings allow entry, config rule or allowed read binary overrides that.`,
	};
}

export function findRestrictedPathDeny(
	parts: string[],
): HookDecision | undefined {
	for (const part of parts) {
		const decision = findRestrictedPathDenyRaw(part);
		if (decision) return decision;
	}
	return undefined;
}
