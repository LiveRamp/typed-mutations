import { Collection } from "../src/collection";

describe("Collection", () => {
  it("works with finite generators", () => {
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