import { IDSL } from "typedraft";
import { Statement, labeledStatement, blockStatement, identifier } from "@babel/types";

export class SvelteWatch implements IDSL {
    Transcribe(block: Array<Statement>): Array<Statement> {
        return [labeledStatement(identifier("$"), blockStatement(block))];
    }
}
