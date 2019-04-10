/** 抽取class的属性... */
export type ClassProps<T> = {
    [k in keyof T]?: T[k] extends Function ? never : T[k]
};

export type ComProps = ClassProps<Component>;
export type ComPropsObj = {
    [key: string]: ClassProps<Component>;
};
export abstract class Component {
    public abstract name: string;
}
