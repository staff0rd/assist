import { Typography } from "@mui/material";
import { AcceptanceCriteriaField } from "./AcceptanceCriteriaField";
import { DescriptionField } from "./DescriptionField";
import { FormActions } from "./FormActions";
import { NameField } from "./NameField";
import { TypeField } from "./TypeField";

type ItemFormFieldsProps = {
	title: string;
	submitLabel: string;
	type: "story" | "bug";
	onTypeChange: (v: "story" | "bug") => void;
	name: string;
	onNameChange: (v: string) => void;
	description: string;
	onDescriptionChange: (v: string) => void;
	initialAc: string[];
	onAcChange: (v: string[]) => void;
	onCancel: () => void;
};

export function ItemFormFields({
	title,
	submitLabel,
	type,
	onTypeChange,
	name,
	onNameChange,
	description,
	onDescriptionChange,
	initialAc,
	onAcChange,
	onCancel,
}: ItemFormFieldsProps) {
	return (
		<>
			<Typography variant="h6" sx={{ mb: 2 }}>
				{title}
			</Typography>
			<TypeField value={type} onChange={onTypeChange} />
			<NameField value={name} onChange={onNameChange} />
			<DescriptionField value={description} onChange={onDescriptionChange} />
			<AcceptanceCriteriaField initial={initialAc} onChange={onAcChange} />
			<FormActions submitLabel={submitLabel} onCancel={onCancel} />
		</>
	);
}
