import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import enquirer from "enquirer";

export async function promptType(): Promise<"story" | "bug"> {
	const { type } = await enquirer.prompt<{ type: "story" | "bug" }>({
		type: "select",
		name: "type",
		message: "Type:",
		choices: ["story", "bug"],
		initial: 0,
	});
	return type;
}

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
	const { useEditor } = await enquirer.prompt<{ useEditor: boolean }>({
		type: "confirm",
		name: "useEditor",
		message: "Open editor for description?",
		initial: false,
	});

	if (!useEditor) {
		const { description } = await enquirer.prompt<{ description: string }>({
			type: "input",
			name: "description",
			message: "Description (optional):",
		});
		return description.trim() || undefined;
	}

	return openEditor();
}

function openEditor(): string | undefined {
	const editor = process.env.EDITOR || process.env.VISUAL || "vi";
	const dir = mkdtempSync(join(tmpdir(), "assist-"));
	const filePath = join(dir, "description.md");
	writeFileSync(filePath, "");

	const result = spawnSync(editor, [filePath], { stdio: "inherit" });
	if (result.status !== 0) {
		unlinkSync(filePath);
		return undefined;
	}

	const content = readFileSync(filePath, "utf-8").trim();
	unlinkSync(filePath);
	return content || undefined;
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
