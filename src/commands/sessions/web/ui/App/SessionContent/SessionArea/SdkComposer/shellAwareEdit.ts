type Field = HTMLTextAreaElement | HTMLInputElement;

export function shellAwareEdit(
	shell: { enter: (field: Field) => void },
	slash: { edit: (field: Field) => void },
) {
	return (field: Field) => {
		shell.enter(field);
		slash.edit(field);
	};
}
