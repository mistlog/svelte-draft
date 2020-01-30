```typescript
export class SvelteWatch implements IDSL {
    Transcribe(block: Array<Statement>): Array<Statement> {
        return [labeledStatement(identifier("$"), blockStatement(block))];
    }
}
```