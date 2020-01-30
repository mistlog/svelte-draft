import * as prettier from "prettier";

export function FormatTemplate(code: string)
{
    return prettier.format(code, {
        parser: "html",
        htmlWhitespaceSensitivity: "ignore"
    });
}