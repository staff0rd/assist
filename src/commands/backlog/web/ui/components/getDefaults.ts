import type { FormEvent } from "react";
import { submitForm } from "../submitForm";
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
	type: "story" | "bug",
	name: string,
	description: string,
	criteria: string[],
	item: BacklogItem | undefined,
	onSaved: (id: number) => void,
) {
	e.preventDefault();
	const id = await submitForm(type, name, description, criteria, item);
	if (id === undefined) return;
	onSaved(id);
}
