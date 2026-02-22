import { Field } from "@base-ui/react/field";

type NameFieldProps = {
	value: string;
	onChange: (value: string) => void;
};

export function NameField({ value, onChange }: NameFieldProps) {
	return (
		<Field.Root className="mb-4">
			<Field.Label className="block font-medium mb-1 text-sm">Name</Field.Label>
			<Field.Control
				className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm font-[inherit]"
				required
				placeholder="Item name"
				value={value}
				onChange={(e) => onChange(e.target.value)}
			/>
			<Field.Error className="text-red-500 text-xs mt-1" match="valueMissing">
				Name is required.
			</Field.Error>
		</Field.Root>
	);
}
