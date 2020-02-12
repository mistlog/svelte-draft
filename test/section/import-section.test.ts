import { SvelteTranscriber } from "../../src";

describe("translate import section", () =>
{
    test("extrat import from code", () =>
    {
        const code = `
            import Nested from "./Nested.svelte";
            import { count as $count } from "./store.js";

            export default function App()
            {
                let name = "";
                console.log($count);
                
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
            import {ITest, Test} from "./Nested.svelte";

            export default function App()
            {
                const test1: ITest = {};
                const test2 = new Test();
            }
        `;

        const { import_section } = new SvelteTranscriber(code).TranscribeToSections();
        expect(import_section).toMatchSnapshot();
    })

    test("remove ts related import", () =>
    {
        const code = `
            import { count } from "./store.js";
            import { AutoSubscribe } from "svelte-types";

            export default function App($count = AutoSubscribe(count))
            {
                <div>{$count}</div>
            }
        `;

        const { import_section } = new SvelteTranscriber(code).TranscribeToSections();
        expect(import_section).toMatchSnapshot();
    })
})