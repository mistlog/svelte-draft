export function createRenderFunction<T extends (...args: any) => any>(target: HTMLElement, component: T, props: Parameters<T>[0]): () => void {
    return Reflect.construct(component, [{
        target,
        props
    }]);
}