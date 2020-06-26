import { copyFileSync } from "fs-extra";
import { resolve } from "path";

const root = resolve(__dirname, "..");
const dist_root = resolve(__dirname, "../dist");

["package.json", "README.md", "LICENSE"].forEach(each => {
    copyFileSync(resolve(root, each), resolve(dist_root, each));
});
