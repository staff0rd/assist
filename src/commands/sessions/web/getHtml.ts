export function getHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sessions</title>
<link rel="stylesheet" href="/xterm.css">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #app { width: 100%; height: 100%; overflow: hidden; background: #1e1e1e; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #777; }
</style>
</head>
<body>
<div id="app"></div>
<script src="/bundle.js"></script>
</body>
</html>`;
}
