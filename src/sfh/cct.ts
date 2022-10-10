export function contract(type: string, data: any): string[] | string | number | null {
    let time_init = performance.now();
    let answer = null;

    switch (type) {
        case "Algorithmic Stock Trader I":
        case "Algorithmic Stock Trader II":
        case "Algorithmic Stock Trader III":
        case "Algorithmic Stock Trader IV": {
            let max = 1, prices = data;
            if      (type === "Algorithmic Stock Trader II")  { max = Math.floor(data.length / 2); }
            else if (type === "Algorithmic Stock Trader III") { max = 2; }
            else if (type === "Algorithmic Stock Trader IV")  { max = data[0]; prices = data[1]; }

            let profit = Array.from(Array(prices.length), () => Array(2 * max + 1).fill(0));
            for (let k = 1; k < 2 * max + 1; ++k) { profit[0][k] = -prices[0]; }
            
            for (let i = 1; i < prices.length; ++i) {
                const price = prices[i];
                for (let k = 1; k < 2 * max + 1; ++k) {
                    if (k % 2 == 1) {
                        profit[i][k] = Math.max(profit[i - 1][k], profit[i - 1][k - 1] - price);
                    } else {
                        profit[i][k] = Math.max(profit[i - 1][k], profit[i - 1][k - 1] + price);
                    }
                }
            }

            answer = Math.round(Math.max(...profit[prices.length - 1]));
        } break;

        case "Array Jumping Game":
        case "Array Jumping Game II": {
            let dist = Array(data.length).fill(Number.POSITIVE_INFINITY);
            dist[0] = 0;

            for (let i = 0; i < data.length; ++i) {
                if (!Number.isFinite(dist[i])) { break; }

                let new_dist = dist[i] + 1;
                for (let j = i + 1; j <= Math.min(i + data[i], data.length - 1); ++j) {
                    if (new_dist < dist[j]) { dist[j] = new_dist; }
                }
            }

            let dist_end = dist[dist.length - 1];
            if (type === "Array Jumping Game") {
                answer = Number.isFinite(dist_end) ? 1 : 0;
            } else {
                answer = Number.isFinite(dist_end) ? dist_end : 0;
            }
        } break;

        case "Compression I: RLE Compression": {
            answer = "";
            for (let i = 0; i < data.length;) {
                let c = data[i++];
                let n = 1;
                while (i < data.length && data[i] === c && n < 9) { ++n; ++i; }
                answer += n + c;
            }
        } break;

        case "Compression II: LZ Decompression": {
            answer = "";
            for (let i = 0; i < data.length; ++i) {
                const literal_length = data.charCodeAt(i) - 0x30;
                answer += data.substring(i + 1, i + 1 + literal_length);
                i += 1 + literal_length;
                if (i >= data.length) { break; }

                const backref_length = data.charCodeAt(i) - 0x30;
                if (backref_length != 0) {
                    const backref_offset = data.charCodeAt(++i) - 0x30;
                    for (let j = 0; j < backref_length; ++j) {
                        answer += answer[answer.length - backref_offset];
                    }
                }
            }
        } break;

        case "Compression III: LZ Compression": {
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

            for (let i = 1; i < data.length; ++i) {
                for (const row of new_state) { row.fill(null); }
                const c = data[i];

                // handle literals
                for (let length = 1; length <= 9; ++length) {
                    const string = cur_state[0][length];
                    if (string == null) { continue; }
                    
                    if (length < 9) {
                        // extend current literal
                        set(new_state, 0, length + 1, string);
                    } else {
                        // start new literal
                        set(new_state, 0, 1, string + "9" + data.substring(i - 9, i) + "0");
                    }

                    for (let offset = 1; offset <= Math.min(9, i); ++offset) {
                        if (data[i - offset] === c) {
                            // start new backreference
                            set(new_state, offset, 1, string + length + data.substring(i - length, i));
                        }
                    }
                }

                // handle backreferences
                for (let offset = 1; offset <= 9; ++offset) {
                    for (let length = 1; length <= 9; ++length) {
                        const string = cur_state[offset][length];
                        if (string == null) { continue; }

                        if (data[i - offset] === c) {
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

                        // end current backreference and start new backreference
                        for (let new_offset = 1; new_offset <= Math.min(9, i); ++new_offset) {
                            if (data[i - new_offset] === c) {
                                set(new_state, new_offset, 1, string + length + offset + "0");
                            }
                        }
                    }
                }

                let tmp_state = new_state;
                new_state = cur_state;
                cur_state = tmp_state;
            }

            for (let len = 1; len <= 9; ++len) {
                if (cur_state[0][len] == null) { continue; }
                let str = cur_state[0][len]! + len + data.substring(data.length - len, data.length);
                if (answer == null || str.length < answer.length) { answer = str; }
            }

            for (let offset = 1; offset <= 9; ++offset) {
                for (let len = 1; len <= 9; ++len) {
                    if (cur_state[offset][len] == null) { continue; }
                    let str = cur_state[offset][len]! + len + offset;
                    if (answer == null || str.length < answer.length) { answer = str; }
                }
            }
        } break;

        case "Encryption I: Caesar Cipher": {
            answer = Array.from(data[0] as String).map(c => c === " " ? " " : String.fromCharCode(
                0x41 + (c.charCodeAt(0) - 0x41 + (26 - data[1])) % 26)
            ).join("");
        } break;

        case "Encryption II: Vigenère Cipher": {
            answer = Array.from(data[0] as String).map((c, i) => String.fromCharCode(
                0x41 + (c.charCodeAt(0) - 0x41 + (data[1].charCodeAt(i % data[1].length) - 0x41)) % 26)
            ).join("");
        } break;

        case "Find All Valid Math Expressions": {
            const digits = Array(...data[0]).map(x => parseInt(x));
            const target = data[1];

            let curr = new Set([{ e: digits[0].toString(), s: 1, l: 0, r: [digits[0]] }]);

            for (let d of digits.slice(1)) {
                const prev = curr;
                curr = new Set();

                let i = 0;
                for (let expr of prev) {
                    if (expr.r.length > 1 || expr.r[0] != 0) {
                        const new_r = expr.r.slice(0, expr.r.length - 1).concat(expr.r[expr.r.length - 1] * 10 + d);
                        curr.add({ e: expr.e + d, s: expr.s, l: expr.l, r: new_r });
                    }

                    let product = expr.r.reduce((a: number, b: number) => a * b, 1);
                    curr.add({ e: expr.e + "+" + d, s:  1, l: expr.l + expr.s * product, r: [d] });
                    curr.add({ e: expr.e + "-" + d, s: -1, l: expr.l + expr.s * product, r: [d] });

                    curr.add({ e: expr.e + "*" + d, s: expr.s, l: expr.l, r: expr.r.concat(d) });
                }
            }

            answer = [];
            for (let expr of curr) {
                let result = expr.l + expr.s * expr.r.reduce((a, b) => a * b, 1);
                if (result == target) { answer.push(expr.e); }
            }
        } break;

        case "Find Largest Prime Factor": {
            let factors = [];
            let number  = data;

            while (number % 2 == 0) { factors.push(2); number = Math.round(number / 2); }

            let primes = [];
            let max_n  = Math.sqrt(number);
            for (let n = 3; n <= max_n; n += 2) {
                let prime = true;
                let max_p = Math.sqrt(n);
                for (const p of primes) {
                    if (p > max_p) {
                        break;
                    } else if (n % p == 0) {
                        prime = false;
                        break;
                    }
                }
    
                if (prime) {
                    primes.push(n);
                    while (number % n == 0) {
                        factors.push(n);
                        number = Math.round(number / n);
                        max_n  = Math.sqrt(number);
                    }
                }
            }

            answer = number;
        } break;

        case "Generate IP Addresses": {
            const queue = [{ oct: [] as string[], rem: Array.from(data, (x: string) => parseInt(x)) }];
            for (let i = 0; i < queue.length; ++i) {
                const ip = queue[i];
                if (ip.oct.length == 4) { continue; }
                if (ip.rem.length == 0) { continue; }

                queue.push({ oct: ip.oct.concat(["" + ip.rem[0]]), rem: ip.rem.slice(1) });

                if (ip.rem.length > 1 && ip.rem[0] > 0) {
                    queue.push({ oct: ip.oct.concat(["" + ip.rem[0] + ip.rem[1]]), rem: ip.rem.slice(2) });

                    if (ip.rem.length > 2) {
                        let digit = 100 * ip.rem[0] + 10 * ip.rem[1] + ip.rem[2];
                        if (digit <= 255) {
                            queue.push({ oct: ip.oct.concat(["" + ip.rem[0] + ip.rem[1] + ip.rem[2]]), rem: ip.rem.slice(3) });
                        }
                    }
                }
            }

            answer = queue.filter(ip => ip.oct.length == 4 && ip.rem.length == 0).map(ip => ip.oct.join("."));
        } break;

        case "HammingCodes: Integer to Encoded Binary": {
            let int = data;
            let N = Math.floor(Math.log2(int));
            let vec = Array.from({ length: N + 1 }, (_, i) => Math.floor(int / 2 ** (N - i)) % 2);

            let masks = [
               /*012345678901234567890123456789012345678901234567890123456*/
                "111111111111111111111111111111111111111111111111111111111",
                "110110101011010101010101011010101010101010101010101010101",
                "101101100110110011001100110110011001100110011001100110011",
                "011100011110001111000011110001111000011110000111100001111",
                "000011111110000000111111110000000111111110000000011111111",
                "000000000001111111111111110000000000000001111111111111111",
                "000000000000000000000000001111111111111111111111111111111"
            ].map(x => x.split("").map(y => Number(y)));

            function hadamard(x: number[], y: number[]) {
                return Array.from({ length: Math.min(x.length, y.length) }, (_, i) => x[i] * y[i]);
            }
            let parities = masks.map(mask => hadamard(mask, vec).reduce((a, n) => a + n) % 2);

            for (let i = 1; i < parities.length; ++i) { parities[0] += parities[i]; }
            parities[0] %= 2;

                       /*01234567890123456789012345678901234567890123456789012345678901234*/
            let p_bit = "11101000100000001000000000000000100000000000000000000000000000001";

            let output = [];
            for (let i = 0, p = 0, d = 0; d < vec.length; ++i) {
                if (p_bit[i] === "1") {
                    output.push(parities[p++]);
                } else {
                    output.push(vec[d++]);
                }
            }

            answer = output.join("");
        } break;

        case "HammingCodes: Encoded Binary to Integer": {
            //sfh.print(" ");
            //sfh.print(data);

            let input = data.split("").map((y: string) => Number(y));
            let masks = [
               /*0123456789012345678901234567890123456789012345678901234567890123*/
                "1111111111111111111111111111111111111111111111111111111111111111",
                "0101010101010101010101010101010101010101010101010101010101010101",
                "0011001100110011001100110011001100110011001100110011001100110011",
                "0000111100001111000011110000111100001111000011110000111100001111",
                "0000000011111111000000001111111100000000111111110000000011111111",
                "0000000000000000111111111111111100000000000000001111111111111111",
                "0000000000000000000000000000000011111111111111111111111111111111"
            ].map(x => x.split("").map(y => Number(y)));

            function hadamard(x: number[], y: number[]) {
                return Array.from({ length: Math.min(x.length, y.length) }, (_, i) => x[i] * y[i]);
            }
            let parities = masks.map(mask => hadamard(mask, input).reduce((a, n) => a + n) % 2);

            //sfh.print("{}", input);
            //sfh.print("{}", parities);
            
            let count = parities.reduce((a, p) => a + p);
            if (count > 2) {
                let index = 0;
                for (let i = parities.length - 1; i > 0; --i) {
                    index *= 2;
                    index += parities[i];
                }

                //sfh.print("Flipping bit {}:", index);

                input[index] = 1 - input[index];

                //sfh.print("{}", input);
            }

                       /*01234567890123456789012345678901234567890123456789012345678901234*/
            let p_bit = "11101000100000001000000000000000100000000000000000000000000000001";
            let value = 0;
            for (let i = 0; i < input.length; ++i) {
                if (p_bit[i] === "1") { continue; }
                value *= 2;
                value += input[i];
            }

            //sfh.print("{}", value);

            answer = value;
        } break;


        case "Merge Overlapping Intervals": {
            data.sort((a: number[], b: number[]) => a[0] - b[0]);

            let merged = [];
            let lo = data[0][0], hi = data[0][1];
            for (let i = 1; i < data.length; ++i) {
                if (data[i][0] <= hi) {
                    hi = Math.max(hi, data[i][1]);
                } else {
                    merged.push([lo, hi]);
                    lo = data[i][0];
                    hi = data[i][1];
                }
            }
            merged.push([lo, hi]);
            
            answer = merged;
        } break;

        case "Minimum Path Sum in a Triangle": {
            let tri = data;
            for (let i = 1; i < tri.length; ++i) {
                tri[i][0] += tri[i - 1][0];
                for (let j = 1; j < tri[i].length - 1; ++j) {
                    tri[i][j] += Math.min(tri[i - 1][j - 1], tri[i - 1][j]);
                }
                tri[i][tri[i].length - 1] += tri[i - 1][tri[i - 1].length - 1];
            }
            answer = Math.min(...tri[tri.length - 1]);
        } break;

        case "Proper 2-Coloring of a Graph": {
            const N = data[0];
            const colours: (number | null)[] = Array(N).fill(null);
            const edges = Array.from({ length: N }, () => new Set<number>());
            for (let [i, j] of data[1]) {
                edges[i].add(j);
                edges[j].add(i);
            }

            let success = true;
            outer: for (let root = 0; root < N; ++root) {
                if (colours[root] != null) { continue; }
                colours[root] = 0;

                let queue = [root];
                while (queue.length > 0) {
                    let at  = queue.shift()!;
                    let col = colours[at]!;

                    for (let nn of edges[at]) {
                        let cur_col = colours[nn];
                        if (cur_col === col) {
                            success = false;
                            break outer;
                        } else if (cur_col == null) {
                            colours[nn] = 1 - col;
                            queue.push(nn);
                        }
                    }
                }
            }

            answer = (success ? colours : "[]");
        } break;

        case "Shortest Path in a Grid": {
            let H = data.length, W = data[0].length;
            let dist = Array.from(Array(H), () => Array(W).fill(Number.POSITIVE_INFINITY));
            dist[0][0] = 0;

            let queue: [number, number][] = [[0, 0]];
            while (queue.length > 0) {
                let [i, j] = queue.shift()!;
                let d = dist[i][j];

                if (i > 0     && d + 1 < dist[i - 1][j] && data[i - 1][j] !== 1)
                    { dist[i - 1][j] = d + 1; queue.push([i - 1, j]); }
                if (i < H - 1 && d + 1 < dist[i + 1][j] && data[i + 1][j] !== 1)
                    { dist[i + 1][j] = d + 1; queue.push([i + 1, j]); }
                if (j > 0     && d + 1 < dist[i][j - 1] && data[i][j - 1] !== 1)
                    { dist[i][j - 1] = d + 1; queue.push([i, j - 1]); }
                if (j < W - 1 && d + 1 < dist[i][j + 1] && data[i][j + 1] !== 1)
                    { dist[i][j + 1] = d + 1; queue.push([i, j + 1]); }
            }

            let path = "";
            if (Number.isFinite(dist[H - 1][W - 1])) {
                let i = H - 1, j = W - 1;
                while (i !== 0 || j !== 0) {
                    let d = dist[i][j];

                    let new_i = 0, new_j = 0, dir = "";
                    if (i > 0     && dist[i - 1][j] < d)
                        { d = dist[i - 1][j]; new_i = i - 1; new_j = j; dir = "D"; }
                    if (i < H - 1 && dist[i + 1][j] < d)
                        { d = dist[i + 1][j]; new_i = i + 1; new_j = j; dir = "U"; }
                    if (j > 0     && dist[i][j - 1] < d)
                        { d = dist[i][j - 1]; new_i = i; new_j = j - 1; dir = "R"; }
                    if (j < W - 1 && dist[i][j + 1] < d)
                        { d = dist[i][j + 1]; new_i = i; new_j = j + 1; dir = "L"; }

                    i = new_i; j = new_j;
                    path = dir + path;
                }
            }

            answer = path;
        } break;

        case "Sanitize Parentheses in Expression": {
            const valid: Set<string> = new Set();
            const seen:  Set<string> = new Set();
            const queue = [data];
            let length = 0;
            for (let i = 0; i < queue.length; ++i) {
                const string = queue[i];

                let value = 0;
                for (let c of string) {
                    if (c == "(") { ++value; } else if (c == ")") { --value; }
                    if (value < 0) { break; }
                }

                if (value == 0) {
                    if (string.length >= length) {
                        length = string.length;
                        valid.add(string);
                    }
                } else if (string.length > length) {
                    let c = (value > 0 ? "(" : ")");

                    for (let i = 0; i < string.length; ++i) {
                        if (string[i] == c) {
                            const new_string = string.slice(0, i) + string.slice(i + 1, string.length);
                            if (!seen.has(new_string)) {
                                seen.add(new_string);
                                queue.push(new_string);
                            }
                        }
                    }
                }
            }

            answer = Array.from(valid).filter((s: string) => s.length == length);
        } break;

        case "Spiralize Matrix": {
            answer = [];
            for (let matrix = data;;) {
                answer.push(...matrix[0]);
                matrix = matrix.slice(1);
                if (matrix.length == 0 || matrix[0].length == 0) { break; }

                for (let i = 0; i < matrix.length - 1; ++i) {
                    answer.push(matrix[i][matrix[i].length - 1]);
                    matrix[i] = matrix[i].slice(0, matrix[i].length - 1);
                }

                answer.push(...matrix[matrix.length - 1].reverse());
                matrix = matrix.slice(0, matrix.length - 1);
                if (matrix.length == 0 || matrix[0].length == 0) { break; }

                for (let i = matrix.length - 1; i > 0; --i) {
                    answer.push(matrix[i][0]);
                    matrix[i] = matrix[i].slice(1);
                }
            }
        } break;

        case "Subarray with Maximum Sum": {
            let sum = data[0], min = Math.min(data[0], 0), best = data[0];

            for (let x of data.slice(1)) {
                sum += x;
                min  = Math.min(min, sum);
                best = Math.max(best, sum - min);
            }

            answer = best;
        } break;

        case "Total Ways to Sum":
        case "Total Ways to Sum II": {
            let N, parts;
            if (type === "Total Ways to Sum") {
                N = data; parts = Array.from({ length: N - 1 }, (_, i) => i + 1);
            } else {
                N = data[0]; parts = data[1];
            }

            let p = Array(N + 1).fill(0);
            p[0] = 1;

            for (let part of parts) {
                for (let n = 0; n < N; ++n) {
                    if (n + part <= N) { p[n + part] += p[n]; }
                }
            }

            answer = p[N];
        } break;

        case "Unique Paths in a Grid I": {
            const n = data[0] + data[1] - 2;
            const r = Math.min(data[0], data[1]) - 1;

            let num = 1, den = 1;
            for (let i = n - r + 1; i <= n; ++i) { num *= i; }
            for (let i = 2;         i <= r; ++i) { den *= i; }
            answer = Math.round(num / den);
        } break;

        case "Unique Paths in a Grid II": {
            let H = data.length, W = data[0].length;
            let count = Array.from(Array(H), () => Array(W).fill(0));
            count[0][0] = 1;

            for (let i = 1; i < H; ++i) { count[i][0] = (data[i][0] == 1 ? 0 : count[i - 1][0]); }
            for (let j = 1; j < W; ++j) { count[0][j] = (data[0][j] == 1 ? 0 : count[0][j - 1]); }

            for (let i = 1; i < H; ++i) {
                for (let j = 1; j < W; ++j) {
                    count[i][j] = (data[i][j] == 1 ? 0 : count[i - 1][j] + count[i][j - 1]);
                }
            }
            
            answer = count[H - 1][W - 1];
        } break;
    }

    return answer;
}

export async function sfhMain(ns: NS) {
    const [server] = sfh.servers(n => n.cct.length > 0);

    if (server) {
        const file = server.cct[0];

        let type, data;
        try {
            type = ns.codingcontract.getContractType(file, server.name);
            data = ns.codingcontract.getData(file, server.name);
            const answer = contract(type, data);

            if (answer == null) {
                sfh.can.contracts = false;
                throw new Error(`Got null for contract type \"${type}\"`);
            } else {
                const success = ns.codingcontract.attempt(answer as any, file, server.name);

                if (!success) {
                    sfh.can.contracts = false;
                    throw new Error(
`Incorrect answer for contract type "${type}"

Input data: ${JSON.stringify(data)}
Our answer: ${JSON.stringify(answer)}
 with type: ${typeof answer}`
                    );
                }
            }
        } catch {}
    }
}

export async function main(ns: NS) {
    if (ns.args.length == 1 && ns.args[0] == "sfh") { await sfhMain(ns); return; }

    for (const server of sfh.servers(n => n.cct.length > 0)) {
        sfh.print("{}", server.name);
        for (const file of server.cct) {
            try {
                const type = ns.codingcontract.getContractType(file, server.name);
                sfh.print("    {39} {}", file, type);
            } catch {}
        }
    }
}
