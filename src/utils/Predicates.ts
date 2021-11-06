// NOTE: c must of the format '#RRGGBB'.
export function isLightColor(c: string) {
    let R = parseInt(c.substring(1, 3), 16);
    let G = parseInt(c.substring(3, 5), 16);
    let B = parseInt(c.substring(5, 7), 16);

    return (0.2989*R+0.5870*G+0.1140*B) > 127.5;
}
