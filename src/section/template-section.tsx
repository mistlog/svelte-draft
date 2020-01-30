import { BlockStatement, JSXElement, Statement } from "@babel/types";
import { NodePath } from "@babel/core";
import { TagGenerator } from "../generator/generator";

export function TranslateTemplate(body: NodePath<BlockStatement>)
{
    const template: Array<NodePath<JSXElement>> = body
        .get("body")
        .filter(each => IsTemplate(each))
        .map(each => each.get("expression") as NodePath<JSXElement>);

    const translated: Array<string> = template.map(each => new TagGenerator(each).Generate());
    return translated.join("\n");
}

export function IsTemplate(statement: NodePath<Statement>)
{
    return statement.isExpressionStatement() && statement.get("expression").isJSXElement()
}