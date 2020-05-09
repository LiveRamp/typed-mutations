export interface Collection<T> {
  toArray(): T[];
  map<U>(f: (e: T) => U): Collection<U>;
  flatMap<U>(f: (e: T) => U[]): Collection<U>;
  filter(f: (e: T) => boolean): Collection<T>;
}

export class Collection<T> implements Collection<T> {
  private data: Generator<T, void, unknown>;

  constructor(data: Generator<T, void, unknown>) {
    this.data = data;
  }

  static of<T>(arr: T[]): Collection<T> {
    return new Collection(
      (function* gen() {
        for (let v of arr) {
          yield v;
        }
      })()
    );
  }

  static fromArray<T>(arr: T[]): Collection<T> { return Collection.of(arr) }

  toArray(): T[] {
    let result: T[] = [];
    let v = this.data.next();
    while (!v.done) {
      result.push(v.value);
      v = this.data.next();
    }

    return result;
  }

  flatMap<U>(f: (e: T) => U[]): Collection<U> {
    const self = this;
    return new Collection<U>(
      (function* gen() {
        let v = self.data.next();
        while (!v.done) {
          for (let d of f(v.value)) yield d;
          v = self.data.next();
        }
      })()
    );
  }

  map<U>(f: (e: T) => U): Collection<U> {
    return this.flatMap((e) => [f(e)]);
  }

  filter(f: (e: T) => boolean): Collection<T> {
    return this.flatMap((e) => {
      if (f(e)) {
        return [e];
      } else {
        return [];
      }
    });
  }
}
