export function getHtml(): string {
	return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Assist</title>
<link rel="stylesheet" href="/xterm.css">
<link rel="stylesheet" href="/bundle.css">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  html, body, #app { width: 100%; height: 100%; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #555; border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: #777; }
  .markdown p { margin-bottom: 0.5em; }
  .markdown ul, .markdown ol { margin: 0 0 0.5em; padding-left: 1.5em; }
  .markdown li { margin-bottom: 0.25em; }
  .markdown pre { background: rgba(0,0,0,0.1); padding: 12px; border-radius: 6px; overflow-x: auto; }
  .markdown code { background: rgba(0,0,0,0.1); padding: 2px 4px; border-radius: 3px; font-size: 0.9em; }
  .markdown pre code { background: none; padding: 0; }
</style>
</head>
<body>
<div id="app"></div>
<script src="/bundle.js"></script>
</body>
</html>`;
}
