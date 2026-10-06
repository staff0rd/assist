import type { ConfigEntry } from "../../../../../../../../config/readConfigEntries";
import {
	moveConfigListItem,
	removeConfigListItem,
} from "../../moveConfigListItem";
import {
	type ConfigArrayItemPlacement,
	placeConfigArrayItem,
} from "./placeConfigArrayItem";
import type { ConfigScope } from "../../saveConfigValue";
import { useConfigRowWrites } from "../../useConfigRowWrites";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function useConfigArrayItemWrites({
	entry,
	cwd,
	onSaved,
	onError,
}: Options) {
	const { saving, save, clear } = useConfigRowWrites({
		entry,
		cwd,
		onSaved,
		onError,
	});

	return {
		saving,
		saveItem: (
			scope: ConfigScope,
			layerItems: unknown[],
			placement: ConfigArrayItemPlacement,
			value: unknown,
		) => save(scope, placeConfigArrayItem(layerItems, placement, value)),
		removeItem: (scope: ConfigScope, layerItems: unknown[], index: number) => {
			const left = removeConfigListItem(layerItems, index);
			return left.length === 0 ? clear(scope) : save(scope, left);
		},
		moveItem: (
			scope: ConfigScope,
			layerItems: unknown[],
			from: number,
			to: number,
		) => save(scope, moveConfigListItem(layerItems, from, to)),
	};
}
