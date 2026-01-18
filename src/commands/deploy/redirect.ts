import { existsSync, readFileSync, writeFileSync } from "node:fs";
import chalk from "chalk";

const TRAILING_SLASH_SCRIPT = `    <script>
      if (!window.location.pathname.endsWith('/')) {
        window.location.href = \`\${window.location.pathname}/\${window.location.search}\${window.location.hash}\`;
      }
    </script>`;

export function redirect(): void {
	const indexPath = "index.html";

	if (!existsSync(indexPath)) {
		console.log(chalk.yellow("No index.html found"));
		return;
	}

	const content = readFileSync(indexPath, "utf-8");

	if (content.includes("window.location.pathname.endsWith('/')")) {
		console.log(chalk.dim("Trailing slash script already present"));
		return;
	}

	const headCloseIndex = content.indexOf("</head>");
	if (headCloseIndex === -1) {
		console.log(chalk.red("Could not find </head> tag in index.html"));
		return;
	}

	const newContent =
		content.slice(0, headCloseIndex) +
		TRAILING_SLASH_SCRIPT +
		"\n  " +
		content.slice(headCloseIndex);

	writeFileSync(indexPath, newContent);
	console.log(chalk.green("Added trailing slash redirect to index.html"));
}
