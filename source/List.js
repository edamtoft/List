"use strict";

const Enumerable = require("./Enumerable");

class List extends Enumerable {
  constructor(enumerable) {
    super(null);
    this._items = [];
    if (enumerable) this.addRange(enumerable);
  }
  
  get length() { return this._items.length; }
  
  get size() { return this._items.length; }
  
  at(index) { return this._items[index]; }

  addRange(items) {
    for (let item of items) this.add(item)
    return this;
  }

  add(item) {
    this._items.push(item)
    return this;
  }

  remove(item) {
    let index = this._items.indexOf(item);
    if (index !== -1) this._items.splice(index, 1);
    return this;
  }
  
  removeAt(index) {
    this._items.splice(index, 1);
    return this;
  }

  indexOf(item) { return this._items.indexOf(item); }
  
  get count(delegate) {
    if (delegate) return super.count(delegate);
    return this._items.length;
  }

  getEnumerator() {
    let enumerable = this._items;
    return function* () {
      for (let item of enumerable) yield item;
    }
  }

  static of() { return new List(arguments); }
  
  static from(enumerable) { return new List(enumerable); }

  static empty() { return new List(); }
}

module.exports = List;