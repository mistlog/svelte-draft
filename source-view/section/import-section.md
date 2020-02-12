```typescript
export function TranslateImport(statements: Array<NodePath<ImportDeclaration>>) {
    const translated: Array<Statement> = [];
    statements.forEach(each => {
        //
        const node = each.node;
        const import_from = node.source.value;

        // for functions such as store auto subscription: AutoSubscribe

        // remove them, because they are just "type provider"
        if (import_from.includes("svelte-types")) {
            return;
        }
        translated.push(node);
    });
    return translated.map(each => `${ToString(each, { comments: false })}`).join("\n");
}
```