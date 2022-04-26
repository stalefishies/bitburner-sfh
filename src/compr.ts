import { NS } from "netscript";

let printf: (fmt: string, ...args: any[]) => void;

function comprChar(): string {
    let r = Math.random();
    if (r < 0.4) {
        return "ABCDEFGHIJKLMNOPQRSTUVWXYZ"[Math.floor(26 * Math.random())];
    } else if (r < 0.8) {
        return "abcdefghijklmnopqrstuvwxyz"[Math.floor(26 * Math.random())];
    } else {
        return "01234567689"[Math.floor(10 * Math.random())];
    }
}

function rlGenerate() {
    const length = 45 + Math.floor(15 * (Math.random() + Math.random()));
    let plain = "";

    while (plain.length < length) {
        let c = comprChar();
        let r = Math.random();
        let n = 1;

        if      (r < 0.3) { n = 1; }
        else if (r < 0.6) { n = 2; }
        else if (r < 0.9) { n = Math.floor(10 * Math.random()); }
        else              { n = 10 + Math.floor(5 * Math.random()); }

        plain += c.repeat(n);
    }

    return plain.substring(0, length);
}

function rlEncode(plain: string): string {
    let compressed = "";
    for (let i = 0; i < plain.length;) {
        let c = plain[i++];
        let n = 1;
        while (i < plain.length && plain[i] === c && n < 9) { ++n; ++i; }
        
        compressed += n.toFixed(0) + c;
    }
    return compressed;
}

// Compute length of optimal run-length encoding of plain
function rlLength(plain: string): number {
    let length = 0;
    for (let i = 0; i < plain.length;) {
        let runlen = 1;
        while (i + runlen < plain.length && plain[i + runlen] === plain[i]) { ++runlen; }
        i += runlen;
        
        while (runlen > 0) {
            runlen -= 9;
            length += 2;        
        }
    }
    return length;
}

function rlDecode(compr: string): string | null {
    let plain = "";

    if (compr.length % 2 !== 0) { return null; }
    for (let i = 0; i + 1 < compr.length; i += 2) {
        const length = compr.charCodeAt(i) - 0x30;
        if (length < 0 || length > 9) { return null; }

        plain += compr[i + 1].repeat(length);
    }

    return plain;
}

function lzGenerate(): string {
    const length = 45 + Math.floor(15 * (Math.random() + Math.random()));
    let plain = "";

    while (plain.length < length) {
        let c = comprChar();
        let r = Math.random();
        let n = 1;

        if (r < 0.8) {
            plain += comprChar();
        } else {
            let length = 1 + Math.floor(9 * Math.random());
            let offset = 1 + Math.floor(9 * Math.random());
            if (offset > plain.length) { continue; }

            for (let i = 0; i < length; ++i) {
                plain += plain[plain.length - offset];
            }
        }
    }

    return plain.substring(0, length);
}

function lzDecode(compr: string): string | null {
    let plain = "";

    for (let i = 0; i < compr.length;) {
        const literal_length = compr.charCodeAt(i) - 0x30;

        if (literal_length < 0 || literal_length > 9 || i + 1 + literal_length > compr.length) {
            return null;
        }

        plain += compr.substring(i + 1, i + 1 + literal_length);
        i += 1 + literal_length;

        if (i >= compr.length) { break; }
        const backref_length = compr.charCodeAt(i) - 0x30;

        if (backref_length < 0 || backref_length > 9) {
            return null;
        } else if (backref_length === 0) {
            ++i;
        } else {
            if (i + 1 >= compr.length) { return null; }
            
            const backref_offset = compr.charCodeAt(i + 1) - 0x30;
            if ((backref_length > 0 && (backref_offset < 1 || backref_offset > 9))
                || backref_offset > plain.length)
            {
                return null;
            }

            for (let j = 0; j < backref_length; ++j) {
                plain += plain[plain.length - backref_offset];
            }

            i += 2;
        }
    }

    return plain;
}

