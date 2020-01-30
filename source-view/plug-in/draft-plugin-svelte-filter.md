```typescript
export class SvelteFilterPlugin {
    m_Transcriber: ISvelteTranscriber;
}
```

```typescript
<SvelteFilterPlugin /> +
    function Transcribe(this: SvelteFilterPlugin) {
        this.m_Transcriber.m_Path.node.body = this.m_Transcriber.m_Path
            .get("body")
            .filter(each => each.isExportDefaultDeclaration() || each.isImportDeclaration())
            .map(each => each.node);
    };
```

```typescript
<SvelteFilterPlugin /> +
    function constructor(this: SvelteFilterPlugin, transcriber: ISvelteTranscriber) {
        this.m_Transcriber = transcriber;
    };
```