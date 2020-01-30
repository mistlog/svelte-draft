import traverse, { NodePath } from "@babel/traverse";
import { ExportDefaultDeclaration, BlockStatement, Statement, Program, ImportDeclaration } from "@babel/types";
import { transformSync } from "@babel/core";
import { Transcriber, ITranscriber, DSLPlugin, LocalContextPlugin, ClassPlugin } from "typedraft";
import { SvelteFilterPlugin } from "../plug-in/draft-plugin-svelte-filter";
import { TranslateScript } from "../section/script-section";
import { TranslateTemplate, IsTemplate } from "../section/template-section";
import { TranslateImport } from "../section/import-section";
import { SvelteWatch } from "../dsl/draft-dsl-svelte-watch";
import * as TypescriptPreset from "@babel/preset-typescript";

export interface ISvelteTranscriber extends ITranscriber
{
    m_Path: NodePath<Program>;
}

export class SvelteTranscriber extends Transcriber
{
    constructor(code: string)
    {
        super(code);
    }

    get m_Path() { return this.m_Module.m_Path; }
}

//@ts-ignore
<SvelteTranscriber /> + function TranscribeToSections(this: SvelteTranscriber & ISvelteTranscriber)
{
    // to js
    const component = this.Transcribe();
    const component_ast = transformSync(component, {
        filename: "script.tsx",
        ast: true,
        presets: [[TypescriptPreset, { jsxPragma: "preserve", isTSX: true, allExtensions: true }]]
    }).ast;

    let program: NodePath<Program> = null;
    traverse(component_ast, {
        Program(path)
        {
            program = path;
        }
    });

    //
    const deps = FindAllImport(program);
    const import_section = TranslateImport(deps);

    const body = FindComponentBody(program);
    const script_section = TranslateScript(body);
    const template_section = TranslateTemplate(body);

    return {
        import_section,
        script_section,
        template_section
    };
};

export function FindAllImport(program: NodePath<Program>)
{
    const deps = program.get("body").filter(each => each.isImportDeclaration()) as Array<NodePath<ImportDeclaration>>;
    return deps;
}

export function FindComponentBody(program: NodePath<Program>)
{
    const statements: Array<NodePath<Statement>> = program.get("body").filter(each => !IsTemplate(each));
    const component = statements.find(each => each.isExportDeclaration()) as NodePath<ExportDefaultDeclaration>;
    const body = component.get("declaration").get("body") as NodePath<BlockStatement>;
    return body;
};

//@ts-ignore
< SvelteTranscriber /> + function PrepareDSLs()
{
    this.m_DSLMap.set("watch", new SvelteWatch());
};

//@ts-ignore
< SvelteTranscriber /> + function PreparePlugins(this: SvelteTranscriber)
{
    this.m_Plugins = [
        new DSLPlugin(this),
        new ClassPlugin(this),
        new LocalContextPlugin(this),
        new SvelteFilterPlugin(this)
    ]
}