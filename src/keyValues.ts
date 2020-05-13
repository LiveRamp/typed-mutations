import { Collection } from "./collection";
import { KeyValuesAlreadyDrainedError } from "./errors";



type KeyType<T> = T extends [infer U, infer V] ? U : never
type ValueType<T> = T extends [infer U, infer V] ? V : never

type PluckType<T, U> = T extends [U, infer V] ? T : never

type Entries<T> = {
  [Property in keyof T]: [Property, T[Property]]
}[keyof T]

export class KeyValues<T extends [any, any]> {
  private data: Collection<T>

  private constructor(data: Collection<T>) {
    this.data = data
  }

  static fromObject<T>(o: T) {
    let partial = Object.keys(o).map((key) => [
      key,
      o[key as keyof T]!
    ]) as unknown as Entries<T>[]

    return new KeyValues(Collection.of(partial))
  }

  static fromArray<T>(o: T[]): KeyValues<[number, T]> {
    let indexer = sequentialIndexer();
    return new KeyValues(
      Collection.of(o).map<[number, T]>((e: T) => [indexer(), e])
    );
  }




  /**
 * Similar to Map, except this operates on both the key and value.
 * 
 * E.g., if KeyValues represented:
 * {
 *   "potato": 20, 
 *   "ham": 21
 * }
 * 
 * .flatMap(
 *    (e: [KeyType, ValueType]) => ["cat" + e[0], e[1] + 20])
 * 
 * would yield 
 * {
 *   "catpotato": 40,
 *   "catham": 41 
 * }
 * 
 * If your flatMap returns nothing, the key and value are dropped. This is how `pluck`
 * is implemented! 
 * @param f 
 */
  flatMap<U extends [any, any]>(
    f: (t: T) => U | undefined
  ): KeyValues<U> {
    return new KeyValues<U>(
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

  /**
 * Perform operations on ValueType, potentially changing ValueType in the process. 
 * 
 * e.g. if ValueType was number, 
 *         if f was (n: number) => n + 1, this would increment every value, ValueType would remain `number`.
 *         if f was (n: number) => `Number ${number}`, ValueType would be string.
 *         if f was (n: number) => if(n < 10) { return "Cat" } else { return 20 }, ValueType would be `string | number`.
 *       
 * @param f Function to convert ValueType into NewValueType
 */
  map<NewValueType>(
    f: (t: ValueType<T>) => NewValueType
  ): KeyValues<[KeyType<T>, NewValueType]> {
    return this.flatMap((a) => {
      const [key, value] = a;

      return [key, f(value)];
    });
  }

  /**
   * @param f Function that yields "primary key" for object
   * @param unsafe [default: false] Opt out of exception throwing if uniqueness violated
   */
  keyedBy<U>(f: (e: ValueType<T>) => U, unsafe = false): KeyValues<[U, ValueType<T>]> {
    let seen = new Map<U, boolean>();

    return this.flatMap((t) => {
      const value = t[1];
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
   * Returns all the values of this object as a typed collection. 
   */
  values(): Collection<ValueType<T>> {
    return this.data.map((e) => {
      return e[1];
    });
  }

  pluck<U extends KeyType<T>>(keys: U[]): KeyValues<PluckType<T, U>> {
    return this.flatMap((e) => {
      if (keys.indexOf(e[0]) !== -1) {
        return e
      }
    }) as KeyValues<PluckType<T, U>>
  }

  toObject(): { [K in KeyType<T>]: ValueType<PluckType<T, K>> } {
    let res: { [K in KeyType<T>]?: ValueType<PluckType<T, K>> } = {};

    try {
      this.data.toArray().forEach((e) => {
        const [key, value] = e as [KeyType<T>, any]
        if (value instanceof KeyValues) {
          res[key] = value.toObject() as ValueType<PluckType<T, KeyType<T>>>;
        } else if (value instanceof Collection) {
          res[key] = value.toArray() as ValueType<PluckType<T, KeyType<T>>>;
        } else if (value instanceof Array || typeof value != "object") {
          res[key] = value as ValueType<PluckType<T, KeyType<T>>>;
        } else {
          res[key] = this._toObject(value) as ValueType<PluckType<T, KeyType<T>>>;
        }
      });

      return res as { [K in KeyType<T>]: ValueType<PluckType<T, K>> }
    } catch (e) {
      if (e.__kind == "CollectionAlreadyDrainedError") {
        throw new KeyValuesAlreadyDrainedError()
      } else {
        throw e
      }
    }
  }

  private _toObject<T>(k: T): { [i in keyof T]: T[i] } {
    let res: { [i: string]: any } = {};

    Object.keys(k).forEach((key) => {
      res[key] = k[key as keyof T];
    });

    return res as { [i in keyof T]: T[i] };
  }
}

function sequentialIndexer() {
  let i = 0;

  return () => i++;
}