import { NodePath } from "@babel/core";
import { JSXText, ObjectProperty, JSXElement, JSXExpressionContainer } from "@babel/types";
import { ToString } from "typedraft";
import { OpeningElementVisitor } from "./opening-element-visitor";
import { ClosingElementVisitor } from "./closing-element-visitor";
import { JSXExpressionContainerVisitor } from "./jsx-expression-container-visitor";

export class TagGenerator {
    m_Tag: NodePath<JSXElement>;
    m_Fragments: Array<string>;
}

<TagGenerator /> +
    function Generate(this: TagGenerator & IGenerator) {
        this.TraverseTag(this.m_Tag);
        return this.m_Fragments.join("");
    };

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

export interface IGenerator {
    Append: (fragment: string) => void;
    TraverseTag: (tag: NodePath<JSXElement>) => void;
    TraverseText: (text: NodePath<JSXText>) => void;
}

<TagGenerator /> +
    function Append(this: TagGenerator, fragment: string) {
        this.m_Fragments.push(fragment);
    };

<TagGenerator /> +
    function TraverseText(this: TagGenerator & IGenerator, text: NodePath<JSXText>) {
        // don't use toString/ToString, which swallows whitespace
        this.Append(text.node.value);
    };

<TagGenerator /> +
    function constructor(this: TagGenerator, tag: NodePath<JSXElement>) {
        this.m_Tag = tag;
        this.m_Fragments = [];
    };
