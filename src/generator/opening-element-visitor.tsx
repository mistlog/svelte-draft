import { IGenerator } from "./generator";
import { NodePath } from "@babel/core";
import { ObjectProperty, JSXOpeningElement, jsxNamespacedName, jsxIdentifier, JSXAttribute, JSXElement, JSXExpressionContainer } from "@babel/types";
import { ToString } from "typedraft";

export class OpeningElementVisitor { }

<OpeningElementVisitor /> + function Visit(e: NodePath<JSXOpeningElement>, generator: IGenerator)
{
    //@ts-ignore
    <HandleAttributes />;

    //
    const name = e.get("name");
    if (!name.isJSXIdentifier()) return;

    //
    const Append = generator.Append.bind(generator);
    const tag_name = name.node.name;

    //@ts-ignore
    <HandleOpeningElement />;
}

const TargetTable = {
    "DoubleClick": "dblclick"
}

const NamespaceList = [
    "on", "bind"
]

function HandleAttributes(e: NodePath<JSXOpeningElement>)
{
    e.node.attributes.forEach(attr =>
    {
        if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier")
        {
            const name = attr.name.name;
            NamespaceList.forEach(namespace =>
            {
                if (name.startsWith(namespace))
                {
                    const raw_target = name.substr(namespace.length);
                    const target = TargetTable[raw_target] || raw_target.toLowerCase();
                    attr.name = jsxNamespacedName(jsxIdentifier(namespace), jsxIdentifier(target));
                }
            })
        }
    })
}

function HandleOpeningElement(tag_name: string)
{
    "use match";

    //@ts-ignore
    (tag_name: "if") => { <HandleIf /> }

    //@ts-ignore
    (tag_name: "else") => { <HandleElse /> }

    //@ts-ignore
    (tag_name: "each") => { <HandleEach /> }

    //@ts-ignore
    (tag_name: "await") => { <HandleAwait /> }

    //@ts-ignore
    () => { <HandleDefault /> }
}

function HandleDefault(e: NodePath<JSXOpeningElement>, Append: (value: string) => void)
{
    Append(ToString(e.node));
}

function HandleIf(e: NodePath<JSXOpeningElement>, Append: (value: string) => void)
{
    const raw_condition = FindAttribute("condition", e)?.node;

    const condition = raw_condition ?
        ToString((raw_condition.value as JSXExpressionContainer).expression) :
        "__invalid condition__";

    const _if = `{#if ${condition}}`;
    Append(_if);
}

function HandleElse(e: NodePath<JSXOpeningElement>, Append: (value: string) => void)
{
    const raw_condition = FindAttribute("condition", e)?.node;

    const condition = raw_condition ?
        ` if ${ToString((raw_condition.value as JSXExpressionContainer).expression)}` :
        "";

    const _else = `{:else${condition}}`;
    Append(_else);
}

function HandleEach(e: NodePath<JSXOpeningElement>, Append: (value: string) => void)
{
    const raw_from = FindAttribute("from", e)?.node;

    const data = raw_from ?
        ToString((raw_from.value as JSXExpressionContainer).expression) :
        "__invalid data__";

    //
    const container = FindChildJSXExpressionContainer(e);
    if (!container) return;

    //
    const item = container.get("expression");
    if (!item.isArrowFunctionExpression()) return;

    //
    const [value, index, key] = item.get("params").map(param =>
    {
        if (param.isIdentifier())
        {
            return param.node.name;
        }
        else if (param.isAssignmentPattern())
        {
            return { is_key: true, key_name: ToString(param.get("right").node) };
        }
    })

    // if we specify value, key only, key info is stored in index
    const item_part = `#each ${data} as ${value || "__invalid value__"}`;
    const index_part = index ? (index.is_key ? ` (${index.key_name})}` : `, ${index}`) : "";
    const key_part = key ? ` (${key.key_name})` : "";

    const each = `{${item_part}${index_part}${key_part}}`;
    Append(each);
}

function HandleAwait(e: NodePath<JSXOpeningElement>, Append: (value: string) => void)
{
    //
    const container = FindChildJSXExpressionContainer(e);
    if (!container) return;

    const info = container.get("expression");
    if (!info.isObjectExpression()) return;

    //
    const props = info.get("properties");
    const promise = props.find(prop => prop.isObjectProperty() && prop.node.key.name === "promise") as NodePath<ObjectProperty>;
    const promise_name = `${ToString(promise.node.value).split(".")[0]}`;

    //
    const _await = `{#await ${promise_name}}`;
    Append(_await);
}

/*
*/
function FindAttribute(name: string, e: NodePath<JSXOpeningElement>)
{
    const attribute_list = e.get("attributes").filter(each => each.isJSXAttribute()) as Array<NodePath<JSXAttribute>>;
    const attribute = attribute_list.find(attr => attr.get("name").isJSXIdentifier() && attr.get("name").node.name === name);
    return attribute;
}

function FindChildJSXExpressionContainer(e: NodePath<JSXOpeningElement>)
{
    const tag = e.parentPath as NodePath<JSXElement>;
    const container = tag.get("children").find(each => each.isJSXExpressionContainer()) as NodePath<JSXExpressionContainer>;
    return container;
}