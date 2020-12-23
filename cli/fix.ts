const svelte = require("svelte/compiler");
const fs = require("fs");
const { resolve } = require("path");
const { transformSync } = require("@babel/core");
const traverse = require("@babel/traverse").default;
const generate = require("@babel/generator").default;
const traverseDirectory = require("filewalker");

async function preprocessSvelte(path) {
    const source = fs.readFileSync(path, "utf8");
    const { code } = await svelte.preprocess(
        source,
        {
            script: ({ content, filename }) => {
                const code = preprocessImport(content, filename);
                return { code };
            },
        },
        {
            filename: path,
        }
    );

    return code;
}

/**
 * add .svelte in "import" if necessary
 */
function preprocessImport(content, filename) {
    const ast = transformSync(content, {
        filename,
        ast: true,
    }).ast;

    traverse(ast, {
        ImportDeclaration(astPath) {
            const sourceName = astPath.node.source?.value;
            if (!sourceName) {
                return;
            }
            const importFrom = resolve(filename, "../", sourceName);
            const svelteFile = importFrom + ".svelte";
            if (fs.existsSync(svelteFile)) {
                astPath.node.source.value += ".svelte";
            }
        },
    });

    const code = generate(ast).code;
    return code;
}

function preprocessScript(content, filename) {
    const ast = transformSync(content, {
        filename,
        ast: true,
    }).ast;

    traverse(ast, {
        ImportDeclaration(astPath) {
            const sourceName = astPath.node.source?.value;
            if (!sourceName) {
                return;
            }
            const importFrom = resolve(filename, "../", sourceName);
            const svelteFile = importFrom + ".svelte";
            if (fs.existsSync(svelteFile)) {
                astPath.node.source.value += ".svelte";
            }
        },
        ExportDeclaration(astPath) {
            const sourceName = astPath.node.source?.value;
            if (!sourceName) {
                return;
            }
            const importFrom = resolve(filename, "../", sourceName);
            const svelteFile = importFrom + ".svelte";
            if (fs.existsSync(svelteFile)) {
                astPath.node.source.value += ".svelte";
            }
        },
    });

    const code = generate(ast).code;
    return code;
}

export async function addSvelteExtension(path) {
    traverseDirectory(path)
        .on("file", async (relative, stats, absolute) => {
            if (absolute.endsWith(".svelte")) {
                const code = await preprocessSvelte(absolute);
                fs.writeFileSync(absolute, code, "utf8");
            } else if (absolute.endsWith(".js")) {
                const code = fs.readFileSync(absolute, "utf8");
                const withExtension = preprocessScript(code, absolute);
                fs.writeFileSync(absolute, withExtension, "utf8");
            }
        })
        .walk();
}
