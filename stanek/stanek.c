#include <stdint.h>
#include <stdbool.h>
#include <stdarg.h>
#include <stdlib.h>
#include <stdio.h>
#include <time.h>

typedef  uint8_t u8;
typedef uint32_t u16;
typedef uint32_t u32;
typedef uint64_t u64;
typedef   size_t us;

#define MAX_HEIGHT 25
#define COUNT_32 (MAX_HEIGHT + 1)
#define COUNT_64 ((MAX_HEIGHT + 1) / 2)

typedef struct {
    union {
        u32 b32[COUNT_32];
        u64 b64[COUNT_64];
    };

    u8 W, H, l, r, t, b;
} Board;

#define BOARD(w, h) ((Board){ .W = w, .H = h, .l = w - 1, .t = h - 1 })

#define get(B, j, i) (((B)->b32[(i)] & (1U << (31 - (j)))) > 0)
void set(Board *B, u8 j, u8 i) {
    B->b32[(i)] |= (1U << (31 - (j)));

    if (i < B->t) { B->t = i; }
    if (i > B->b) { B->b = i; }
    if (j < B->l) { B->l = j; }
    if (j > B->r) { B->r = j; }
}

void reset(Board *B) {
    u8 w = B->r - B->l + 1;
    u8 h = B->b - B->t + 1;

    for (u8 i = 0; i < h;    ++i) { B->b32[i] = (B->b32[i + B->t] << B->l); }
    for (u8 i = h; i < B->H; ++i) { B->b32[i] = 0x00000000; }

    B->l = 0; B->t = 0; B->r = w - 1; B->b = h - 1;
}

void setFromList(Board *B, us count, ...) {
    va_list args;
    va_start(args, count);

    for (us n = 0; n < count; ++n) {
        u8 j = va_arg(args, u32);
        u8 i = va_arg(args, u32);
        set(B, j, i);
    }
}

void setFromRotation(Board *B, Board *A) {
    for (us i = 0; i < A->H && i < B->W; ++i)
    for (us j = 0; j < A->W && j < B->H; ++j) {
        if (get(A, j, i)) { set(B, A->W - 1 - i, j); }
    }

    B->l = A->W - 1 - A->b;
    B->t = A->l;
    B->r = A->W - 1 - A->t;
    B->b = A->r;

    reset(B);
}

bool overlap(Board *A, Board *B) {
    for (u8 n = 0; n < COUNT_64; ++n) {
        if (A->b64[n] & B->b64[n]) { return true; }
    }
    return false;
}

Board *_union(Board *A, Board *B, Board *U) {
    for (u8 n = 0; n < COUNT_64; ++n) {
        U->b64[n] = A->b64[n] | B->b64[n];
    }

    U->l = A->l < B->l ? A->l : B->l;
    U->t = A->t < B->t ? A->t : B->t;
    U->r = A->r > B->r ? A->r : B->r;
    U->b = A->b > B->b ? A->b : B->b;

    return U;
}
#define calcUnion(A, B) (*_union((A), (B), &BOARD((A)->W, (A)->H)))

bool shift(Board *B) {
    if (B->l > B->r || B->t > B->b) {
        return false;
    } else if (B->r < B->W - 1) {
        for (u8 n = 0; n < COUNT_64; ++n) {
            B->b64[n] >>= 1;
        }

        ++B->l;
        ++B->r;
    } else if (B->b < B->H - 1) {
        for (u8 n = COUNT_32 - 1; n > 0; --n) {
            B->b32[n] = B->b32[n - 1] << B->l;
        }

        B->b32[0] = 0x00000000;
        B->r -= B->l;
        B->l = 0;

        ++B->t;
        ++B->b;
    } else { return false; }
    return true;
}

Board *_surface(Board *B, Board *S) {
    for (u8 i = 0; i < B->H; ++i)
    for (u8 j = 0; j < B->W; ++j) {
        if (!get(B, j, i)) { continue; }

        u8 i_nn[4] = { i, i, i - 1, i + 1 };
        u8 j_nn[4] = { j - 1, j + 1, j, j };

        for (u8 n = 0; n < 4; ++n) {
            if (j_nn[n] >= B->W || i_nn[n] >= B->H
                || get(B, j_nn[n], i_nn[n]))
            { continue; }

            set(S, j_nn[n], i_nn[n]);
        }
    }

    return S;
}
#define calcSurface(B) (*_surface((B), &BOARD((B)->W, (B)->H)))

void printDebug(Board *board) {
    printf("\n(%02d, %02d)   (%02d, %02d)   (%02d, %02d)\n",
        board->W, board->H, board->l, board->t, board->r, board->b);

    u8 line[32];
    for (us i = 0; i < board->H; ++i) {
        for (us j = 0; j < board->W; ++j) {
            line[j] = get(board, j, i) ? '#' : '.';
        }

        printf("%.*s\n", board->W, line);
    }
}

