"use strict";

/**
 * @abstract
 * represents an enumerable entity
 */
class IEnumerable {
  
  /**
   * @abstract
   * Returns a javascript iterator for the enumerable item
   * @returns iterator
   */
  getEnumerator() { throw new Error("Not Implemented"); }
    
  /**
   * Enable native for..of iteration 
   */
  [Symbol.iterator]() { return this.getEnumerator()(); }
}

/**
 * Represents an enumerable entity
 */
class Enumerable extends IEnumerable {
  
  constructor(parent) {
    super();
    this._parent = parent;
  }
  
  /**
   * returns iterator of this enumerable
   * @returns iterator
   */
  getEnumerator() { throw new Error("Not Implemented"); }
  
  /**
   * returns iterator of parent IEnumerable
   * @returns iterator
   */
  getParentEnumerator() { return this._parent.getEnumerator(); }

  /**
   * @param delegate {Function}
   * @returns WhereEnumerable
   */
  where(delegate) { return new WhereEnumerable(this, delegate); }
  
  /**
   * @param delegate {Function}
   * @returns SelectEnumerable
   */
  select(delegate) { return new SelectEnumerable(this, delegate); }
  
  /**
   * @param delegate {Function}
   * @returns SelectManyEnumerable
   */
  selectMany(delegate) { return new SelectManyEnumerable(this, delegate); }
  
  /**
   * @param enumerable {IEnumerable}
   * @returns ConcatEnumerable
   */
  concat(enumerable) { return new ConcatEnumerable(this, enumerable); }
  
  /**
   * @param keySelector {Function}
   * @returns OrderedEnumerable
   */
  orderBy(keySelector) { return new OrderedEnumerable(this, keySelector, false); }
  
  
  /**
   * @param keySelector {Function}
   * @returns OrderedEnumerable
   */
  orderByDescending(keySelector) { return new OrderedEnumerable(this, keySelector, true); }
  
  /**
   * @returns DistinctEnumerable
   */
  distinct() { return new DistinctEnumerable(this); }
  
  /**
   * @param length {Number}
   * @returns SkipEnumerable
   */
  skip(length) { return new SkipEnumerable(this, length); }
  
  /**
   * @param length {Number}
   * @returns TakeEnumerable
   */
  take(length) { return new TakeEnumerable(this, length); }
  
  /**
   * @param delegate {Function<T>}
   * @returns T
   */
  first(delegate) {
    for (let item of this.where(delegate)) return item;
    throw new Error("No matching items found");
  }
  
  /**
   * @param delegate {Function<T>}
   * @returns T
   */
  firstOrDefault(delegate) {
    for (let item of this.where(delegate)) return item;
    return null;
  }
  
  /**
   * @param delegate {Function<T>}
   * @returns T
   */
  last(delegate) {
    let last = null;
    for (let item of this.where(delegate)) last = item;
    if (last === null) throw new Error("No matching items found");
    return last;
  }
  
  /**
   * @param delegate {Function<T>}
   * @returns T
   */
  lastOrDefault(delegate) {
    let last = null;
    for (let item of this.where(delegate)) last = item;
    return last;
  }
  
  /**
   * @param delegate {Function}
   * @returns Number
   */
  count(delegate) {
    let count = 0;
    for (let item of this.where(delegate)) count++;
    return count;
  }
  
  /**
   * @param delegate {Function}
   * @returns Boolean
   */
  any(delegate) {
    for (let item of this.where(delegate)) return true;
    return false;
  }
  
  /**
   * @returns Array
   */
  toArray() {
    let array =[];
    for (let item of this) array.push(item);
    return array;
  }
  
  /**
   * @returns Set
   */
  toSet() {
    let set = new Set();
    for (let item of this) set.add(item);
    return set;
  }
  
  /**
   * @returns List
   */
  toList() { 
    const List = require("./List");
    return List.from(this);
  }
  
  /**
   * @param keySelector {Function}
   * @param valueSelector {Function}
   * @returns Map
   */
  toMap(keySelector, valueSelector) {
    let map = new Map();
    for (let item of this.getEnumerator()) map.set(keySelector(item),valueSelector(item));
    return map;
  }
}

/**
 * @abstract
 * Compares two objects
 */
class IComparer {
  
  /**
   * @abstract
   * compare x and y
   * @returns Number
   */
  compare(x,y) { throw new Error("Not Implemented"); }
}

