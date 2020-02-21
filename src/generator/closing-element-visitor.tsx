import { IGenerator } from "./generator";
import { NodePath } from "@babel/core";
import { JSXIdentifier, JSXClosingElement, jsxNamespacedName, jsxIdentifier, JSXAttribute, JSXElement, JSXExpressionContainer } from "@babel/types";
import { ToString } from "typedraft";

export class ClosingElementVisitor { }

<ClosingElementVisitor /> + function Visit(e: NodePath<JSXClosingElement>, generator: IGenerator)
{
    //
    if (!e || !e.node) return;

    //
    const name = e.get("name");
    if (!name.isJSXIdentifier()) return;

    //
    const Append = generator.Append.bind(generator);
    const tag_name = name.node.name;

    //@ts-ignore
    <HandleClosingElement />
}

function HandleClosingElement(tag_name: string, e: NodePath<JSXClosingElement>, Append: (value: string) => void)
{
    "use match";

    (tag_name: "if" | "each" | "await") => Append(`{/${tag_name}}`);
    (tag_name: "else") => Append("");
    (tag_name: "debug" | "raw-html") => Append("}");
    () => Append(ToString(e.node));
}

