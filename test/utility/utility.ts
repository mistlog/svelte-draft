import * as prettier from "prettier";

export function FormatTemplate(code: string)
{
    try {
        /**
         * prettier bug?: Unexpected closing tag "div"
         * <div class={active ? "active" : ""}></div>
         */
        return prettier.format(code, {
            parser: "html",
            htmlWhitespaceSensitivity: "ignore"
        });
    } catch (error) {
        return code;
    }
}