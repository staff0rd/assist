export function getHtml(): string {
	return `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>News</title>
<script src="https://cdn.tailwindcss.com"></script>
<script>tailwind.config={darkMode:'class'}</script>
</head>
<body class="font-[-apple-system,BlinkMacSystemFont,'Segoe_UI',Roboto,sans-serif] bg-gray-950 text-gray-200 leading-normal">
<div class="max-w-3xl mx-auto px-4 py-6" id="app"></div>
<script src="/bundle.js"></script>
</body>
</html>`;
}
