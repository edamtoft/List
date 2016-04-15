"use strict";

const List = require("./../source/List");

describe("Enumerable", () => {
  
  it("can be queried", done => {
    let list = List.from(["a", "b", "c"]).where(c => c == "b").select(c => c.toUpperCase());    
    expect(list.first()).toBe("B");
    done();
  });
  
  it("is lazy-evaluated", done => {
    let count = 0;
    let query = List.from(["a", "b", "c"]).select(c => { count++; return c; });
    expect(count).toBe(0);
    let enumeratedList = query.toList();    
    expect(count).toBe(3);
    done();
  });
  
  it("is can be natively iterated", done => {
    let query = List.from(["a", "b", "c"]).select(c => c.toUpperCase())
    let str = "";
    for (let item of query) {
      str += item;
    }
    expect(str).toBe("ABC");
    done();
  });
  
  it("is can be concatenated", done => {
    let query = List.from(["a", "b", "c"]).concat(["d","e","f"]).select(c => c.toUpperCase())
    let str = "";
    for (let item of query) {
      str += item;
    }
    expect(str).toBe("ABCDEF");
    done();
  });
});