import { Collection } from "./collection";

/**
 * This type exists to determine the object structure for a given KeyValues. The point here is to have no type be 
 * Collection or KeyValues in this new type. 
 *
 * It powers .toObject(), allowing the compiler to still verify things are shaped
 * correctly.
 */
type KeyValuesAsObject<T> = T extends KeyValues<infer U, infer V>
  ? { [i: string]: KeyValuesAsObject<V> } // If T is a KeyValues, recurse
  : T extends string
  ? string                                // If T extends a string, it's a string (else string can be inferred as a collection of characters) 
  : T extends Collection<infer U>
  ? U[]                                   // If it's a collection, make it an array! 
  : T;                                    // Else, shrug and retain its type. 

/**
 * KeyValues is intended to be used to perform typed mutations on objects. Typical usage is: 
 * KeyValues.fromObject($yourObject)
 * [ operations on it ]
 * ...
 * .toObject()
 * 
 * The final toObject call returns a typed object conforming to the mutations. 
 */
export class KeyValues<KeyType, ValueType> {
  private data: Collection<[KeyType, ValueType]>;
  constructor(data: Collection<[KeyType, ValueType]>) {
    this.data = data;
  }

  static fromObject<T>(
    o: T
  ): KeyValues<keyof T, T[keyof T]> {
    return new KeyValues(
      Collection.of(
        Object.keys(o).map((key: string): [keyof T, T[keyof T]] => [
          key as keyof T,
          o[key as keyof T]! as T[keyof T],
        ])
      )
    );
  }

  static fromArray<T>(o: T[]): KeyValues<number, T> {
    let indexer = sequentialIndexer();
    return new KeyValues(
      Collection.of(o).map<[number, T]>((e: T) => [indexer(), e])
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
    f: (t: ValueType) => NewValueType
  ): KeyValues<KeyType, NewValueType> {
    const tf = (a: [KeyType, ValueType]): [KeyType, NewValueType] => {
      const [key, value] = a;

      return [key, f(value)];
    };

    return this.flatMap(tf);
  }

  /**
   * Similar to Map, except this operates on both the key and value.
   * 
   * E.g., if KeyValues represented:
   * {
   *      "potato": 20, 
   *      "ham": 21
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

  /**
   * @param f Function that yields "primary key" for object
   * @param unsafe [default: false] Opt out of exception throwing if uniqueness violated
   */
  keyedBy<U>(f: (e: ValueType) => U, unsafe = false): KeyValues<U, ValueType> {
    let seen = new Map<U, boolean>();

    return this.flatMap((t: [KeyType, ValueType]) => {
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
   * Returns the typed object corresponding to this KeyValues instance. 
   * 
   */
  toObject(): { [i: string]: KeyValuesAsObject<ValueType> } {
    let res: { [i: string]: KeyValuesAsObject<ValueType> } = {};

    this.data.toArray().forEach((e) => {
      const [key, value] = e;
      if (value instanceof KeyValues) {
        res["" + key] = value.toObject() as KeyValuesAsObject<ValueType>;
      } else if (value instanceof Collection) {
        res["" + key] = value.toArray() as KeyValuesAsObject<ValueType>;
      } else if (typeof value == "string" || typeof value == "number" || value instanceof Array) {
        res["" + key] = value as KeyValuesAsObject<ValueType>;
      } else {
        res["" + key] = this._toObject(value) as KeyValuesAsObject<ValueType>;
      }
    });

    return res;
  }

  /**
   * Returns all the values of this object as a typed collection. 
   */
  values(): Collection<ValueType> {
    return this.data.map((e) => {
      return e[1];
    });
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
