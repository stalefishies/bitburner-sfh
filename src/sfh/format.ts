declare const React: any;

/*
        s   min max
        f   min prec
        e   min prec(3) exp_mult(1)
        p   width(4)
        t
        m   prec(3)
        r   prec(2)

    {...,...}   options separated by commas (whitespace ignored)
    number          length
    asfdeptmr     format
    c[krgbcmyw]     colour
    !text           string literal

    $#              choose argument number
    $#.prop         choose argument number and property
*/

export function format(fmt: string, ...args: any[]): string {
    let errors = "";
    let output = "";
    let index  = 1;

    const error = function(message: string) {
        errors += "\x1B[31mFORMAT ERROR: " + message + "\x1B[0m\n";
    }

    for (let i = 0; i < fmt.length; ++i) {
        let value  = null;
        let format = null;
        let colour = null;
        let params = [];

        if (fmt[i] === "{") {
            let end = i + 1;
            while (fmt[end] !== "}" && end < fmt.length) { ++end; }

            if (fmt[end] !== "}") {
                error(`unterminated format code '${fmt.substring(i)}`);
                break;
            }

            const codes = fmt.substring(i + 1, end).split(",").map(s => s.trimStart());
            for (const code of codes) {
                switch (code[0]) {
                    case "0": case "1": case "2": case "3": case "4":
                        case "5": case "6": case "7": case "8": case "9": {
                        let param = Number(code);
                        if (Number.isInteger(param)) {
                            params.push(param);
                        } else {
                            error(`invalid integer param ${code}`);
                        }
                    } break;

                    case "$": {
                        let new_index = Number(code.substring(1));
                        if (Number.isInteger(new_index) && new_index >= 0 && new_index < arguments.length) {
                            index = new_index;
                        } else {
                            error(`invalid integer index ${code.substring(1)}`);
                        }
                    } break;

                    case "a": case "s": case "j": case "f": case "d": case "e":
                        case "p": case "t": case "m": case "r": {
                        format = code.trimEnd();
                    } break;

                    case "c": {
                        colour = code.substring(1).trimEnd();
                        if (colour === "*") { colour = arguments[index++]; }
                    } break;

                    case "!": {
                        value = code.substring(1);
                    } break;
                }
            }

            value  ??= arguments[index++];
            format ??= (typeof value === "number" ? "f" : "s");

            switch (format) {
                case "a": {
                    if (!Array.isArray(value)) { error(`invalid format array: ${String(value)}`); }
                } break;

                case "s":
                case "j": {
                    value = (format === "s" ? String(value) : JSON.stringify(value, null, 4));
                    if (params[1] != null) { value = value.substring(0, params[1]);  }
                    if (params[0] != null) { value = value.padStart(params[0], " "); }
                } break;

                case "f": case "d": {
                    value = Number(value);
                    if (format === "d") {
                        value = value.toFixed(0);
                    } else {
                        value = (params[1] == null ? value.toString() : value.toFixed(params[1]));
                    }
                    if (params[0] != null) { value = value.padStart(params[0], " "); }
                } break;

                case "t": {
                    if (isFinite(value)) {
                        if (value > 1e10) {
                            value = new Date(value).toLocaleTimeString();
                        } else if (value > 0) {
                            let h = Math.floor(value / 1000 / 60 / 60);
                            let m = Math.floor(value / 1000 / 60 % 60);
                            let s = Math.floor(value / 1000 % 60);

                            value = h.toFixed(0).padStart(2, "0") + ":" + m.toFixed(0).padStart(2, "0")
                            + ":" + s.toFixed(0).padStart(2, "0");
                        } else {
                            value = "00:00:00";
                        }
                    } else if (value === Number.POSITIVE_INFINITY || value === Number.NEGATIVE_INFINITY) {
                        value = "   --   ";
                    } else {
                        value = "  null  ";
                    }
                } break;

                case "p": {
                    value = Number(value);
                    let min = params[0] ?? 5;
                    if (min < 4) { min = 4; }

                    if (!Number.isFinite(value)) {
                        value = "null";
                    } else {
                        if (9.995 > value && value >= 0.9995) {
                            value = (value * 100).toFixed(Math.max(min - 5, 0)) + "%";
                        } else if (value >= 0.0995) {
                            value = (value * 100).toFixed(Math.max(min - 4, 0)) + "%";
                        } else if (value >= 0) {
                            value = (value * 100).toFixed(Math.max(min - 3, 0)) + "%";
                        } else {
                            value = "inv%";
                        }
                    }

                    value = value.padStart(min, " ");
                } break;

                case "e": case "m": case "r": {
                    let e = "\u1D07", b = 10, prec = 3, n = 1;
                    let prefix = "", suffix = "";
                    if (format === "m") {
                        n = 3; prefix = "$";
                    } else if (format === "r") {
                        e = "\u0299"; b = 2; prec = 2; n = 10; suffix = "GB";
                    }

                    if (params[1] != null) { prec = params[1]; }
                    if (params[2] != null) { n    = params[2]; }
                    const digits = n * Math.log10(b);

                    if (typeof value !== "number") {
                        value = "null";
                    } else if (Number.isNaN(value)) {
                        value = "NaN";
                    } else if (!Number.isFinite(value)) {
                        value = (value > 0 ? "+inf" : "-inf");
                    } else if (value === 0) {
                        value = prefix + (0).toFixed(prec) + e
                        + (0).toFixed(0).padStart(2, '0') + suffix;
                    } else {
                        let exponent = Math.floor(Math.log(value) / Math.log(b) / n) * n;
                        if (format === "m" || format === "r") { exponent = Math.max(exponent, 0); }

                        let mantissa = Math.floor(value / (b ** exponent) * 10 ** prec) / 10 ** prec;
                        const max_mantissa = (10 ** digits - 5 * 10 ** (-prec));
                        if (mantissa >= max_mantissa) { exponent += n; mantissa /= b ** n; }

                        value = prefix + mantissa.toFixed(prec) + e
                        + exponent.toFixed(0).padStart(2, '0') + suffix;
                    }

                    if (params[0] != null) {
                        if (params[0] == 0) {
                            let width = digits + prec + 3 + prefix.length + suffix.length;
                            if (prec != 0) { ++width; }
                            value = value.padStart(width, " ");
                        } else {
                            value = value.padStart(params[0], " ");
                        }
                    }
                } break;
            }

            if (Array.isArray(value)) {
                output += "[" + value.join(" ") + "]";
            } else {
                let reset = false;
                if (colour != null) {
                    let code = "";
                    if      (colour === "k" || colour === "K") { code = "\x1B[30m"; }
                    else if (colour === "r" || colour === "R") { code = "\x1B[31m"; }
                    else if (colour === "g" || colour === "G") { code = "\x1B[32m"; }
                    else if (colour === "y" || colour === "Y") { code = "\x1B[33m"; }
                    else if (colour === "b" || colour === "B") { code = "\x1B[34m"; }
                    else if (colour === "m" || colour === "M") { code = "\x1B[35m"; }
                    else if (colour === "c" || colour === "C") { code = "\x1B[36m"; }
                    else if (colour === "w" || colour === "W") { code = "\x1B[37m"; }

                    if (code !== "") { output += code; reset = true; }
                }

                output += String(value);
                if (reset) { output += "\x1B[0m"; }
            }

            i = end;
        } else {
            output += String(fmt[i]);
        }
    }

    return errors + output;
}
