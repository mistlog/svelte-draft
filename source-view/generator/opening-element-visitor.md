```typescript
export class OpeningElementVisitor {}
```

```typescript
<OpeningElementVisitor /> +
    function Visit(e: NodePath<JSXOpeningElement>, generator: IGenerator) {
        <HandleSlotProps />;
        <HandleAttributes />;

        //
        const name = e.get("name");
        if (!name.isJSXIdentifier()) return;

        //
        const Append = generator.Append.bind(generator);
        const tag_name = name.node.name;
        <HandleOpeningElement />;
    };
```

```typescript
const TargetTable = { DoubleClick: "dblclick", InnerHTML: "innerHTML", contentEditable: "contenteditable", Ref: "this" };
```

```typescript
const NamespaceList = ["on", "bind"];
```

```typescript
const DirectiveSet = new Set(["transition", "in", "out", "localTransition", "animate", "use"]);
```

```typescript
function HandleAttributes(e: NodePath<JSXOpeningElement>) {
    <PreprocessAttributes />;
    e.node.attributes.forEach(attr => {
        if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier") {
            const name = attr.name.name;
            if (DirectiveSet.has(name)) {
                <HandleDirective />;
            } else {
                <HandleNamespace />;
            }
        }
    });
}
```

```typescript
function PreprocessAttributes(e: NodePath<JSXOpeningElement>) {
    e.node.attributes = e.node.attributes.reduce((container, attr) => {
        if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier" && (attr.name.name === "on" || attr.name.name === "props")) {
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
```

```typescript
const VerticalBar = "$VERTICAL_BAR$";
```

```typescript
function HandleDirective(attr: JSXAttribute) {
    const value = attr.value as JSXExpressionContainer;
    const config = value.expression as CallExpression;

    // use compact to avoid \n in params after ToString
    const args = config.arguments.map(arg => ToString(arg, { compact: true }));
    const [transition_function, transition_params] = args;

    // use VerticalBar and replace it with | latter because | is invalid in JSX
    let namespace = name === "localTransition" ? `transition` : name;
    let function_name = name === "localTransition" ? `${transition_function}${VerticalBar}local` : transition_function;
    attr.name = jsxNamespacedName(jsxIdentifier(namespace), jsxIdentifier(function_name));
    attr.value = transition_params ? stringLiteral(`{${transition_params}}`) : null;
}
```

```typescript
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
```

```typescript
function HandleOpeningElement(tag_name: string) {
    "use match";
    (tag_name: "if") => {
        <HandleIf />;
    };
    (tag_name: "else") => {
        <HandleElse />;
    };
    (tag_name: "each") => {
        <HandleEach />;
    };
    (tag_name: "await") => {
        <HandleAwait />;
    };
    () => {
        <HandleDefault />;
    };
}
```

```typescript
function HandleDefault(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    //
    let element = ToString(e.node);

    // handle |
    element = element.replace(VerticalBar, "|");
    Append(element);
}
```

```typescript
function HandleIf(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    const raw_condition = FindAttribute("condition", e)?.node;
    const condition = raw_condition ? ToString((raw_condition.value as JSXExpressionContainer).expression) : "__invalid condition__";
    const _if = `{#if ${condition}}`;
    Append(_if);
}
```

```typescript
function HandleElse(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    const raw_condition = FindAttribute("condition", e)?.node;
    const condition = raw_condition ? ` if ${ToString((raw_condition.value as JSXExpressionContainer).expression)}` : "";
    const _else = `{:else${condition}}`;
    Append(_else);
}
```

```typescript
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
```

```typescript
function HandleEach(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
    const raw_from = FindAttribute("from", e)?.node;
    const data = raw_from ? ToString((raw_from.value as JSXExpressionContainer).expression) : "__invalid data__";

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
```

```typescript
function HandleAwait(e: NodePath<JSXOpeningElement>, Append: (value: string) => void) {
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
```



```typescript
function FindAttribute(name: string, e: NodePath<JSXOpeningElement>) {
    const attribute_list = e.get("attributes").filter(each => each.isJSXAttribute()) as Array<NodePath<JSXAttribute>>;
    const attribute = attribute_list.find(attr => attr.get("name").isJSXIdentifier() && attr.get("name").node.name === name);
    return attribute;
}
```

```typescript
function FindChildJSXExpressionContainer(e: NodePath<JSXOpeningElement>) {
    const tag = e.parentPath as NodePath<JSXElement>;
    const container = tag.get("children").find(each => each.isJSXExpressionContainer()) as NodePath<JSXExpressionContainer>;
    return container;
}
```