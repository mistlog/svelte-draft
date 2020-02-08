```typescript
export function TranslateImport(statements: Array<NodePath<ImportDeclaration>>) {
    const translated: Array<Statement> = [];
    statements.forEach(each => {
        //
        const node = each.node;
        const cloned = cloneDeep(node);
        const import_from = cloned.source.value;

        // for store auto subscription function AutoSubscribe
        if (import_from.includes("svelte-types")) {
            return;
        }

        //
        if (import_from.startsWith(".") || import_from.startsWith("..")) {
            cloned.source.value = import_from.replace(".tsx", "");
        }
        translated.push(cloned);
    });
    return translated.map(each => `${ToString(each, { comments: false })}`).join("\n");
}
```