function lzEncode(plain: string): string {
    // for state[i][j]:
    //      if i is 0, we're adding a literal of length j
    //      else, we're adding a backreference of offset i and length j
    let cur_state: (string | null)[][] = Array.from(Array(10), () => Array(10).fill(null));
    let new_state: (string | null)[][] = Array.from(Array(10), () => Array(10));

    function set(state: (string | null)[][], i: number, j: number, str: string) {
        if (state[i][j] == null || str.length < new_state[i][j]!.length) {
            state[i][j] = str;
        }
    }

    // initial state is a literal of length 1
    cur_state[0][1] = "";

    for (let i = 1; i < plain.length; ++i) {
        for (const row of new_state) { row.fill(null); }
        const c = plain[i];

        // handle literals
        for (let length = 1; length <= 9; ++length) {
            if (cur_state[0][length] == null) { continue; }
            const string = cur_state[0][length]!;
            
            if (length < 9) {
                // extend current literal
                set(new_state, 0, length + 1, string);
            } else {
                // start new literal
                set(new_state, 0, 1, string + "9" + plain.substring(i - 9, i) + "0");
            }

            for (let offset = 1; offset <= Math.min(9, i); ++offset) {
                if (plain[i - offset] === c) {
                    // start new backreference
                    set(new_state, offset, 1, string + length + plain.substring(i - length, i));
                }
            }
        }

        // handle backreferences
        for (let offset = 1; offset <= 9; ++offset) {
            for (let length = 1; length <= 9; ++length) {
                if (cur_state[offset][length] == null) { continue; }
                const string = cur_state[offset][length]!;

                if (plain[i - offset] === c) {
                    if (length < 9) {
                        // extend current backreference
                        set(new_state, offset, length + 1, string);
                    } else {
                        // start new backreference
                        set(new_state, offset, 1, string + "9" + offset + "0");
                    }
                }

                // start new literal
                set(new_state, 0, 1, string + length + offset);
            }
        }

        let tmp_state = new_state;
        new_state = cur_state;
        cur_state = tmp_state;
    }

    let result = null;

    for (let len = 1; len <= 9; ++len) {
        if (cur_state[0][len] == null) { continue; }
        let str = cur_state[0][len]! + len + plain.substring(plain.length - len, plain.length);
        if (result == null || str.length < result.length) { result = str; }
    }

    for (let offset = 1; offset <= 9; ++offset) {
        for (let len = 1; len <= 9; ++len) {
            if (cur_state[offset][len] == null) { continue; }
            let str = cur_state[offset][len]! + len + offset;
            if (result == null || str.length < result.length) { result = str; }
        }
    }

    return result!;
}

export async function main(ns: NS) {
    printf = ns.tprintf.bind(ns);
    const N = 50;

    let t_sum_rl = 0;
    let t_max_rl = 0;
    let rl = [];
    for (let i = 0; i < N; ++i) {
        let t0 = performance.now();
        let plain = rlGenerate();
        let compr = rlEncode(plain);
        let time = performance.now() - t0;

        t_sum_rl += time;
        if (time > t_max_rl) { t_max_rl = time; }

        rl.push([plain, compr]);
    }

    let t_sum_lz = 0;
    let t_max_lz = 0;
    let lz = [];
    for (let i = 0; i < N; ++i) {
        let t0 = performance.now();
        let plain = lzGenerate();
        let compr = lzEncode(plain);
        let time = performance.now() - t0;

        t_sum_lz += time;
        if (time > t_max_lz) { t_max_lz = time; }

        lz.push([plain, compr]);
    }

    for (let [plain, compr] of rl) {
        ns.tprintf("%75s -> %+3d %5s %s", plain, compr.length - plain.length,
            compr.length === rlLength(plain) && rlDecode(compr) === plain, compr);
    }

    for (let [plain, compr] of lz) {
        ns.tprintf("%75s -> %+3d %5s %s", plain, compr.length - plain.length,
            lzDecode(compr) === plain, compr);
    }

    ns.tprintf("TIMES: %4.1fms %4.1fms | %4.1fms %4.1fms", t_sum_rl / N, t_max_rl, t_sum_lz / N, t_max_lz);

    let tests: [string, string][] = [
        ["aaabcaabaabaabca", "5aaabc340533bca"],
        ["abracadabra"     , "7abracad47"     ],
        ["mississippi"     , "4miss433ppi"    ],
        ["aAAaAAaAaAA"     , "3aAA53035"      ],
        ["2718281828"      , "627182844"      ],
        ["abcdefghijk"     , "9abcdefghi02jk" ],
        ["aaaaaaaaaaa"     , "1a911a"         ],
        ["aaaaaaaaaaaa"    , "1a912aa"        ],
        ["aaaaaaaaaaaa"    , "1a91021"        ],
        ["aaaaaaaaaaaaa"   , "1a91031"        ]
    ]

    let fail = false;
    for (const test of tests) {
        let plain = lzDecode(test[1]);
        if (plain !== test[0]) {
            fail = true;
            ns.tprintf("ERROR: decoding %s\nERROR: expected %s\nERROR:      got %s\n\n",
                test[1], test[0], plain);
        }

        let compr = lzEncode(test[0]);
        if (compr.length !== test[1].length && lzDecode(compr) !== test[0]) {
            fail = true;
            ns.tprintf("ERROR: encoding %s\nERROR: expected %s\nERROR:      got %s\n\n",
                test[0], test[1], compr);
        }
    }

    if (!fail) { ns.tprintf("All tests passed"); }
}
