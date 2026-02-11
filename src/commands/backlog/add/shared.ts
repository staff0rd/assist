import enquirer from "enquirer";

export async function promptName(): Promise<string> {
	const { name } = await enquirer.prompt<{ name: string }>({
		type: "input",
		name: "name",
		message: "Name:",
		validate: (value) => value.trim().length > 0 || "Name is required",
	});
	return name.trim();
}

export async function promptDescription(): Promise<string | undefined> {
	const { description } = await enquirer.prompt<{ description: string }>({
		type: "input",
		name: "description",
		message: "Description (optional):",
	});
	return description.trim() || undefined;
}

export async function promptAcceptanceCriteria(): Promise<string[]> {
	const criteria: string[] = [];
	for (;;) {
		const { criterion } = await enquirer.prompt<{ criterion: string }>({
			type: "input",
			name: "criterion",
			message: "Acceptance criterion (empty to finish):",
		});
		if (criterion.trim() === "") break;
		criteria.push(criterion.trim());
	}
	return criteria;
}
