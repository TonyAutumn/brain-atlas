import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const html = fs.readFileSync(path.join(root, "basics.html"), "utf8");
const css = fs.readFileSync(path.join(root, "styles.css"), "utf8");
const data = fs.readFileSync(path.join(root, "data", "regions.js"), "utf8");
const deepDives = fs.readFileSync(path.join(root, "data", "deep-dives.js"), "utf8");
const app = fs.readFileSync(path.join(root, "app.js"), "utf8");

const bundled = html
  // Use replacer functions so JavaScript sequences such as `$$` are copied
  // literally. A replacement string would interpret `$$` as a single `$`.
  .replace('<link rel="stylesheet" href="styles.css">', () => `<style>\n${css}\n</style>`)
  .replace('<script src="data/regions.js"></script>', () => `<script>\n${data}\n</script>`)
  .replace('<script src="data/deep-dives.js"></script>', () => `<script>\n${deepDives}\n</script>`)
  .replace('<script src="app.js"></script>', () => `<script>\n${app}\n</script>`);

fs.writeFileSync(path.join(root, "脑区探索室-离线版.html"), bundled);
fs.writeFileSync(path.join(root, "Brain-Atlas-Offline.html"), bundled);
console.log("Built standalone offline HTML files");
