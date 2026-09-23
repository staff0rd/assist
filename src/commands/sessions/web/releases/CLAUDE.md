# Releases

The Releases page renders exactly the JSON from:

```
curl -s "http://localhost:3100/api/releases/state?cwd=<url-encoded repo path>"
```

`cwd` is the repo selected in the page's repo picker. gh results are cached for 30s, and relative ages are computed in the browser at render time.
