# ts-mutations

The intent of this package is to provide a simple way to transform objects while maintaining their type information. As a bonus, 
it also optimizes such that writing readable code doesn't mean doing multiple loops over the same object - all changes are done 
in a single pass. 

It exposes two concepts, `KeyValues` (for objects), and `Collections` for arrays.

For examples of usage, check out the [tests](test)

For further explanation of behavior, check out the comments in [src](src)
