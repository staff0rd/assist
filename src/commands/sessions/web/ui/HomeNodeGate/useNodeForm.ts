import { type FormEvent, useState } from "react";
import { defaultNodeName } from "./defaultNodeName";
import { parseNodeUrl } from "./parseNodeUrl";
import type { SavedNode } from "./SavedNode";

export function useNodeForm(
	initial: SavedNode | undefined,
	onSubmit: (node: SavedNode) => Promise<string | undefined>,
) {
	const [url, setUrl] = useState(initial?.url ?? "");
	const [typedName, setTypedName] = useState(initial?.name);
	const [error, setError] = useState<string>();
	const [busy, setBusy] = useState(false);

	const parsed = parseNodeUrl(url);
	const name = typedName ?? (parsed ? defaultNodeName(parsed) : "");

	const changeUrl = (next: string) => {
		setUrl(next);
		setError(undefined);
	};

	const submit = async (e: FormEvent) => {
		e.preventDefault();
		if (!parsed) {
			setError("Enter an http(s) URL, e.g. https://mac.tail1234.ts.net:3100");
			return;
		}
		setBusy(true);
		const failure = await onSubmit({
			name: name.trim() || defaultNodeName(parsed),
			url: parsed,
		});
		setBusy(false);
		setError(failure);
	};

	return { url, changeUrl, name, setName: setTypedName, error, busy, submit };
}
