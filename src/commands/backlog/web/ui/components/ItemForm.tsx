import { Form } from "@base-ui/react/form";
import { useRef, useState } from "react";
import { useNavigate } from "react-router";
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
	onReload: () => Promise<void>;
	backTo: string;
};

export function ItemForm({ item, onReload, backTo }: ItemFormProps) {
	const navigate = useNavigate();
	const defaults = getDefaults(item);
	const [type, setType] = useState<"story" | "bug">(
		defaults.type as "story" | "bug",
	);
	const [name, setName] = useState(defaults.name);
	const [description, setDescription] = useState(defaults.description);
	const acRef = useRef<string[]>(defaults.ac);

	const cancel = () => navigate(backTo);

	return (
		<>
			<BackButton to={backTo} />
			<Form
				className="bg-white rounded-lg p-6 border border-gray-200"
				onSubmit={(e) =>
					handleSubmit(
						e,
						type,
						name,
						description,
						acRef.current,
						item,
						async (id) => {
							await onReload();
							navigate(`/items/${id}`);
						},
					)
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
				<FormActions submitLabel={defaults.submitLabel} onCancel={cancel} />
			</Form>
		</>
	);
}
