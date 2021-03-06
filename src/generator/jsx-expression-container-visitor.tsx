import { IGenerator } from "./generator";
import { NodePath } from "@babel/core";
import {
    ArrayExpression,
    ObjectProperty,
    CallExpression,
    MemberExpression,
    ArrowFunctionExpression,
    JSXAttribute,
    JSXElement,
    JSXExpressionContainer,
} from "@babel/types";
import { ToString } from "typedraft";

export class JSXExpressionContainerVisitor {}

<JSXExpressionContainerVisitor /> +
    function Visit(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
        //
        if (!container.parentPath.isJSXElement()) return;

        //
        const name = container.parentPath.get("openingElement").get("name");
        if (!name.isJSXIdentifier()) return;

        //
        const tag_name = name.node.name;
        //@ts-ignore
        <HandleContainer />;
    };

function HandleContainer(tag_name: string) {
    "use match";

    //@ts-ignore
    (tag_name: "each") => <HandleEach />;

    //@ts-ignore
    (tag_name: "await") => <HandleAwait />;

    //@ts-ignore
    (tag_name: "debug") => <HandleDebug />;

    //@ts-ignore
    (tag_name: "raw-html") => <HandleRawHTML />;

    //@ts-ignore
    () => <HandleDefault />;
}

function HandleRawHTML(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
    // exclude "{" and "}" by using container.expression.node instead of container.node
    const node = container.get("expression").node;
    generator.Append(ToString(node));
}

function HandleDebug(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
    const to_debug = (container.get("expression") as NodePath<ArrayExpression>).get("elements");
    const variable_list = to_debug.map(each => ToString(each.node)).join(", ");
    generator.Append(variable_list);
}

function HandleAwait(container: NodePath<JSXExpressionContainer>) {
    //
    const info = container.get("expression");
    if (!info.isObjectExpression()) return;
    const props = info.get("properties");

    //
    const loading = props.find(
        prop => prop.isObjectProperty() && prop.node.key.name === "loading"
    ) as NodePath<ObjectProperty>;
    //@ts-ignore
    <HandleLoading />;

    //
    const promise = props.find(
        prop => prop.isObjectProperty() && prop.node.key.name === "promise"
    ) as NodePath<ObjectProperty>;
    //@ts-ignore
    <HandlePromise />;
}

function HandleLoading(loading: NodePath<ObjectProperty>, generator: IGenerator) {
    const loading_jsx = loading?.get("value") as NodePath<JSXElement>;
    if (loading_jsx) {
        generator.TraverseTag(loading_jsx);
    }
}

function HandlePromise(promise: NodePath<ObjectProperty>, generator: IGenerator) {
    const promise_js = promise.get("value") as NodePath<CallExpression>;

    /**
     * promise usage:
     * 1. promise.then(arg_first).catch(arg_last)
     * 2. promise.then(arg_last)
     */
    const [arg_last] = promise_js.get("arguments") as [NodePath<ArrowFunctionExpression>];
    const callee = promise_js.get("callee") as NodePath<MemberExpression>;
    const object = callee.get("object");

    if (object.isIdentifier()) {
        // only then exist, arg_last is then
        TraversePromiseClause("then", arg_last, generator);
    } else if (object.isCallExpression()) {
        // arg_last is catch, then & catch exist, to find then:
        const [arg_first] = object.get("arguments") as [NodePath<ArrowFunctionExpression>];
        TraversePromiseClause("then", arg_first, generator);
        TraversePromiseClause("catch", arg_last, generator);
    }
}

function TraversePromiseClause(
    name: string,
    path: NodePath<ArrowFunctionExpression>,
    generator: IGenerator
) {
    const jsx = path.get("body") as NodePath<JSXElement>;
    const clause = `{:${name} ${path.get("params").toString()}}`;
    generator.Append("\n");
    generator.Append(clause);
    generator.Append("\n");
    generator.TraverseTag(jsx);
}

function HandleEach(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
    const expression = container.get("expression");
    if (expression.isArrowFunctionExpression()) {
        generator.TraverseTag(expression.get("body") as NodePath<JSXElement>);
    }
}

function HandleDefault(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
    const expression = container.get("expression");

    // use slot props
    if (expression.isArrowFunctionExpression()) {
        generator.TraverseTag(expression.get("body") as NodePath<JSXElement>);
    } else {
        generator.Append(ToString(container.node));
    }
}
