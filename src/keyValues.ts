import { Collection } from "./collection";
type HomogenousObject<T, U> = { [index in keyof T]: U };
/**
 * This type exists to determine the object structure for a given KeyValues.
 *
 * It powers .toObject(), allowing the compiler to still verify things are shaped
 * correctly.
 */
type KeyValuesAsObject<T> = T extends KeyValues<infer U, infer V>
  ? { [i: string]: KeyValuesAsObject<V> }
  : T extends string
  ? T
  : T extends Collection<infer U>
  ? U[]
  : T;

export class KeyValues<KeyType, ValueType> {
  private data: Collection<[KeyType, ValueType]>;
  constructor(data: Collection<[KeyType, ValueType]>) {
    this.data = data;
  }

  flatMap<NewKeyType, NewValueType>(
    f: (t: [KeyType, ValueType]) => [NewKeyType, NewValueType] | undefined
  ): KeyValues<NewKeyType, NewValueType> {
    return new KeyValues<NewKeyType, NewValueType>(
      this.data.flatMap((e) => {
        const result = f(e);

        if (result) {
          return [result];
        } else {
          return [];
        }
      })
    );
  }

  map<NewValueType>(
    f: (t: ValueType) => NewValueType
  ): KeyValues<KeyType, NewValueType> {
    const tf = (a: [KeyType, ValueType]): [KeyType, NewValueType] => {
      const [key, value] = a;

      return [key, f(value)];
    };

    return this.flatMap(tf);
  }

  /**
   *
   * @param f Function that yields "primary key" for object
   * @param unsafe [default: false] Opt out of exception throwing if uniqueness violated
   */
  keyedBy<U>(f: (e: ValueType) => U, unsafe = false): KeyValues<U, ValueType> {
    let seen = new Map<U, boolean>();

    return this.flatMap((t: [KeyType, ValueType]) => {
      const [key, value] = t;
      const newKey = f(value);
      if (!unsafe) {
        if (seen.has(newKey))
          throw new Error(`Attempted to key by non-unique value ${newKey}`);
        else seen.set(newKey, true);
      }

      return [newKey, value];
    });
  }

  /**
   * For now, it reads the whole collection to group it.
   *
   * This seems necessary, but it might be possible to do more lazily. Asyncgenerator.
   * @param f
   */
  groupBy<U>(
    f: (e: ValueType) => U
  ): KeyValues<KeyType, KeyValues<U, Collection<ValueType>>> {
    const r = this.groupAllDataToMap(f);

    return this.flatMap((k) => {
      const [key, value] = k;
      const groupValue = f(value);
      const newRecord: [U, Collection<ValueType>] = [
        groupValue,
        Collection.of(r.get(groupValue)!),
      ];

      return [key, new KeyValues(Collection.of([newRecord]))];
    });
  }

  toObject(): { [i: string]: KeyValuesAsObject<ValueType> } {
    let res: { [i: string]: KeyValuesAsObject<ValueType> } = {};

    this.data.toArray().forEach((e) => {
      const [key, value] = e;
      if (value instanceof KeyValues) {
        res["" + key] = value.toObject() as KeyValuesAsObject<ValueType>;
      } else if (value instanceof Collection) {
        res["" + key] = value.toArray() as KeyValuesAsObject<ValueType>;
      } else if (typeof value == "string") {
        res["" + key] = value as KeyValuesAsObject<ValueType>;
      } else {
        res["" + key] = this._toObject(value) as KeyValuesAsObject<ValueType>;
      }
    });

    return res;
  }

  values(): Collection<ValueType> {
    return this.data.map((e) => {
      const [key, value] = e;

      return value;
    });
  }

  private groupAllDataToMap<U>(f: (e: ValueType) => U): Map<U, ValueType[]> {
    let r = new Map<U, ValueType[]>();

    this.data.toArray().forEach((v) => {
      const [key, value] = v;
      const newKey = f(value);
      if (r.has(newKey)) {
        r.get(newKey)!.push(value);
      } else {
        r.set(newKey, [value]);
      }
    });

    return r;
  }

  private _toObject<T>(k: T): { [i in keyof T]: T[i] } {
    let res: { [i: string]: any } = {};

    Object.keys(k).forEach((key) => {
      res[key] = k[key as keyof T];
    });

    return res as { [i in keyof T]: T[i] };
  }

  static fromHomogenousObject<T extends HomogenousObject<T, T[keyof T]>>(
    o: T
  ): KeyValues<String, Exclude<T[keyof T], undefined>> {
    return new KeyValues(
      Collection.of(
        Object.keys(o).map((key: string): [String, T[keyof T]] => [
          key,
          o[key as keyof T]! as T[keyof T],
        ])
      )
    );
  }

  static fromArray<T>(o: T[]): KeyValues<Number, T> {
    let indexer = sequentialIndexer();
    return new KeyValues(
      Collection.of(o).map<[Number, T]>((e: T) => [indexer(), e])
    );
  }
  static fromMapOfArray<T, U>(o: Map<T, U[]>): KeyValues<T, Collection<U>> {
    let entries = o.entries();
    let generator = (function* gen() {
      let v = entries.next();

      while (!v.done) {
        let [key, value] = v.value;
        let res: [T, Collection<U>] = [key, Collection.of(value)];
        yield res;
        v = entries.next();
      }
    })();

    return new KeyValues(new Collection(generator));
  }

  static fromMap<T, U>(o: Map<T, U>): KeyValues<T, U> {
    let entries = o.entries();
    return new KeyValues(
      new Collection(
        (function* gen() {
          let v = entries.next();
          while (!v.done) {
            yield v.value;
            v = entries.next();
          }
        })()
      )
    );
  }
}

function sequentialIndexer() {
  let i = 0;

  return () => Number(i++);
}