class DefaultComparer extends IComparer {
  compare(x,y) { 
    if (x === y) return 0;
    if (x > y) return 1;
    if (x < y) return -1;
    throw new Error("Unable to compare values");
  }
}

class SortComparer extends IComparer {
  constructor(parent, keySelector, descending) {
    super();
    this._keySelector = keySelector;
    this._descending = descending;
    this._parent = parent;
  }
  
  compare(x,y) {
    let order = 0;
    if (this._parent) order = this._parent.compare(x,y);
    if (order !== 0) return order;
    let comparison = new DefaultComparer().compare(this._keySelector(x), this._keySelector(y));
    return this._descending ? (comparison*-1) : comparison;
  }
}

class OrderedEnumerable extends Enumerable {
  constructor(parent, keySelector, descending, comparer) {
    super(parent);
    this._comparer = comparer || new SortComparer(null, keySelector, descending);
  }
  
  getEnumerator() {
    let parent = this.getParentEnumerator();
    let comparer = (x,y) => this._comparer.compare(x,y);
    return function* () {
      let buffer = [];
      for (let item of parent()) {
        buffer.push(item);
      }
      buffer.sort(comparer);
      for (let item of buffer) {
        yield item;
      }
    }
  }
  
  createOrderedEnumerable(keySelector, descending) {
    return new OrderedEnumerable(this, keySelector, descending, new SortComparer(this._comparer, keySelector, descending));
  }
  
  thenBy(keySelector) { return this.createOrderedEnumerable(keySelector); }
  
  thenByDescending(keySelector) { return this.createOrderedEnumerable(keySelector, true); }
}

class SelectEnumerable extends Enumerable {
  constructor(parent, delegate) {
    super(parent);
    this._delegate = delegate;
  }
  getEnumerator() {
    let parent = this.getParentEnumerator();
    let delegate = this._delegate;
    return function* () {
      for (let item of parent()) {
        yield delegate(item);
      }
    }
  }
}

class WhereEnumerable extends Enumerable {
  constructor(parent, delegate) {
    super(parent);
    this._delegate = delegate;
  }
  getEnumerator() {
    let parent = this.getParentEnumerator();
    let delegate = this._delegate;
    return function* () {
      for (let item of parent()) {
        if (!delegate||delegate(item)) yield item;
      }
    }
  }
}

class SelectManyEnumerable extends Enumerable {
  constructor(parent, delegate) {
    super(parent);
    this._delegate = delegate;
  }
  getEnumerator() {
    let parent = this.getParentEnumerator();
    let delegate = this._delegate;
    return function* () {
      for (let parentItem of parent()) {
        for (let childItem of delegate(parentItem)) {
          yield childItem;
        }
      }
    }
  }
}

class ConcatEnumerable extends Enumerable {
  constructor(parent, enumerable) {
    super(parent);
    this._enumerable = enumerable;
  }
  getEnumerator() {
    let parent = this.getParentEnumerator();
    let enumerable = this._enumerable;
    return function* () {
      for (let item of parent()) {
        yield item;
      }
      for (let item of enumerable) {
        yield item;
      }
    }
  }
}

class DistinctEnumerable extends Enumerable {
  constructor(parent) {
    super(parent);
  }
  getEnumerator() {
    let parent = this.getParentEnumerator();
    return function* () {
      let distinctValues = [];
      for (let item of parent()) {
        if (distinctValues.indexOf(item) !== -1) continue;
        distinctValues.push(item);
        yield item;
      }
    }
  }
}

class SkipEnumerable extends Enumerable {
  constructor(parent, length) {
    super(parent);
    this._length = length; 
  }
  getEnumerator() {
    let parent = this.getParentEnumerator();
    let length = this._length;
    return function* () {
      let count = 0;
      for (let item of parent()) {
        if (count < length) {
          count++;
          continue;
        }
        yield item;
        count++;
      }
    }
  }
}

class TakeEnumerable extends Enumerable {
  constructor(parent, length) {
    super(parent);
    this._length = length; 
  }
  getEnumerator() {
    let parent = this.getParentEnumerator();
    let length = this._length;
    return function* () {
      let count = 0;
      for (let item of parent()) {
        if (count > length) break;
        count++;
        yield item;
      }
    }
  }
}

module.exports = Enumerable;