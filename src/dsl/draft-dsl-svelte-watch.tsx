import { IDSL } from "typedraft";
import {
    Statement,
    labeledStatement,
    blockStatement,
    identifier,
    isExpressionStatement,
    isStringLiteral,
} from "@babel/types";

export class SvelteWatch implements IDSL {
    m_Merge: boolean;
    constructor() {
        this.m_Merge = true;
    }

    Transcribe(block: Array<Statement>): Array<Statement> {
        const [use_watch, ...rest] = block;
        let to_watch = block;
        if (isExpressionStatement(use_watch) && isStringLiteral(use_watch.expression)) {
            // we are in inline watch
            to_watch = rest;
        }
        return [labeledStatement(identifier("$"), blockStatement(to_watch))];
    }
}
