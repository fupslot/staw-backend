import crypto from "crypto";

const DIGITS = "0123456789abcdefghijklmnopqrstuvwxyz";

const bin2val = (chunk: Array<number>, base: number) => {
  let sum = 0;
  let l = chunk.length;
  while (l--) {
    sum += chunk[l] * Math.pow(base, chunk.length - (l + 1));
  }
  return sum;
};

export class Stream {
  binary: Array<number>;
  private base: Record<string, Array<number>>;

  constructor(bytes: Buffer) {
    this.binary = [];

    let i = 0;
    while (i < bytes.length) {
      this.binary = [
        ...this.binary,
        ...bytes
          .readUInt8(i)
          .toString(2)
          .padStart(8, "0")
          .split("")
          .map((n) => +n),
      ];
      i++;
    }

    this.base = { "2": this.binary };
  }

  generate(n: number, base?: number, inner = false): number {
    base = base || 2;

    let val = n;
    const k = Math.ceil(Math.log(n) / Math.log(base));
    const r = Math.pow(base, k) - n;
    let chunk = null;

    while (val >= n) {
      chunk = this.shift(base, k);
      if (!chunk) return inner ? n : 0;

      val = bin2val(chunk, base);

      if (val >= n) {
        if (r === 1) continue;
        this.push(r, val - n);
        val = this.generate(n, r, true);
      }
    }

    return val;
  }

  push(base: number, value: number): void {
    this.base[base] = this.base[base] || [];
    this.base[base].push(value);
  }

  shift(base: number, k: number): number[] | null {
    const list = this.base[base];
    if (!list || list.length < k) {
      return null;
    } else {
      return list.splice(0, k);
    }
  }
}

export class csprng {
  static generate(bytes = 32, n = 16): string {
    const stream = new Stream(crypto.randomBytes(bytes));

    let i = n;
    let r = "";
    while (i--) {
      r += DIGITS[stream.generate(n)];
    }

    return r;
  }
}
