import { SvelteTranscriber } from "../../src";

describe("translate import section", () =>
{
    test("extrat import from code", () =>
    {
        const code = `
            import Nested from "./Nested";

            export default function App()
            {
                let name = "";
                
                <p>This is a paragraph.</p>;
                <Nested/>;
            }
        `;

        const { import_section } = new SvelteTranscriber(code).TranscribeToSections();
        expect(import_section).toMatchSnapshot();
    })

    test("remove ts related import", () =>
    {
        const code = `
            import {ITest, Test} from "./Nested";

            export default function App()
            {
                const test1: ITest = {};
                const test2 = new Test();
            }
        `;

        const { import_section } = new SvelteTranscriber(code).TranscribeToSections();
        expect(import_section).toMatchSnapshot();
    })
})