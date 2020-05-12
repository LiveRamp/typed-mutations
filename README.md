# ts-mutations
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=LiveRamp_ts-mutations&metric=coverage&token=50fd11bd0e319d169c0c3d49c87cb6f17d32ee41)](https://sonarcloud.io/dashboard?id=LiveRamp_ts-mutations)

The intent of this package is to provide a simple way to transform objects while maintaining their type information. As a bonus, 
it also optimizes such that writing readable code doesn't mean doing multiple loops over the same object - all changes are done 
in a single pass. 

It exposes two concepts, `KeyValues` (for objects), and `Collections` for arrays.

For examples of usage, check out the [tests](test)

For further explanation of behavior, check out the comments in [src](src)

## Usage

Make sure you have authenticated yarn:

**WHEN IT ASKS YOU FOR PASSWORD, THIS IS ACTUALLY A SERVICE TOKEN. SET IT UP IN GITHUB AND GIVE IT PACKAGE READ CAPABILITIES**
```
yarn login --registry=https://npm.pkg.github.com/
```

Further, ensure `.npmrc` is configured such that it knows where @liveramp packages live. Create a `.npmrc` in the same directory as your `package.json` with these contents:
```
@liveramp:registry=https://npm.pkg.github.com
```

Great! You should be good to go. 
```
yarn add @liveramp/ts-mutations
```
