# ts-mutations

The intent of this package is to provide a simple way to transform objects while maintaining their type information. As a bonus, 
it also optimizes such that writing readable code doesn't mean doing multiple loops over the same object - all changes are done 
in a single pass. 

It exposes two concepts, `KeyValues` (for objects), and `Collections` for arrays.

## KeyValues

KeyValues are built from a source object, and keep track of its type information. It keeps track of three things, the original type, 

have have two generic types, let's call then `KeyType` and `ValueType`.

`KeyType` is `T[keyof T]` where `T` is whatever object we are representing. For example, the following structure:
```
{ 
  "cats": 200
  "metadata": {
      total_meows: 8200
  }
}
```
would have `KeyType` be `string`, and `ValueType` be `number | {total_meows: number}`. 
```

Now that we've got this foundation, we can express our transformations as `map`s, or `flatMap`s. 

### Map 

Map is a simple way to take all the values, and change them to a different type. This is achieved by writing a function which takes in the original `ValueType` and does something to it. 

```
obj.map((e: KeyType) => {
  return "Barista";
}
```
would yield a `KeyValues<string, string>`, which ultimately represents the structure
```
{
  "cats": "barista",
  "dogs": "barista"
}
``` 

### FlatMap

FlatMap is similar to Map, but it allows for in-place editing of keys as well. 




Aka, string property names mapping 
