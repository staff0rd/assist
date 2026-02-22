export function getHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Backlog</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  .markdown p { margin-bottom: 0.5em; }
  .markdown pre { background: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; }
  .markdown code { background: #f3f4f6; padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
  .markdown pre code { background: none; padding: 0; }
</style>
</head>
<body class="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] bg-gray-100 text-gray-800 leading-normal">
<div class="max-w-3xl mx-auto px-4 py-6" id="app"></div>
<script src="/bundle.js"></script>
</body>
</html>`;
}
