/** Clamp a number between two values */
export function clamp(x: number, lo: number, hi: number): number {
    return Math.min(Math.max(x, lo), hi);
}

/*
$123.4k
$123E03

$123.456k
$123.4E03

123.45GB
123.45TB
123.45PB
123.45EB
123.45ZB
123.45YB

100%
 99%
9.9%

 100%
99.9%
9.99%

100.0%
99.99%
9.999%

- means left-align (for all)
123s        string
+123d       integer
+12.3f      decimal
7m          money
5r          ram
4p          percent
10t         time

    tabulate(list, null, {
        TARGET: d => ["10s", d.target.name],
        HACK:   d => [ "4d", d.target.skill],
    });
 */

var term: any = null;
function getTerm(): any {
    for (const div of eval("document").querySelectorAll("div")) {
        const props = div[Object.keys(div)[1]];
        if (props?.children?.props?.terminal) {
            term = props.children.props.terminal;
            return;
        } else if (Array.isArray(props?.children)) {
            for (let child of props.children) {
                if (child?.props?.terminal) {
                    term = child.props.terminal;
                    return;
                }
            }
        }
    }

    throw new Error("Could not get term");
}

export function sprintf(fmt: string, ...args: any): string {
    let ret = "";

    for (let i = 0; i < fmt.length;) {
        if (fmt[i] === "%") {
            ++i;
            if (i >= fmt.length) {
                throw new Error(`sprintf: Unterminated format string ${fmt}`);
            } else if (fmt[i] === "%") {
                ret += "%"; ++i; continue;
            }

            let parse = ["", "", "", "", ""];
            while (i < fmt.length && "+- ".includes(fmt[i])) { parse[0] += fmt[i++]; }
            while (i < fmt.length && "0123456789".includes(fmt[i])) { parse[1] += fmt[i++]; }
            if (fmt[i] === ".") {
                ++i;
                while (i < fmt.length && "0123456789".includes(fmt[i])) { parse[2] += fmt[i++]; }
            }
            if ("RGBYCMWK".includes(fmt[i])) { parse[3] = fmt[i++]; }
            if ("sdfmrpt".includes(fmt[i])) {
                parse[4] = fmt[i++];
            } else {
                throw new Error(`sprintf: Invalid format %${parse[0]}${parse[1]}${parse[2]}${parse[3]} in ${fmt}`);
            }

            let left = false, sign = "";
            for (const c of parse[0]) { if (c === "-") { left = true; } else { sign = c; } }
            let len  = parseInt(parse[1]);
            let prec = parseInt(parse[2]);

        } else {
            ret += fmt[i++];
        }
    }

    return ret;
}

/** Format a time in ms - 8 chars exactly */
export function fmtt(time: number, epoch = 0): string {
    if (time < 0 || !isFinite(time)) {
        return "  null  ";
    } else {
        return new Date(epoch + time).toLocaleTimeString();
    }
}

/** Format a percentage - 5 chars exactly */
export function fmtp(frac: number): string {
    if (99.995 > frac && frac >= 0.9995) {
        return (frac * 100).toFixed(0).padStart(4, " ") + "%";
    } else if (frac >= 0.0995) {
        return (frac * 100).toFixed(1) + "%";
    } else if (frac >= 0) {
        return (frac * 100).toFixed(2) + "%";
    } else {
        return "null%";
    }
}

/** Format a money value - 11 chars max, 12 max if negative */
export function fmtm(money: number): string {
    if (!isFinite(money)) { return "null"; }
    let m = (money < 0 ? "-" : "");
    if (money < 0) { money = -money; }
    if (money <= 0.0005) { return "$0.000\u1D0700"; }

    let exponent = Math.max(Math.floor(Math.log10(money) / 3) * 3, 0);
    let mantissa = Math.round(money / 10 ** exponent * 1000) / 1000;
    if (mantissa >= 999.9995) { exponent += 3; mantissa /= 1000; }

    return `${m}\$${mantissa.toFixed(3)}\u1D07${exponent.toFixed(0).padStart(2, '0')}`;
}

/** Format a ram value - 11 chars max */
export function fmtr(ram: number): string {
    if (!isFinite(ram)) { return "null"; }
    if (ram <= 0.005) { return "0.00\u029900GB"; }

    let exponent = Math.max(Math.floor(Math.log2(ram) / 10) * 10, 0);
    let mantissa = Math.round(ram / 2 ** exponent * 1000) / 1000;
    if (mantissa >= 999.9995) { exponent += 10; mantissa /= 1024; }

    return `${mantissa.toFixed(2)}\u0299${exponent.toFixed(0).padStart(2, '0')}GB`;
}
