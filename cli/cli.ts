#!/usr/bin/env node
import * as program from "commander";
import {
    ComposeFile,
    ComposeDirectory,
    InspectDirectory,
    InspectFile,
    CrossoutDirectory,
    ISvelteDraftConfig,
} from "./literator";
import { resolve } from "path";
import { lstatSync } from "fs";
import { readJSONSync } from "fs-extra";

import { cosmiconfig } from "cosmiconfig";
import { default as tsLoader } from "@endemolshinegroup/cosmiconfig-typescript-loader";

const package_json = readJSONSync(resolve(__dirname, "../../package.json"));
program.version(package_json.version);
program.option("-w, --watch", "compose file or files in directory in watch mode");
program.option("-clean, --clean", "remove generated files");
program.parse(process.argv);

const args = program.args;

if (args.length === 0) {
    program.help();
} else {
    const [target] = args;

    if (target) {
        if (program.clean) {
            CrossoutDirectory(target);
        } else {
            Transcribe(target);
        }
    }
}

function Transcribe(target: string) {
    //
    // find config
    const explorer = cosmiconfig("svelte-draft", {
        searchPlaces: [`svelte-draft.config.ts`],
        loaders: {
            ".ts": tsLoader,
        },
    });

    explorer.search().then(config_info => {
        let config: ISvelteDraftConfig = { DSLs: [] };
        if (config_info && !config_info.isEmpty) {
            config = { ...config, ...config_info.config };
        }

        //
        const working_directory = process.cwd();
        const path = resolve(working_directory, target);

        if (lstatSync(path).isDirectory()) {
            program.watch ? InspectDirectory(path, config) : ComposeDirectory(path, config);
        } else {
            program.watch ? InspectFile(path, config) : ComposeFile(path, config);
        }
    });
}
