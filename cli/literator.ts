import { outputFileSync, removeSync, readFileSync, existsSync, readFile, pathExists } from "fs-extra";
import * as traverse from "filewalker";
import * as watch from "node-watch";
import { SvelteTranscriber } from "../src";
import { config } from "./config";
import { Transcriber } from "typedraft";
import { transformSync, transformAsync } from "@babel/core";
import * as TypescriptPreset from "@babel/preset-typescript";

function TraverseDirectory(path: string, callback: (name: string, path: string) => void)
{
    const action = (relative: string, stats, absolute: string) => callback(relative, absolute);
    traverse(path)
        .on("file", action)
        .walk();
}

export function InspectDirectory(path: string)
{
    ComposeDirectory(path);

    //@ts-ignore
    watch(path, { recursive: true }, (event, name: string) =>
    {
        if (name.endsWith(".tsx"))
        {
            console.log(event, name);
            try
            {
                ComposeFile(name);
            }
            catch (error)
            {
                console.log(error.message);
            }
        }
    });
}

export function InspectFile(path: string)
{
    ComposeFile(path);

    //@ts-ignore
    watch(path, (event, name: string) =>
    {
        if (name.endsWith(".tsx"))
        {
            console.log(event, name);
            try
            {
                ComposeFile(name);
            }
            catch (error)
            {
                console.log(error.message);
            }
        }
    });
}

export function ComposeDirectory(path: string)
{
    TraverseDirectory(path, (relative: string, absolute: string) =>
    {
        if (absolute.endsWith(".tsx"))
        {
            try
            {
                ComposeFile(absolute);
            } catch (error)
            {
                console.log(`compose file failed: ${error.message}, source: ${relative}`);
            }
        }
    })
}

export function CrossoutDirectory(path: string)
{
    TraverseDirectory(path, (relative: string, absolute: string) =>
    {
        if (absolute.endsWith(".tsx"))
        {
            removeSync(absolute.replace(".tsx", ""));
        }
    })
}

export function ComposeFile(source: string)
{
    if (source.endsWith(".svelte.tsx"))
    {
        const component = TranscribeSvelteDraftSync(source);
        outputFileSync(source.replace(".tsx", ""), component, "utf8");
    }
    else if (source.endsWith(".js.tsx"))
    {
        const code = TranscribeTypeDraftSync(source);
        outputFileSync(source.replace(".tsx", ""), code, "utf8");
    }
}

export async function TranscribeTypeDraftAsync(source: string)
{
    const code = await readFile(source, "utf8");
    const transcriber = new Transcriber(code);
    config.dsls.forEach(dsl => transcriber.AddDSL(dsl.name, dsl.dsl));

    const ts_code = transcriber.Transcribe();

    const js_code = await transformAsync(ts_code, {
        filename: "script.tsx",
        ast: true,
        presets: [[TypescriptPreset, { jsxPragma: "preserve", isTSX: true, allExtensions: true }]]
    });

    return js_code.code;
}

export function TranscribeTypeDraftSync(source: string)
{
    const code = readFileSync(source, "utf8");
    const transcriber = new Transcriber(code);
    config.dsls.forEach(dsl => transcriber.AddDSL(dsl.name, dsl.dsl));

    const ts_code = transcriber.Transcribe();

    const js_code = transformSync(ts_code, {
        filename: "script.tsx",
        ast: true,
        presets: [[TypescriptPreset, { jsxPragma: "preserve", isTSX: true, allExtensions: true }]]
    }).code;

    return js_code;
}

export async function TranscribeSvelteDraftAsync(source: string)
{
    const code = await readFile(source, "utf8");
    const transcriber = new SvelteTranscriber(code);
    config.dsls.forEach(dsl => transcriber.AddDSL(dsl.name, dsl.dsl));
    const { import_section, script_section, template_section } = transcriber.TranscribeToSections();

    //
    const style = source.replace(".svelte.tsx", ".css");
    const style_section = await pathExists(style) ? await readFile(style, "utf8") : "";

    //
    const component = [
        "<script>",
        import_section,
        "\n",
        script_section,
        "</script>",
        "\n",
        template_section,
        "\n",
        "<style>",
        style_section,
        "</style>"
    ].join("\n");

    return component;
}

export function TranscribeSvelteDraftSync(source: string)
{
    const code = readFileSync(source, "utf8");
    const transcriber = new SvelteTranscriber(code);
    config.dsls.forEach(dsl => transcriber.AddDSL(dsl.name, dsl.dsl));
    const { import_section, script_section, template_section } = transcriber.TranscribeToSections();

    //
    const style = source.replace(".svelte.tsx", ".css");
    const style_section = existsSync(style) ? readFileSync(style, "utf8") : "";

    //
    const component = [
        "<script>",
        import_section,
        "\n",
        script_section,
        "</script>",
        "\n",
        template_section,
        "\n",
        "<style>",
        style_section,
        "</style>"
    ].join("\n");

    return component;
}