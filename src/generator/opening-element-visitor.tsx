import { IGenerator } from "./generator";
import { NodePath, Node } from "@babel/core";
import {
    ObjectPattern,
    identifier,
    jsxExpressionContainer,
    jsxAttribute,
    Identifier,
    ObjectExpression,
    stringLiteral,
    CallExpression,
    ObjectProperty,
    JSXOpeningElement,
    jsxNamespacedName,
    jsxIdentifier,
    JSXAttribute,
    JSXElement,
    JSXExpressionContainer,
} from "@babel/types";
import { ToString, ToAst } from "typedraft";

export class OpeningElementVisitor {}

<OpeningElementVisitor /> +
    function Visit(e: NodePath<JSXOpeningElement>, generator: IGenerator) {
        //@ts-ignore
        <HandleSlotProps />;

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
    };

const TargetTable = {
    DoubleClick: "dblclick",
    InnerHTML: "innerHTML",
    contentEditable: "contenteditable",
    Ref: "this",
    ScrollY: "scrollY",
};

const NamespaceList = ["on", "bind"];

const DirectiveSet = new Set(["transition", "in", "out", "localTransition", "animate", "use"]);

function HandleAttributes(e: NodePath<JSXOpeningElement>) {
    //@ts-ignore
    <PreprocessAttributes />;

    e.node.attributes.forEach(attr => {
        if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier") {
            const name = attr.name.name;

            if (DirectiveSet.has(name)) {
                //@ts-ignore
                <HandleDirective />;
            } else {
                //@ts-ignore
                <HandleNamespace />;
            }
        }
    });
}

function PreprocessAttributes(e: NodePath<JSXOpeningElement>) {
    e.node.attributes = e.node.attributes.reduce((container, attr) => {
        if (
            attr.type === "JSXAttribute" &&
            attr.name.type === "JSXIdentifier" &&
            (attr.name.name === "on" || attr.name.name === "props")
        ) {
            const value = attr.value as JSXExpressionContainer;
            const config = value.expression as CallExpression;
            const [event_config] = config.arguments as [ObjectExpression];
            const properties = event_config.properties as Array<ObjectProperty>;
            properties.forEach(each => {
                //
                const prop: string = (each.key as Identifier).name;
                const prop_value: string = ToString(each.value);

                //
                const prefix = attr.name.name === "on" ? "on" : "";
                const name = jsxIdentifier(`${prefix}${prop}`);
                const value = stringLiteral(`{${prop_value}}`);
                container.push(jsxAttribute(name, value));
            });
        } else {
            container.push(attr);
        }

        return container;
    }, []);
}

const VerticalBar = "$VERTICAL_BAR$";

function HandleDirective(attr: JSXAttribute) {
    const value = attr.value as JSXExpressionContainer;
    const config = value.expression as CallExpression;

    // use compact to avoid \n in params after ToString
    const args = config.arguments.map(arg => ToString(arg, { compact: true }));
    const [transition_function, transition_params] = args;

    // use VerticalBar and replace it with | latter because | is invalid in JSX
    let namespace = name === "localTransition" ? `transition` : name;
    let function_name =
        name === "localTransition"
            ? `${transition_function}${VerticalBar}local`
            : transition_function;
    attr.name = jsxNamespacedName(jsxIdentifier(namespace), jsxIdentifier(function_name));
    attr.value = transition_params ? stringLiteral(`{${transition_params}}`) : null;
}

function HandleNamespace(attr: JSXAttribute, name: string) {
    NamespaceList.forEach(namespace => {
        if (TargetTable[name]) {
            attr.name = jsxIdentifier(TargetTable[name]);
        } else if (name.startsWith(namespace)) {
            const raw_target = name.substr(namespace.length);
            const target = TargetTable[raw_target] || raw_target.toLowerCase();
            attr.name = jsxNamespacedName(jsxIdentifier(namespace), jsxIdentifier(target));
        }
    });
}

function HandleOpeningElement(tag_name: string) {
    "use match";

    //@ts-ignore
    (tag_name: "debug") => {
        <HandleDebug />;
    };

    //@ts-ignore
    (tag_name: "raw-html") => {
        <HandleRawHTML />;
    };

    //@ts-ignore
    (tag_name: "if") => {
        <HandleIf />;
    };

    //@ts-ignore
    (tag_name: "else") => {
        <HandleElse />;
    };

    //@ts-ignore
    (tag_name: "each") => {
        <HandleEach />;
    };

    //@ts-ignore
    (tag_name: "await") => {
        <HandleAwait />;
    };

    //@ts-ignore
    () => {
        <HandleDefault />;
    };
}

