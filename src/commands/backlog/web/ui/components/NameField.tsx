import { Field } from "@base-ui/react/field";

type NameFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

export function NameField({ value, onChange }: NameFieldProps) {
	return (
		<Field.Root className="field">
			<Field.Label>Name</Field.Label>
			<Field.Control
				required
				placeholder="Item name"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			<Field.Error className="field-error" match="valueMissing">
				Name is required.
			</Field.Error>
		</Field.Root>
	);
}
