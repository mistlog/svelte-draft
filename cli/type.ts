import { resolve } from "path";
import { outputJSONSync, removeSync } from "fs-extra";
import { exec } from "child_process";

export function generateType(include: Array<string>, outDir: string) {
    const workingDirectory = process.cwd();
    const typeConfigPath = resolve(__dirname, "temp.typeconfig.json");
    outputJSONSync(typeConfigPath, {
        compilerOptions: {
            target: "es6",
            module: "commonjs",
            moduleResolution: "node",
            jsx: "preserve",
            declaration: true,
            outDir: resolve(workingDirectory, outDir),
            emitDeclarationOnly: true,
            esModuleInterop: true,
        },
        include: include.map(each => resolve(workingDirectory, each)),
    });

    exec(`npx tsc --project ${typeConfigPath}`, error => {
        // TODO: fix error report: [svelte] Cannot find module 'magic-string'
        // if (error) {
        //     console.log(error);
        // }
        removeSync(typeConfigPath);
    });
}