function HandleDefault(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    // handle special elements
    const tag_name = e.get("name");
    if (tag_name.isJSXIdentifier() && tag_name.node.name.startsWith("svelte")) {
        tag_name.node.name = (tag_name.node.name as string).replace("-", ":");
    }

    //
    let element = ToString(e.node);

    // handle |
    element = element.replace(VerticalBar, "|");
    Append(element);
}

function HandleDebug(Append: (value: string) => void) {
    Append(`{@debug `);
}

function HandleRawHTML(Append: (value: string) => void) {
    Append(`{@html `);
}

function HandleIf(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    const raw_condition = FindAttribute("condition", e)?.node;

    const condition = raw_condition
        ? ToString((raw_condition.value as JSXExpressionContainer).expression)
        : "__invalid condition__";

    const _if = `{#if ${condition}}`;
    Append(_if);
}

function HandleElse(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    const raw_condition = FindAttribute("condition", e)?.node;

    const condition = raw_condition
        ? ` if ${ToString((raw_condition.value as JSXExpressionContainer).expression)}`
        : "";

    const _else = `{:else${condition}}`;
    Append(_else);
}

function HandleSlotProps(e: NodePath<JSXOpeningElement>) {
    const slot_props = FindChildJSXExpressionContainer(e)
        ?.get("expression")
        ?.get("params")
        .find(each => each.isObjectPattern()) as NodePath<ObjectPattern>;
    if (slot_props) {
        const properties = slot_props.node.properties as Array<ObjectProperty>;
        properties.forEach(each => {
            const prop: string = (each.key as Identifier).name;
            const alias: string = ToString(each.value);

            const name = jsxNamespacedName(jsxIdentifier("let"), jsxIdentifier(prop));
            const value = jsxExpressionContainer(identifier(alias));
            e.node.attributes.push(jsxAttribute(name, value));
        });
    }
}

function HandleEach(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    const raw_from = FindAttribute("from", e)?.node;

    const data = raw_from
        ? ToString((raw_from.value as JSXExpressionContainer).expression)
        : "__invalid data__";

    //
    const container = FindChildJSXExpressionContainer(e);
    if (!container) return;

    //
    const item = container.get("expression");
    if (!item.isArrowFunctionExpression()) return;

    //
    const [value, index, key] = item.get("params").map(param => {
        if (param.isIdentifier()) {
            return param.node.name;
        } else if (param.isAssignmentPattern()) {
            return { is_key: true, key_name: ToString(param.get("right").node) };
        }
    });

    // if we specify value, key only, key info is stored in index
    const item_part = `#each ${data} as ${value || "__invalid value__"}`;
    const index_part = index ? (index.is_key ? ` (${index.key_name})` : `, ${index}`) : "";
    const key_part = key ? ` (${key.key_name})` : "";

    const each = `{${item_part}${index_part}${key_part}}`;
    Append(each);
}

function HandleAwait(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    //
    const container = FindChildJSXExpressionContainer(e);
    if (!container) return;

    const info = container.get("expression");
    if (!info.isObjectExpression()) return;

    //
    const props = info.get("properties");
    const promise = props.find(
        prop => prop.isObjectProperty() && prop.node.key.name === "promise"
    ) as NodePath<ObjectProperty>;
    const promise_name = `${ToString(promise.node.value).split(".")[0]}`;

    //
    const _await = `{#await ${promise_name}}`;
    Append(_await);
}

/*
 */
function FindAttribute(name: string, e: NodePath<JSXOpeningElement>) {
    const attribute_list = e.get("attributes").filter(each => each.isJSXAttribute()) as Array<
        NodePath<JSXAttribute>
    >;
    const attribute = attribute_list.find(
        attr => attr.get("name").isJSXIdentifier() && attr.get("name").node.name === name
    );
    return attribute;
}

function FindChildJSXExpressionContainer(e: NodePath<JSXOpeningElement>) {
    const tag = e.parentPath as NodePath<JSXElement>;
    const container = tag.get("children").find(each => each.isJSXExpressionContainer()) as NodePath<
        JSXExpressionContainer
    >;
    return container;
}
