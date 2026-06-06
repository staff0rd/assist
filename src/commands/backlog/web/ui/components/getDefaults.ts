import type { FormEvent } from "react";
import { type ItemFields, submitForm } from "../submitForm";
import type { BacklogItem } from "../types";

export function getDefaults(item?: BacklogItem) {
	return {
		type: item?.type ?? "story",
		name: item?.name ?? "",
		description: item?.description ?? "",
		ac: item?.acceptanceCriteria ?? [],
		title: item ? "Edit Item" : "Add Item",
		submitLabel: item ? "Save" : "Add",
	};
}

export async function handleSubmit(
	e: FormEvent,
	fields: ItemFields,
	item: BacklogItem | undefined,
	cwd: string | undefined,
	onSaved: (id: number) => void | Promise<void>,
) {
	e.preventDefault();
	const id = await submitForm(fields, item, cwd);
	if (id === undefined) return;
	await onSaved(id);
}
