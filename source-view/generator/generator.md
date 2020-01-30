```typescript
export class TagGenerator {
    m_Tag: NodePath<JSXElement>;
    m_Fragments: Array<string>;
}
```

```typescript
<TagGenerator /> +
    function Generate(this: TagGenerator & IGenerator) {
        this.TraverseTag(this.m_Tag);
        return this.m_Fragments.join("");
    };
```

```typescript
<TagGenerator /> +
    function TraverseTag(this: TagGenerator & IGenerator, tag: NodePath<JSXElement>) {
        new OpeningElementVisitor().Visit(tag.get("openingElement"), this);
        tag.get("children").forEach(each => {
            if (each.isJSXElement()) {
                this.TraverseTag(each);
            } else if (each.isJSXText()) {
                this.TraverseText(each);
            } else if (each.isJSXExpressionContainer()) {
                new JSXExpressionContainerVisitor().Visit(each, this);
            }
        });
        new ClosingElementVisitor().Visit(tag.get("closingElement"), this);
    };
```

```typescript
export interface IGenerator {
    Append: (fragment: string) => void;
    TraverseTag: (tag: NodePath<JSXElement>) => void;
    TraverseText: (text: NodePath<JSXText>) => void;
}
```

```typescript
<TagGenerator /> +
    function Append(this: TagGenerator, fragment: string) {
        this.m_Fragments.push(fragment);
    };
```

```typescript
<TagGenerator /> +
    function TraverseText(this: TagGenerator & IGenerator, text: NodePath<JSXText>) {
        // don't use toString/ToString, which swallows whitespace
        this.Append(text.node.value);
    };
```

```typescript
<TagGenerator /> +
    function constructor(this: TagGenerator, tag: NodePath<JSXElement>) {
        this.m_Tag = tag;
        this.m_Fragments = [];
    };
```