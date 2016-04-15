"use strict";

const List = require("./../source/List");

describe("List", () => {
  
  it("can be constructed from array", done => {
    let list = new List(["a", "b", "c"]);
    expect(list.count()).toBe(3);
    done();
  });
  
  it("can be added to", done => {
    let list = List.empty();
    list.add("a");
    list.add("b");
    list.add("c");
    expect(list.count()).toBe(3);
    done();
  });
  
  it("can be created from an array", done => {
    let list = List.from(["a", "b", "c"]);
    expect(list.count()).toBe(3);
    done();
  });
  
  it("can be created from parameters", done => {
    let list = List.of("a","b","c");
    expect(list.count()).toBe(3);
    done();
  });
  
  it("can be queried as IEnumerable", done => {
    let list = List.of("a","b","c").where(c => c == "a");
    expect(list.count()).toBe(1);
    done();
  });
  
  it("can be converted back from IEnumerable to a list", done => {
    let list = List.of("a","b","c").where(c => c == "a").toList().add("d").add("e").add("f");
    expect(list.lastOrDefault()).toBe("f");
    done();
  });
  
  it("can be iterated", done => {
    let list = List.of("a","b","c");
    let count = 0;
    for (let item of list) count++;
    expect(count).toBe(3);
    expect(list.length).toBe(3);
    done();
  });
  
  it("can be converted to an array", done => {
    let list = List.of("a","b","c");
    let arr = list.toArray();
    expect(arr.length).toBe(3);
    expect(Array.isArray(arr)).toBe(true);
    done();
  });
  
  it("can be converted to a set", done => {
    let list = List.of("a","b","c");
    let set = list.toSet();
    expect(set.size).toBe(3);
    expect(set.constructor).toBe(Set);
    done();
  });
});

describe("List Items", () => {
  it("can be inserted", done => {
    let list = new List();
    let itemToAdd = "itemToAdd";
    list.add(itemToAdd);
    expect(list.at(0)).toBe(itemToAdd);
    expect(list.length).toBe(1);
    done();
  });
  
  it("can be removed", done => {
    let itemToRemove = "itemToRemove";
    let list = List.of(itemToRemove);
    expect(list.length).toBe(1);
    list.remove(itemToRemove);
    expect(list.length).toBe(0);
    done();
  });
  
  it("can be inserted and removed in fluent method chains", done => {
    let list = new List();
    list.add("a").add("b").add("c").add("d").remove("d");
    expect(list.length).toBe(3);
    done();
  });
});