import { SvelteTranscriber } from "../../src";

describe("translate script section", () =>
{
    test("extrat script from code", () =>
    {
        const code = `
            export default function App()
            {
                let name = 'world';
                
                //@ts-ignore
                <UI/>;
            }

            function UI(name: string)
            {
                <h1>Hello {name.toUpperCase()}!</h1>;
            }
        `;

        SnapshotTest(code);
    })

    test("track change", () =>
    {
        const code = `
            export default function App()
            {
                let count = 0;
                let doubled = 0;
            
                //@ts-ignore
                <TrackChange />;
            }
            
            function TrackChange(doubled: number, count: number)
            {
                "use watch";
                doubled = count * 2;
            }
        `;

        SnapshotTest(code);
    })


})

describe("translate props", () =>
{
    test("use {} to get props", () =>
    {
        const code = `
            export interface INestedProps
            {
                answer: number;
                question: string;
            }
            
            export default function Nested(props: INestedProps)
            {
                const { answer, question } = props;
            
                <p>The answer is {answer}</p>
            }
        `;

        SnapshotTest(code);
    })

    test("handle default prop", () =>
    {
        const code = `
            export interface INestedProps
            {
                answer: number;
            }
            
            export default function Nested(props: INestedProps)
            {
                const { answer = 42 } = props;
            
                <p>The answer is {answer}</p>
            }
        `;

        SnapshotTest(code);
    })

    test("get props on demand", () =>
    {
        const code = `
            export interface INestedProps
            {
                answer: number;
                question: string;
            }
            
            export default function Nested(props: INestedProps)
            {
                const { answer = 42 } = props;
            
                <p>The answer is {answer}</p>;

                // ... 

                const { question } = props;

                <p>The question is {question}</p>;
            }
        `;

        SnapshotTest(code);
    })
})

function SnapshotTest(code: string)
{
    const { script_section } = new SvelteTranscriber(code).TranscribeToSections();
    expect(script_section).toMatchSnapshot();
}