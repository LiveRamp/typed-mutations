export class CollectionAlreadyDrainedError {
  __kind: "CollectionAlreadyDrainedError" = "CollectionAlreadyDrainedError"
  message = "You can't call toArray more than once on the same Collection."
}

export class KeyValuesAlreadyDrainedError {
  __kind: "KeyValuesAlreadyDrainedError" = "KeyValuesAlreadyDrainedError"
  message = "You can't call toObject more than once on the same KeyValues."
}