void print(us count, ...) {
    if (count == 0) { return; }

    va_list args;
    va_start(args, count);
    Board *first = va_arg(args, Board *);
    va_end(args);

    u8 W = first->W;
    u8 H = first->H;

    us length = (W + 1) * count;
    char *line = malloc(length + 1);

    //for (us n = 0; n < count - 1; ++n) { line[(W + 1) * n - 1] = ' '; }
    line[length - 1] = '\n';
    line[length]     = '\0';

    for (us i = 0; i < H; ++i) {
        va_start(args, count);
        for (us n = 0; n < count; ++n) {
            Board *board = va_arg(args, Board *);
            us offset = (W + 1) * n;

            for (us j = 0; j < W; ++j) {
                line[offset + j] = get(board, j, i) ? '#' : '.';
            }

            if (n < count - 1) { line[offset + W] = ' '; }
        }

        printf("%s", line);
    }

    free(line);
}

typedef struct Score {
    float hac_1;
    float hac_2;
    u32 count;
} Score;

float compareScore(Score old, Score new) {
    float old_hac = old.hac_1 + old.hac_2;
    float new_hac = new.hac_1 + new.hac_2;

    if (new_hac != old_hac) {
        return new_hac - old_hac;
    } else {
        return (float)new.count - (float)old.count;
    }
}

typedef struct Solve {
    Board P1, P2;
    Board S1, S2;
    Board B[10];
} Solve;

typedef struct Solution {
    us capacity;
    us count;
    Solve *solves;
    Score score;
} Solution;

time_t epoch;

void pushSolve(Solution *solution, Solve *solve, Score score) {
    float cmp = compareScore(solution->score, score);
    if (cmp < 0) {
        return;
    } else if (cmp > 0) {
        solution->count = 0;
        solution->score = score;

        time_t t; time(&t); t -= epoch;
        printf("%02lld:%02lld:%02lld New best score: %.2fx + %.2fx\n",
            t / 3600, t / 60 % 60, t % 60, score.hac_1, score.hac_2);

        Board board = calcUnion(&solve->P1, &solve->P2);
        for (us i = 0; i < solution->score.count; ++i) {
            board = calcUnion(&board, &solve->B[i]);
        }

        print(3 + solution->score.count, &board, &solve->P1, &solve->P2,
            &solve->B[0], &solve->B[1], &solve->B[2], &solve->B[3], &solve->B[4],
            &solve->B[5], &solve->B[6], &solve->B[7], &solve->B[8], &solve->B[9]);
        printf("\n");
    }

    if (solution->solves == NULL) {
        solution->count    = 0;
        solution->capacity = 64;
        solution->solves   = malloc(64 * sizeof(Solve));
    }
    
    if (solution->count == solution->capacity) {
        solution->capacity *= 2;
        solution->solves = realloc(solution->solves, solution->capacity * sizeof(Solve));
    }

    solution->solves[solution->count++] = *solve;
}

Board boosters[27];
Board hac_1[2];
Board hac_2[2];
Board grow[5];

void placeBooster(Solution *solution, Solve *solve, Board *pieces, Score score) {
    if (score.count >= 10) { return; }

    for (us n = 0; n < 27; ++n) {
        Board booster = boosters[n];

        do {
            if (overlap(pieces, &booster)) { continue; }

            bool overlap_1 = overlap(&solve->S1, &booster);
            bool overlap_2 = overlap(&solve->S2, &booster);
            if (!overlap_1 && !overlap_2) { continue; }

            Score new_score = {
                .hac_1 = score.hac_1 * (overlap_1 ? 1.1 : 1),
                .hac_2 = score.hac_2 * (overlap_2 ? 1.1 : 1),
                .count = score.count + 1
            };
            
            solve->B[score.count] = booster;
            pushSolve(solution, solve, new_score);

            Board new_pieces = calcUnion(pieces, &booster);
            placeBooster(solution, solve, &new_pieces, new_score);
        } while (shift(&booster));
    }
}

