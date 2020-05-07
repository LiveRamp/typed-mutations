import { Collection } from "../src";

describe("Collection", () => {
  describe("constructors", () => {
    it("works with generators", () => {
      let arr = [1, 2, 3, 4, 5]
      let generator = (function* gen() {
        for (let v of arr) {
          yield v;
        }
      })()

      let sut = new Collection(generator);

      expect(sut.toArray()).toEqual(arr)
    })

    it("works with arrays", () => {
      let arr = [1, 2, 3, 4, 5]
      let sut = Collection.fromArray(arr);

      expect(sut.toArray()).toEqual(arr);
    })
  })

  describe("flatMap", () => {
    it("Can create a larger array than before via FlatMap", () => {
      let arr = [1, 2, 3, 4, 5]
      let result = Collection.fromArray(arr).flatMap((e) => [e, e, e]).toArray()

      expect(result.length).toBe(arr.length * 3)
    })

    it("Can conditionally remove elements via flatMap", () => {
      let arr = [1, 2, 3, 4, 5]
      let result = Collection.fromArray(arr)
        .flatMap((e) => e == 3 ? [] : [e])
        .toArray()

      expect(result.length).toBe(arr.length - 1)
      expect(result).toEqual([1, 2, 4, 5])
    })
  })

  describe("map", () => {
    it("Can change values but retain type of collection", () => {
      let result = Collection.fromArray([1, 2, 3, 4, 5])
        .map((num) => num * 2)
        .toArray();

      expect(result).toEqual([2, 4, 6, 8, 10])
    })

    it("Can change values and type of collection", () => {
      let result = Collection.fromArray([1, 2, 3, 4, 5])
        .map((num) => `Cat number ${num}`)
        .toArray();

      expect(result).toEqual([
        "Cat number 1",
        "Cat number 2",
        "Cat number 3",
        "Cat number 4",
        "Cat number 5"
      ])
    })

    it("Can mix types without complaint", () => {
      let result = Collection.fromArray([1, 2, 3, 4, 5])
        .map((num) => num == 3 ? 3 : num == 2 ? { subnumber: num } : `Cat number ${num}`)
        .toArray();

      expect(result).toEqual([
        "Cat number 1",
        { subnumber: 2 },
        3,
        "Cat number 4",
        "Cat number 5"
      ])
    })
  })
  it("can filter", () => {
    let result = Collection
      .fromArray([1, 2, 3, 4, 5])
      .filter((e) => e != 4)
      .toArray()

    expect(result).toEqual([1, 2, 3, 5])
  })
})