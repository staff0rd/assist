import { type FormEvent, useRef, useState } from "react";
import { submitForm } from "../submitForm";
import type { BacklogItem } from "../types";
import { AcceptanceCriteriaField } from "./AcceptanceCriteriaField";
import { BackButton } from "./BackButton";
import { DescriptionField } from "./DescriptionField";
import { FormActions } from "./FormActions";
import { NameField } from "./NameField";

type ItemFormProps = {
	item?: BacklogItem;
	onSaved: (id: number) => void;
	onCancel: () => void;
};

function getDefaults(item?: BacklogItem) {
	return {
		name: item?.name ?? "",
		description: item?.description ?? "",
		ac: item?.acceptanceCriteria ?? [],
		title: item ? "Edit Item" : "Add Item",
		submitLabel: item ? "Save" : "Add",
	};
}

async function handleSubmit(
	e: FormEvent,
	name: string,
	description: string,
	criteria: string[],
	item: BacklogItem | undefined,
	onSaved: (id: number) => void,
) {
	e.preventDefault();
	const id = await submitForm(name, description, criteria, item);
	if (id === undefined) {
		alert("Name is required.");
		return;
	}
	onSaved(id);
}

export function ItemForm({ item, onSaved, onCancel }: ItemFormProps) {
	const defaults = getDefaults(item);
	const [name, setName] = useState(defaults.name);
	const [description, setDescription] = useState(defaults.description);
	const acRef = useRef<string[]>(defaults.ac);

	return (
		<>
			<BackButton onClick={onCancel} />
			<form
				className="form"
				onSubmit={(e) =>
					handleSubmit(e, name, description, acRef.current, item, onSaved)
				}
			>
				<h2>{defaults.title}</h2>
				<NameField value={name} onChange={setName} />
				<DescriptionField value={description} onChange={setDescription} />
				<AcceptanceCriteriaField
					initial={defaults.ac}
					onChange={(v) => {
						acRef.current = v;
					}}
				/>
				<FormActions submitLabel={defaults.submitLabel} onCancel={onCancel} />
			</form>
		</>
	);
}
