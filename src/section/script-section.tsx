import {
    ExportDefaultDeclaration,
    BlockStatement,
    LVal,
    Program,
    Statement,
    ObjectProperty,
    Identifier,
    VariableDeclaration,
} from "@babel/types";
import { ToString, ToAst } from "typedraft";
import { NodePath } from "@babel/core";
import { IsTemplate } from "./template-section";

export function TranslateScript(body: NodePath<BlockStatement>) {
    const translated: Array<Statement> = [];
    body.get("body").forEach(each => {
        if (each.isVariableDeclaration() && each.node.declarations.length === 1) {
            const [declarator] = each.get("declarations");
            if (ToString(declarator.node).startsWith("$")) {
                // ignore variable declaration starts with $
                return;
            }

            const init = declarator.get("init");
            if (init.isIdentifier() && init.node.name === "props") {
                //@ts-ignore
                <HandleProps />;
            } else {
                translated.push(each.node);
            }
        } else if (!IsTemplate(each)) {
            translated.push(each.node);
        }
    });
    return translated.map(each => `${ToString(each, { comments: false })}`).join("\n");
}

function HandleProps(declarator: NodePath<VariableDeclaration>, translated: Array<Statement>) {
    const id = declarator.get("id") as NodePath<LVal>;
    if (id.isObjectPattern()) {
        const raw_props = id.get("properties");
        const props_info = raw_props.map((each: NodePath<ObjectProperty>) => {
            const key = (each.node.key as Identifier).name as string;
            let value = null;

            const raw_value = each.get("value");
            if (raw_value.isAssignmentPattern()) {
                value = ToString(raw_value.node.right);
            }

            return {
                key,
                value,
            };
        });

        const props_init = props_info.map(each => {
            const value = each.value === null ? "" : ` = ${each.value}`;
            return ToAst(`export let ${each.key}${value};`) as VariableDeclaration;
        });

        translated.push(...props_init);
    }
}
