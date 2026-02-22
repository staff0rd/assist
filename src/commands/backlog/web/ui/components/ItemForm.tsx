import { Form } from "@base-ui/react/form";
import { useRef, useState } from "react";
import type { BacklogItem } from "../types";
import { AcceptanceCriteriaField } from "./AcceptanceCriteriaField";
import { BackButton } from "./BackButton";
import { DescriptionField } from "./DescriptionField";
import { FormActions } from "./FormActions";
import { getDefaults, handleSubmit } from "./getDefaults";
import { NameField } from "./NameField";
import { TypeField } from "./TypeField";

type ItemFormProps = {
	item?: BacklogItem;
	onSaved: (id: number) => void;
	onCancel: () => void;
};

export function ItemForm({ item, onSaved, onCancel }: ItemFormProps) {
	const defaults = getDefaults(item);
	const [type, setType] = useState<"story" | "bug">(
		defaults.type as "story" | "bug",
	);
	const [name, setName] = useState(defaults.name);
	const [description, setDescription] = useState(defaults.description);
	const acRef = useRef<string[]>(defaults.ac);

	return (
		<>
			<BackButton onClick={onCancel} />
			<Form
				className="bg-white rounded-lg p-6 border border-gray-200"
				onSubmit={(e) =>
					handleSubmit(e, type, name, description, acRef.current, item, onSaved)
				}
			>
				<h2 className="mb-4">{defaults.title}</h2>
				<TypeField value={type} onChange={setType} />
				<NameField value={name} onChange={setName} />
				<DescriptionField value={description} onChange={setDescription} />
				<AcceptanceCriteriaField
					initial={defaults.ac}
					onChange={(v) => {
						acRef.current = v;
					}}
				/>
				<FormActions submitLabel={defaults.submitLabel} onCancel={onCancel} />
			</Form>
		</>
	);
}
