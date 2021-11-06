import { Readable, Updater, Writable, writable } from "svelte/store";

export interface Accessible<T> extends Writable<T>, Readable<T> {
    subscribe(arg0: (v: any) => void): any;
    getValue(): T;
}
export function accessible<T>(initValue: T) {
    let ref = initValue;
    const { subscribe, set, update } = writable(ref);

    return {
        subscribe,
        set: (newValue: T) => {
            ref = newValue;
            set(newValue);
        },
        update: (updater: Updater<T>) => {
            ref = updater(ref);
            update(updater);
        },
        getValue: () => {
            return ref;
        }
    };
}
