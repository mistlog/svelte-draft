#!/usr/bin/env node
import * as program from "commander";
import { ComposeDirectory, CrossoutDirectory } from "./literator";
import { resolve, basename, join } from "path";
import { lstatSync, readJSONSync, copySync, emptyDirSync } from "fs-extra";

import { addSvelteExtension } from "./fix";
import { generateType } from "./type";
import { withConfig } from "./config";

const packageJSON = readJSONSync(resolve(__dirname, "../../package.json"));
program.version(packageJSON.version);

//
program
    .command("build")
    .description("build component and script")
    .action(() => {
        withConfig(config => {
            const { include, outDir } = config;
            const workingDirectory = process.cwd();

            include.forEach(inDir => {
                const path = resolve(workingDirectory, inDir);
                if (lstatSync(path).isDirectory()) {
                    ComposeDirectory(path, config, () => {
                        const newOutDir = join(outDir, basename(inDir));
                        emptyDirSync(newOutDir);
                        copySync(inDir, newOutDir, {
                            filter: (src, dest) => {
                                if (
                                    basename(src).endsWith(".tsx") ||
                                    basename(src).endsWith(".ts")
                                ) {
                                    return false;
                                }

                                return true;
                            },
                        });
                        addSvelteExtension(newOutDir);
                    });
                }
            });

            generateType(include, outDir);
        });
    });
//
program
    .command("transcribe <dir>")
    .description("generate component and script")
    .action(dir => {
        withConfig(config => {
            const path = resolve(process.cwd(), dir);
            if (lstatSync(path).isDirectory()) {
                ComposeDirectory(path, config, () => {
                    addSvelteExtension(path);
                });
            }
        });
    });
//
program
    .command("clean <dir>")
    .description("remove generated files")
    .action(dir => {
        const path = resolve(process.cwd(), dir);
        if (lstatSync(path).isDirectory()) {
            CrossoutDirectory(path);
        }
    });

//
program.parse(process.argv);
