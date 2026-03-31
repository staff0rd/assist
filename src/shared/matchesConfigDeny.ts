import { loadConfig } from "./loadConfig";

type ConfigDenyMatch = {
	pattern: string;
	message: string;
};

/**
 * Check whether a single (non-compound) command matches any deny rule
 * from assist.yml config using prefix matching.
 * Returns the matching deny rule or undefined.
 */
export function matchesConfigDeny(
	command: string,
): ConfigDenyMatch | undefined {
	const config = loadConfig();
	if (!config.deny) return undefined;

	return config.deny.find(
		(rule) =>
			command === rule.pattern || command.startsWith(`${rule.pattern} `),
	);
}
