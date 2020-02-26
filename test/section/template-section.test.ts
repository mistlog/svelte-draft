import { SvelteTranscriber } from "../../src";
import { FormatTemplate } from "../utility/utility";

describe("translate template section", () =>
{
    test("extrat template from code", () =>
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

    test("translate tag attribute starts with on", () =>
    {
        const code = `
            export default function App()
            {
                <button onClick={handleClick}>
                    Clicked {count} {count === 1 ? 'time' : 'times'}
                </button>;
            }
        `;

        SnapshotTest(code);
    })

    test("translate if", () =>
    {
        const code = `
            export default function App()
            {
                <if condition={user.loggedIn}>
                    <button onClick={toggle}>
                        Log out
                    </button>
                </if>
            }
        `;

        SnapshotTest(code);
    })

    test("translate else", () =>
    {
        const code = `
            export default function App()
            {
                let x = 7;
            
                <if condition={x > 10}>
                    <p>{x} is greater than 10</p>
                    <else condition={x < 5}>
                        <p>{x} is less than 5</p>
                    </else>
                    <else>
                        <p>{x} is between 5 and 10</p>
                    </else>
                </if>
            }
        `;

        SnapshotTest(code);
    })

    test("translate each", () =>
    {
        const code = `
            interface ICat
            {
                id: string;
                name: string;
            }
            
            export default function App()
            {
                let cats: Array<ICat> = [
                    { id: 'J---aiyznGQ', name: 'Keyboard Cat' },
                    { id: 'z_AbfPXTKms', name: 'Maru' },
                    { id: 'OUtn3pvWmpg', name: 'Henri The Existential Cat' }
                ];
            
                <h1>Te Famous Cats of YouTube</h1>;
            
                <ul>
                    <each from={cats}>
                        {(cat: ICat, index: number, key = cat.id) => (
                            <li>
                                <a target="_blank">
                                    {index + 1}: {cat.name}
                                </a>
                            </li>
                        )}
                    </each>
                </ul>
            }
        `;

        SnapshotTest(code);
    })

    test("translate each with value", () =>
    {
        const code = `
            export default function App()
            {
                <ul>
                    <each from={cats}>
                        {(cat: ICat) => (
                            <li>
                                <a target="_blank">
                                    {index + 1}: {cat.name}
                                </a>
                            </li>
                        )}
                    </each>
                </ul>
            }
        `;

        SnapshotTest(code);
    })

    test("translate each with value and index", () =>
    {
        const code = `
            export default function App()
            {
                <ul>
                    <each from={cats}>
                        {(cat: ICat, index: number) => (
                            <li>
                                <a target="_blank">
                                    {index + 1}: {cat.name}
                                </a>
                            </li>
                        )}
                    </each>
                </ul>
            }
        `;

        SnapshotTest(code);
    })

    test("translate each with value and key", () =>
    {
        const code = `
            export default function App()
            {
                <ul>
                    <each from={cats}>
                        {(cat: ICat, key = cat.id) => (
                            <li>
                                <a target="_blank">
                                    {index + 1}: {cat.name}
                                </a>
                            </li>
                        )}
                    </each>
                </ul>
            }
        `;

        SnapshotTest(code);
    })

    test("translate await: only then exist", () =>
    {
        const code = `
            export default function App()
            {
                <await>
                    {{
                        promise: promise
                            .then(number => <p>The number is {number}</p>)
                    }}
                </await>
            }
        `;

        SnapshotTest(code);
    })

    test("translate await: then & loading", () =>
    {
        const code = `
            export default function App()
            {
                <await>
                    {{
                        loading: <div>...waiting</div>,
                        promise: promise
                            .then(number => <p>The number is {number}</p>)
                    }}
                </await>
            }
        `;

        SnapshotTest(code);
    })

    test("translate await", () =>
    {
        const code = `
            export default function App()
            {
                <await>
                    {{
                        loading: <div>...waiting</div>,
                        promise: promise
                            .then(number => <p>The number is {number}</p>)
                            .catch((error: Error) => <p style="color: red">{error.message}</p>)
                    }}
                </await>
            }
        `;

        SnapshotTest(code);
    })

    test("handle transition", () =>
    {
        const code = `
            export default function App()
            {
                <p transition={TransitionConfig(fade,{ y: 200, duration: 2000 })}>
                    Fades in and out
	            </p>
            }
        `;

        SnapshotTest(code);
    })

    test("handle transition: without params", () =>
    {
        const code = `
            export default function App()
            {
                <p transition={TransitionConfig(fade)}>
                    Fades in and out
	            </p>
            }
        `;

        SnapshotTest(code);
    })

    test("handle transition: in and out", () =>
    {
        const code = `
            export default function App()
            {
                <p in={TransitionConfig(fly)} out={TransitionConfig(fade,{ y: 200, duration: 2000 })}>
                    Fades in and out
	            </p>
            }
        `;

        SnapshotTest(code);
    })

    test("handle local transition", () =>
    {
        // config function name doesn't matter
        const code = `
            export default function App()
            {
                <div localTransition={ConfigTransition(slide)}>
                    {item}
                </div>
            }
        `;

        SnapshotTest(code);
    })

    test("handle animation", () =>
    {
        const code = `
            export default function App()
            {
                <div animate={ConfigTransition(slide)}>
                    {item}
                </div>
            }
        `;

        SnapshotTest(code);
    })

    test("handle use directive", () =>
    {
        const code = `
            export default function App()
            {
                <div use={ConfigAction(pannable)}>
                    {item}
                </div>
            }
        `;

        SnapshotTest(code);
    })

    test("handle custom event", () =>
    {
        const code = `
            export default function App()
            {
                <div on={ConfigEvent<IPannableEventMap>({
                    panstart: handlePanStart,
                    panmove: handlePanMove,
                    panend: () => {}
                })}>
                    {item}
                </div>
            }
        `;

        SnapshotTest(code);
    })

    test("define slot props", () =>
    {
        const code = `
            export default function App()
            {
                <slot props={ConfigProps({hovering:hovering})}></slot>
            }
        `;

        SnapshotTest(code);
    })

    test("use slot props", () =>
    {
        const code = `
            export default function App()
            {
                <Hoverable>
                    {({ hovering: active }: ISlotProps) => (
                        <div class={active ? "active" : ""}>
                            <p>Hover over me!</p>
                        </div>
                    )}
                </Hoverable>;
            }
        `;

        SnapshotTest(code);
    })

    test("translate debug tag", () =>
    {
        const code = `
            export default function App()
            {
                <debug>{[user, value]}</debug>;
            }
        `;

        SnapshotTest(code);
    })

    test("support raw html", () =>
    {
        const code = `
            export default function App()
            {
                let string = "this string contains some <strong>HTML!!!</strong>";

                <p><raw-html>{string}</raw-html></p>
            }
        `;

        SnapshotTest(code);
    })

    test("support special elements", () =>
    {
        const code = `
            export default function App()
            {
                let file: string;
                <svelte-self {...file}/>;

                <svelte-head>
                    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css"/>
                </svelte-head>
            }
        `;

        SnapshotTest(code);
    })

    
})

function SnapshotTest(code: string)
{
    const { template_section } = new SvelteTranscriber(code).TranscribeToSections();
    const formatted = FormatTemplate(template_section);
    expect(formatted).toMatchSnapshot();
}