void stanek(u8 W, u8 H) {
    for (us n = 0; n < 2; ++n) { hac_1[n] = BOARD(W, H); }
    setFromList(&hac_1[0], 4, 1,0, 2,0, 0,1, 1,1);
    setFromRotation(&hac_1[1], &hac_1[0]);

    for (us n = 0; n < 2; ++n) { hac_2[n] = BOARD(W, H); }
    setFromList(&hac_2[0], 4, 0,0, 1,0, 1,1, 2,1);
    setFromRotation(&hac_2[1], &hac_2[0]);

    for (us n = 0; n < 5; ++n) { grow[n] = BOARD(W, H); }
    setFromList(&grow[1], 4, 0,0, 0,1, 1,1, 2,1);
    setFromRotation(&grow[2], &grow[1]);
    setFromRotation(&grow[3], &grow[2]);
    setFromRotation(&grow[4], &grow[3]);

    for (us n = 0; n < 27; ++n) { boosters[n] = BOARD(W, H); }
    setFromList(&boosters[ 0], 5, 1,0, 2,0, 0,1, 1,1, 1,2); // F
    setFromRotation(&boosters[ 1], &boosters[ 0]);          // F
    setFromRotation(&boosters[ 2], &boosters[ 1]);          // F
    setFromRotation(&boosters[ 3], &boosters[ 2]);          // F
    setFromList(&boosters[ 4], 5, 0,0, 1,0, 2,0, 3,0, 0,1); // L
    setFromRotation(&boosters[ 5], &boosters[ 4]);          // L
    setFromRotation(&boosters[ 6], &boosters[ 5]);          // L
    setFromRotation(&boosters[ 7], &boosters[ 6]);          // L
    setFromList(&boosters[ 8], 5, 0,1, 1,1, 1,0, 2,0, 3,0); // N'
    setFromRotation(&boosters[ 9], &boosters[ 8]);          // N'
    setFromRotation(&boosters[10], &boosters[ 9]);          // N'
    setFromRotation(&boosters[11], &boosters[10]);          // N'
    setFromList(&boosters[12], 5, 0,0, 1,0, 2,0, 2,1, 3,1); // N
    setFromRotation(&boosters[13], &boosters[12]);          // N
    setFromRotation(&boosters[14], &boosters[13]);          // N
    setFromRotation(&boosters[15], &boosters[14]);          // N
    setFromList(&boosters[16], 5, 0,2, 1,2, 1,1, 1,0, 2,0); // Z'
    setFromRotation(&boosters[17], &boosters[16]);          // Z'
    setFromList(&boosters[18], 5, 0,2, 1,2, 1,1, 2,1, 2,0); // W
    setFromRotation(&boosters[19], &boosters[18]);          // W
    setFromRotation(&boosters[20], &boosters[19]);          // W
    setFromRotation(&boosters[21], &boosters[20]);          // W
    setFromList(&boosters[22], 5, 0,0, 0,1, 0,2, 1,1, 2,1); // T
    setFromRotation(&boosters[23], &boosters[22]);          // W
    setFromRotation(&boosters[24], &boosters[23]);          // W
    setFromRotation(&boosters[25], &boosters[24]);          // W
    setFromList(&boosters[26], 5, 0,1, 1,1, 2,1, 1,0, 1,2); // X

    Solution solution = {0};
    time(&epoch);

    for (us n_1 = 0; n_1 < 1; ++n_1)
    for (us n_2 = 0; n_2 < 2; ++n_2) {
        Board P1 = hac_1[n_1];
        Board P2 = hac_2[n_2];

        do {
            if (P1.t >= P1.H / 2) { break; }
            Board S1 = calcSurface(&P1);

            do {
                if (overlap(&P1, &P2)) { continue; }

                time_t t; time(&t); t -= epoch;
                printf("%02lld:%02lld:%02lld Current best score: %.2fx + %.2fx\n",
                    t / 3600, t / 60 % 60, t % 60, solution.score.hac_1, solution.score.hac_2);
                print(2, &P1, &P2);
                printf("%s", "\n");

                Board S2 = calcSurface(&P2);
                Board P1P2 = calcUnion(&P1, &P2);

                Solve solve = { .P1 = P1, .P2 = P2, .S1 = S1, .S2 = S2 };
                Score score = { .hac_1 = 1, .hac_2 = 1 };

                placeBooster(&solution, &solve, &P1P2, score);
            } while (shift(&P2));
            reset(&P2);
        } while (shift(&P1));
    }
    
    //if (solution.count > 0) {
    //    Solve solve = solution.solves[0];

    //    Board board = calcUnion(&calcUnion(&solve.P1, &solve.P2), &solve.PG);
    //    for (us i = 0; i < solution.score.count; ++i) {
    //        board = calcUnion(&board, &solve.B[i]);
    //    }

    //    print(4 + solution.score.count, &board, &solve.P1, &solve.P2, &solve.PG,
    //        &solve.B[0], &solve.B[1], &solve.B[2], &solve.B[3], &solve.B[4],
    //        &solve.B[5], &solve.B[6], &solve.B[7], &solve.B[8], &solve.B[9]);
    //}

    time_t t; time(&t); t -= epoch;
    printf("\n    /********************************\n");
    printf("     * %02lld:%02lld:%02lld   %1u x %1u   %zu   %.2fx\n",
        t / 3600, t / 60 % 60, t % 60, W, H, solution.count, solution.score.hac_1 + solution.score.hac_2);
    printf("     */\n\n\n");
}

int main(void) {
    //stanek(4, 4);
    //stanek(5, 4);
    //stanek(5, 5);
    //stanek(6, 5);
    stanek(6, 6);
    //stanek(7, 6);
    //stanek(7, 7);
    //stanek(8, 7);
    //stanek(8, 8);
}
