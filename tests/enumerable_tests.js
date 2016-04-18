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
  
  it("can be natively iterated", done => {
    let query = List.from(["a", "b", "c"]).select(c => c.toUpperCase())
    let str = "";
    for (let item of query) {
      str += item;
    }
    expect(str).toBe("ABC");
    done();
  });
  
  it("can be concatenated", done => {
    let query = List.from(["a", "b", "c"]).concat(["d","e","f"]).select(c => c.toUpperCase())
    let str = "";
    for (let item of query) {
      str += item;
    }
    expect(str).toBe("ABCDEF");
    done();
  });
  
  it("can be ordered", done => {
    let query = List.from([2,3,1]).orderBy(v => v);
    expect(query.first()).toBe(1);
    expect(query.last()).toBe(3);
    done();
  });
  
  it("can be ordered in multiple tiers", done => {
    let students = List.of(
      {name: "Charlie", class: 1},
      {name: "Baker", class: 0},
      {name: "Adam", class: 1},
      {name: "David", class: 0}
    ).orderBy(v => v.class).thenBy(v => v.name).toArray();
    expect(students[0].name).toBe("Baker");
    expect(students[1].name).toBe("David");
    expect(students[2].name).toBe("Adam");
    expect(students[3].name).toBe("Charlie");
    done();
  });
  
  it("can be ordered descending", done => {
    let students = List.of(
      {name: "Charlie", class: 1},
      {name: "Baker", class: 0},
      {name: "Adam", class: 1},
      {name: "David", class: 0}
    ).orderByDescending(v => v.class).thenByDescending(v => v.name).toArray();
    expect(students[0].name).toBe("Charlie");
    expect(students[1].name).toBe("Adam");
    expect(students[2].name).toBe("David");
    expect(students[3].name).toBe("Baker");
    done();
  });
});