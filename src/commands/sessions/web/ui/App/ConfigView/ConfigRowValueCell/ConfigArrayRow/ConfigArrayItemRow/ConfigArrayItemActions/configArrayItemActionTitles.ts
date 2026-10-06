import { configScopeFiles } from "../../../configScopeFiles";
import type { ConfigScope } from "../../../saveConfigValue";

type Options = {
	label: string;
	ownerScope: ConfigScope | undefined;
	repoKey: string | undefined;
	globalConfigFile?: string;
	canMoveUp: boolean;
	canMoveDown: boolean;
};

type ConfigArrayItemActionTitles = {
	duplicate: string;
	moveUp: string;
	moveDown: string;
	remove: string;
};

export function configArrayItemActionTitles({
	label,
	ownerScope,
	repoKey,
	globalConfigFile,
	canMoveUp,
	canMoveDown,
}: Options): ConfigArrayItemActionTitles {
	if (ownerScope === undefined) {
		const unowned = `${label} comes from the schema default — it is not set in any file yet`;
		return {
			duplicate: `Duplicate ${label} into a new unsaved entry`,
			moveUp: unowned,
			moveDown: unowned,
			remove: unowned,
		};
	}

	const where = configScopeFiles(repoKey, globalConfigFile)[ownerScope];
	const edge = (position: string) =>
		`${label} is the ${position} entry in ${where} — entries cannot move across scopes`;

	return {
		duplicate: `Duplicate ${label} into a new unsaved entry in ${where}`,
		moveUp: canMoveUp ? `Move ${label} up in ${where}` : edge("first"),
		moveDown: canMoveDown ? `Move ${label} down in ${where}` : edge("last"),
		remove: `Remove ${label} from ${where}`,
	};
}
