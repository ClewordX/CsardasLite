// turns a dict with a single slot into a dict with a type tag.
export function AsTypeTaggedDict(x: any): {type: string, data: any} {
    let res = { type: '', data: undefined };
    for (const k in x) {
        if (Object.prototype.hasOwnProperty.call(x, k)) {
            const data = x[k];
            res.type = k;
            res.data = data;
        }
    }
    return res;
}
