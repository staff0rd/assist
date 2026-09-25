import { useState } from "react";
import type { ConfigEntry } from "../../../../../../config/readConfigEntries";
import { normalizeConfigValue } from "./useConfigRowWrites/normalizeConfigValue";
import { nothingToClearMessage } from "./useConfigRowWrites/nothingToClearMessage";
import { type ConfigScope, saveConfigValue } from "./saveConfigValue";
import { unsetConfigValue } from "./useConfigRowWrites/unsetConfigValue";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

export function useConfigRowWrites({ entry, cwd, onSaved, onError }: Options) {
	const [saving, setSaving] = useState(false);

	async function save(scope: ConfigScope, value: unknown): Promise<boolean> {
		setSaving(true);
		const { error } = await saveConfigValue({
			key: entry.key,
			value: entry.node ? normalizeConfigValue(entry.node, value) : value,
			cwd,
			scope,
		});
		setSaving(false);
		if (error) {
			onError(error);
			return false;
		}
		onSaved();
		return true;
	}

	async function clear(scope: ConfigScope): Promise<boolean> {
		setSaving(true);
		const { error, removed } = await unsetConfigValue({
			key: entry.key,
			cwd,
			scope,
		});
		setSaving(false);
		if (error) {
			onError(error);
			return false;
		}
		if (removed === false) {
			onError(nothingToClearMessage(entry, scope));
			return false;
		}
		onSaved();
		return true;
	}

	return { saving, save, clear };
}
