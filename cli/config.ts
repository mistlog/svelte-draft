import { ISvelteDraftConfig } from "./literator";
import { cosmiconfig } from "cosmiconfig";
import { default as tsLoader } from "@endemolshinegroup/cosmiconfig-typescript-loader";

export function withConfig(callback: (config: ISvelteDraftConfig) => void) {
    const explorer = cosmiconfig("svelte-draft", {
        searchPlaces: [`svelte-draft.config.ts`],
        loaders: {
            ".ts": tsLoader,
        },
    });

    explorer.search().then(configInfo => {
        let config: ISvelteDraftConfig = { DSLs: [], include: [], outDir: "./build" };
        if (configInfo && !configInfo.isEmpty) {
            config = { ...config, ...configInfo.config };
        }
        callback(config);
    });
}
