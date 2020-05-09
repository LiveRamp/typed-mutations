export class Collection<T> implements Collection<T> {
  private data: Generator<T, void, unknown>;

  constructor(data: Generator<T, void, unknown>) {
    this.data = data;
  }

  /**
   * Constructs a Collection given an array
   * @param arr 
   */
  static of<T>(arr: T[]): Collection<T> {
    return new Collection(
      (function* gen() {
        for (let v of arr) {
          yield v;
        }
      })()
    );
  }

  /**
   * Constructs a Collection given an array
   * @param arr 
   */
  static fromArray<T>(arr: T[]): Collection<T> { return Collection.of(arr) }

  /**
   * Constructs an array from itself
   * @param arr 
   */
  toArray(): T[] {
    let result: T[] = [];
    let v = this.data.next();
    while (!v.done) {
      result.push(v.value);
      v = this.data.next();
    }

    return result;
  }

  /**
   * Used to "expand" the size of the array if f returns more than one element, or "contract" the array if f returns an empty array.
   * 
   * @param f 
   */
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

  /**
   * Change the values based on the passed in function, f
   * @param f 
   */
  map<U>(f: (e: T) => U): Collection<U> {
    return this.flatMap((e) => [f(e)]);
  }

  /**
   * Remove all values for which f(v) does not return true
   * 
   * @param f 
   */
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
