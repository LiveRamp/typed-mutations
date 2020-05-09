

import { KeyValues } from "../src/keyValues"
import { Collection } from "../src/collection"

describe("KeyValues", () => {
  describe("constructors", () => {
    it("can build from an object", () => {
      let obj = {
        cats: 20,
        dog: {
          name: "Lucky",
          age: 3
        }
      }

      let result = KeyValues.fromObject(obj).toObject()

      expect(result).toEqual(obj)
    })

    it("can build from an array", () => {
      let arr = [1, 2, 3, 4, 5]

      let result = KeyValues.fromArray(arr).toObject()

      // When passed an array, the key type is number, and the keys are indices
      expect(result).toEqual({
        0: 1,
        1: 2,
        2: 3,
        3: 4,
        4: 5
      })
    })
  })
  describe("map", () => {
    it("Can convert values and types using map", () => {
      let obj = {
        cats: 20,
        dogs: 18
      }

      let result = KeyValues.fromObject(obj).map((e) => "Hoo").toObject()

      expect(result).toEqual({
        cats: "Hoo",
        dogs: "Hoo"
      })
    })

    it("Can tolerate various types using map", () => {
      let obj = {
        cats: 20,
        dogs: 18,
        crows: 17
      }

      let result = KeyValues.fromObject(obj).map((e) => {
        if (e == 20)
          return "Badoing"
        else if (e == 17) {
          return { cawCount: e }
        } else {
          return 30;
        }
      })
        .toObject()

      expect(result).toEqual({
        cats: "Badoing",
        dogs: 30,
        crows: { cawCount: 17 }
      })
    })
  })

  describe("flatMap", () => {
    it("Can modify both keys and values of an object", () => {
      let obj = {
        catCount: 1,
        cats: [
          { name: "Fluffy" }
        ]
      }

      let result = KeyValues.fromObject(obj).flatMap((e) => {
        if (e[0] == "catCount") {
          return [e[0] + "er", e[1] as number + 1]
        } else if (e[0] == "cats") {
          let newCatInfo = e[1] as { name: string }[];
          newCatInfo[1] = { "name": "Flopsy" }
          return ["catInfo", newCatInfo]
        } else {
          return e
        }
      }
      ).toObject()

      expect(result).toEqual({
        catCounter: 2,
        catInfo: [
          { name: "Fluffy" },
          { name: "Flopsy" }
        ]
      })
    })
    it("can drop elements by returning undefined", () => {
      let obj = {
        catCount: 1,
        cats: [
          { name: "Fluffy" }
        ]
      }

      let result = KeyValues.fromObject(obj).flatMap((e) => {
        if (e[0] != "catCount") {
          return e
        }
      }).toObject();

      expect(result).toEqual({
        cats: [
          { name: "Fluffy" }
        ]
      })
    })
  })
  describe("keyedBy", () => {
    it("Works for a function that returns a unique value for each value", () => {
      let obj = {
        something: "that",
        is: 100,
        and: {
          is: "chaotic",
          types: [3, 4, 5]
        }
      }
      let counter = 0;
      let result = KeyValues.fromObject(obj).keyedBy((e) => counter++).toObject()

      expect(result).toEqual({
        0: "that",
        1: 100,
        2: {
          is: "chaotic",
          types: [3, 4, 5]
        }
      })
    })
    it("Fails for a function that doesn't return a unique value for each value", () => {
      let obj = {
        something: "that",
        is: 100,
        and: {
          is: "chaotic",
          types: [3, 4, 5]
        }
      }

      expect.assertions(1)
      try {
        let result = KeyValues.fromObject(obj).keyedBy((e) => 1).toObject()
      } catch (e) {
        expect(e.message).toEqual("Attempted to key by non-unique value 1")
      }
    })
    it("Overwrites for a function that doesn't return a unique value when opted into", () => {
      let obj = {
        something: "that",
        is: 100,
        and: {
          is: "chaotic",
          types: [3, 4, 5]
        }
      }

      let result = KeyValues.fromObject(obj).keyedBy((e) => 1, true).toObject()

      expect(result).toEqual({
        1: {
          is: "chaotic",
          types: [3, 4, 5]
        }
      })
    })
  })

  it("can handle containing nested KeyValues", () => {
    let obj = {
      meow: 1,
      cat: KeyValues.fromObject({ name: "frank" })
    }

    let result = KeyValues.fromObject(obj).toObject()

    expect(result).toEqual({
      meow: 1,
      cat: { name: "frank" }
    })
  })

  it("can handle containing nested Collections", () => {
    let obj = {
      meow: 1,
      cat: Collection.fromArray([{ name: "frank" }, { name: "sally" }])
    }

    let result = KeyValues.fromObject(obj).toObject()

    expect(result).toEqual({
      meow: 1,
      cat: [{ name: "frank" }, { name: "sally" }]
    })
  })

  it("can create a collection corresponding to object's values", () => {
    let obj = {
      something: "that",
      is: 100,
      and: {
        is: "chaotic",
        types: [3, 4, 5]
      }
    }

    let result = KeyValues.fromObject(obj).values().toArray()

    expect(result).toEqual([
      "that",
      100,
      {
        is: "chaotic",
        types: [3, 4, 5]
      }
    ])
  })
})