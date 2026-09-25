import { configScopeFiles } from "../../configScopeFiles";
import { configScopeLabels } from "../../configScopeLabels";
import type { ConfigScope } from "../../saveConfigValue";

type Options = {
	scope: ConfigScope;
	scopesWithValue: ConfigScope[];
	repoKey: string | undefined;
	globalConfigFile?: string;
	lockedToGlobal: boolean;
	selected: boolean;
};

function savedValueState(
	scope: ConfigScope,
	scopesWithValue: ConfigScope[],
): string {
	if (!scopesWithValue.includes(scope)) return "not currently set here";
	const effective = scopesWithValue[0];
	if (effective === scope) return "currently set here, in effect";
	return `currently set here, overridden by ${configScopeLabels[effective]}`;
}

export function configScopeToggleTitle({
	scope,
	scopesWithValue,
	repoKey,
	globalConfigFile,
	lockedToGlobal,
	selected,
}: Options): string {
	if (lockedToGlobal && scope !== "global") return "Global-only key";

	const where = configScopeFiles(repoKey, globalConfigFile)[scope];
	if (selected)
		return `This save will be written to ${where} — ${savedValueState(scope, scopesWithValue)}`;

	if (!scopesWithValue.includes(scope)) return `Not set in ${where}`;

	const effective = scopesWithValue[0];
	if (effective === scope) return `Set in ${where} — in effect`;
	return `Set in ${where} — overridden by ${configScopeLabels[effective]}`;
}
