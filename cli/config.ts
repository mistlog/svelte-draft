import { IDSL } from "typedraft";

export interface IConfig {
    dsls: Array<{ name: string; dsl: IDSL }>;
}

export const config: IConfig = {
    dsls: [],
};
