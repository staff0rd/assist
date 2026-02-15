import enquirer from "enquirer";

function censor(value: string): string {
	const visible = value.slice(-4);
	return `${"*".repeat(value.length - 4)}${visible}`;
}

function label(name: string, existing?: string): string {
	return existing ? `${name} (${censor(existing)})` : name;
}

async function promptField(name: string, existing?: string): Promise<string> {
	const { value } = await enquirer.prompt<{ value: string }>({
		type: "input",
		name: "value",
		message: `${label(name, existing)}:`,
		validate: (v) => v.trim().length > 0 || !!existing || `${name} is required`,
	});
	return value.trim() || existing || "";
}

export async function promptCredentials(existing?: {
	clientId?: string;
	clientSecret?: string;
}): Promise<{ clientId: string; clientSecret: string }> {
	const clientId = await promptField("Client ID", existing?.clientId);
	const clientSecret = await promptField(
		"Client Secret",
		existing?.clientSecret,
	);

	if (!clientId || !clientSecret) {
		throw new Error("Client ID and Client Secret are required");
	}

	return { clientId, clientSecret };
}
