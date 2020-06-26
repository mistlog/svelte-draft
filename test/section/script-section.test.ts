import { SvelteTranscriber } from "../../src";

describe("translate script section", () => {
    test("extrat script from code", () => {
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
    });

    test("track change", () => {
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
    });

    test("ignore variable declaration starts with $", () => {
        const code = `
            export default function App()
            {
                let greeting = 'hello';
                let $name = 'world';
            }
        `;

        SnapshotTest(code);
    });
});

describe("translate props", () => {
    test("use {} to get props", () => {
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
    });

    test("handle default prop", () => {
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
    });

    test("get props on demand", () => {
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
    });
});

describe("module context", () => {
    test("extract module context", () => {
        const code = `
            const elements = new Set();

            // result should be js code
            const a : number = 1;
            
            export function stopAll() {
                elements.forEach(element => {
                    element.pause();
                });
            }
            
            export default function AudioPlayer()
            {
                <LocalContext/>;
                console.log("in component");
            }

            // local context is not included
            function LocalContext()
            {
                console.log("in local context")
            }
        `;

        SnapshotTestModuleContext(code);
    });

    test("extract module context: module context is empty", () => {
        const code = `
            export default function AudioPlayer()
            {
                <LocalContext/>;
                console.log("in component");
            }

            function LocalContext()
            {
                console.log("in local context")
            }
        `;

        SnapshotTestModuleContext(code);
    });

    test("extract module context: with import", () => {
        const code = `
            import sum from "./sum.js";
            import greeting from "./greeting.js";
            
            console.log(sum());
            
            export default function AudioPlayer()
            {
                console.log(greeting());
            }
        `;

        SnapshotTestModuleContext(code);
    });
});

function SnapshotTest(code: string) {
    const { script_section } = new SvelteTranscriber(code).TranscribeToSections();
    expect(script_section).toMatchSnapshot();
}

function SnapshotTestModuleContext(code: string) {
    const module_context = new SvelteTranscriber(code).ExtractModuleContext();
    expect(module_context).toMatchSnapshot();
}
