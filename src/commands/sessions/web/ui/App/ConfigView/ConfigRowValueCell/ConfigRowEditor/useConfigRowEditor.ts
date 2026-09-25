import { useState } from "react";
import type { ConfigEntry } from "../../../../../../../config/readConfigEntries";
import { configEntryScopeSignature } from "./useConfigRowEditor/configEntryScopeSignature";
import { configScopesWithValue } from "../configScopesWithValue";
import { defaultConfigScope } from "../defaultConfigScope";
import { effectiveConfigValue } from "../effectiveConfigValue";
import type { ConfigScope } from "../saveConfigValue";
import { useConfigRowWrites } from "../useConfigRowWrites";

type Options = {
	entry: ConfigEntry;
	cwd: string;
	onSaved: () => void;
	onError: (message: string) => void;
};

type ScopePick = { signature: string; scope: ConfigScope };

function scopeForSignature(
	entry: ConfigEntry,
	signature: string,
	picked: ScopePick | null,
): ConfigScope {
	if (picked && picked.signature === signature) return picked.scope;
	return defaultConfigScope(entry);
}

export function useConfigRowEditor({ entry, cwd, onSaved, onError }: Options) {
	const scopeLocked = entry.globalOnly === true;
	const saved = effectiveConfigValue(entry);
	const [value, setValue] = useState<unknown>(saved);
	const [picked, setPicked] = useState<ScopePick | null>(null);
	const signature = configEntryScopeSignature(entry);
	const scope = scopeForSignature(entry, signature, picked);
	const { saving, save, clear } = useConfigRowWrites({
		entry,
		cwd,
		onSaved,
		onError,
	});

	return {
		value,
		setValue,
		scope,
		setScope: (next: ConfigScope) => setPicked({ signature, scope: next }),
		scopeLocked,
		saving,
		save: () => save(scope, value),
		clear: () => clear(scope),
		canClear: configScopesWithValue(entry).includes(scope),
		dirty: JSON.stringify(value) !== JSON.stringify(saved),
		reset: () => setValue(saved),
	};
}
