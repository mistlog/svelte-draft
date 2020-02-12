```typescript
export class JSXExpressionContainerVisitor {}
```

```typescript
<JSXExpressionContainerVisitor /> +
    function Visit(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
        //
        if (!container.parentPath.isJSXElement()) return;

        //
        const name = container.parentPath.get("openingElement").get("name");
        if (!name.isJSXIdentifier()) return;

        //
        const tag_name = name.node.name;
        <HandleContainer />;
    };
```

```typescript
function HandleContainer(tag_name: string) {
    "use match";
    (tag_name: "each") => {
        <HandleEach />;
    };
    (tag_name: "await") => {
        <HandleAwait />;
    };
    (tag_name: "debug") => {
        <HandleDebug />;
    };
    () => {
        <HandleDefault />;
    };
}
```

```typescript
function HandleDebug(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
    const to_debug = (container.get("expression") as NodePath<ArrayExpression>).get("elements");
    const variable_list = to_debug.map(each => ToString(each.node)).join(", ");
    generator.Append(variable_list);
}
```

```typescript
function HandleAwait(container: NodePath<JSXExpressionContainer>) {
    //
    const info = container.get("expression");
    if (!info.isObjectExpression()) return;
    const props = info.get("properties");

    //
    const loading = props.find(prop => prop.isObjectProperty() && prop.node.key.name === "loading") as NodePath<ObjectProperty>;
    <HandleLoading />;

    //
    const promise = props.find(prop => prop.isObjectProperty() && prop.node.key.name === "promise") as NodePath<ObjectProperty>;
    <HandlePromise />;
}
```

```typescript
function HandleLoading(loading: NodePath<ObjectProperty>, generator: IGenerator) {
    const loading_jsx = loading?.get("value") as NodePath<JSXElement>;
    if (loading_jsx) {
        generator.TraverseTag(loading_jsx);
    }
}
```

```typescript
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
```

```typescript
function TraversePromiseClause(name: string, path: NodePath<ArrowFunctionExpression>, generator: IGenerator) {
    const jsx = path.get("body") as NodePath<JSXElement>;
    const clause = `{:${name} ${path.get("params").toString()}}`;
    generator.Append("\n");
    generator.Append(clause);
    generator.Append("\n");
    generator.TraverseTag(jsx);
}
```

```typescript
function HandleEach(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
    const expression = container.get("expression");
    if (expression.isArrowFunctionExpression()) {
        generator.TraverseTag(expression.get("body") as NodePath<JSXElement>);
    }
}
```

```typescript
function HandleDefault(container: NodePath<JSXExpressionContainer>, generator: IGenerator) {
    const expression = container.get("expression");

    // use slot props
    if (expression.isArrowFunctionExpression()) {
        generator.TraverseTag(expression.get("body") as NodePath<JSXElement>);
    } else {
        generator.Append(ToString(container.node));
    }
}
```