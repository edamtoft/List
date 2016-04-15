# List.js
List.js is a simple library for working with data sets. List implements the 
principals behind Linq in .NET to efficiently work with data sets of any size.
the base List object is essentially a decorator for an array, but supports most
of the basic extension methods available in Linq, with complete support for native
iteration with for-of loops and native lazy evaluation with generators

Examples

```javascript

let vehicles = List.of(
  {vin: "HZOPUKWZD818LB634", make: "Toyota", model: "Prius", price: 22000},
  {vin: "Z8BQP454UBU60IGU0", make: "Toyota", model: "Camry", price: 16000},
  {vin: "0WLQYJYYIFMIL7IIK", make: "Toyota", model: "Camry", price: 14500},
  {vin: "G9DA2UFZWG0DPQ8U2", make: "Honda", model: "Civic", price: 0}
  {vin: "FFY4MS5XXQVN07HCV", make: null, model: null, price: 0});
  
// List can be iterated with for..of syntax natively
for (let vehicle of vehicles) {
  console.log(`vin: ${vehicle.vin}`);
}

// lists support .NET style IEnumerable methods. 
// These use native javascript generators, so they can be 
// iterated natively with for..of loops and are lazy-evalated similarly to  IEnumerable in .NET  

let models = vehicles
  .select(v => v.model)
  .where(m => m !== null)
  .distinct();
    
for (let model of models) {
  console.log(model);
}

// if needed, enumerate to a List, Array, or Set
let pricesList = List.from(vehicles).where(p => p.price > 0).toList();
let pricesArray = List.from(vehicles).where(p => p.price > 0).toArray();
let pricesArray = List.from(vehicles).where(p => p.price > 0).toSet();
```

```javascript
// lists can be declared with a variety of syntaxes:
let list1 = List.of("Item1","Item2","Item3"); // supports any number of parameters
let list2 = List.from(["Item1","Item2","Item3"]) // takes any enumerable object, such as a set, map, or array
let list3 = new List(["Item1","Item2","Item3"]) // same as above
let list4 = List.empty()
  .add("Item1")
  .add("Item2")
  .add("Item3") // add and remove methods can be chained for fluent syntax
```

## Why
Working with sets of data in javascript can be a bit of a pain. For example, using just
array methods, you can do the following:

```javascript
let firstFIveNames = array
  .filter(v => v.name !== null) // ignore enties with no name
  .map(v => v.name) // get name
  .slice(0,5); // take first 5
```

The above example is analogous to:

```javascript
let firstFIveNames = List.from(array)
  .where(v => v.name !== null) // ignore enties with no name
  .select(v => v.name) // get name
  .take(5); // take first 5
```

In the fist example, each step creates an entier new array. So say the initial
array has 1000 entries. We've now created 2 additional arrays with ~1000 entries each
and another with just the first 5 results. We've also had to wait for all ~1000 of the
results to process for each step before then next step can begin.

In the second example, we create a list from the initial array, and then, nothing happens.
Becuase the generators are lazy-evaluated, no processing will happen until we enumerate
it with a for..of loop, or .toArray() or .toList().

When it is enumerated, it streams through the steps, and after the 5 results have been
found, no more need to be enumerated.

## Compatibility

This is currently designed to work with node.js, and will work with all recent versions. A browser 
port is in progress. Code works fine on modern browsers, but will require transpilation and
a polyfill for Symbol.iterator on older browsers.

## API

### List

static methods:
* List.from(enumerable) : List
* List.of(...items) : List

instance methods:
* list.add(item) : List
* list.remove(item) : List
* list.at(index) : List
* list.addRange(enumerable) : List
* list.removeAt(index) : List
* list.indexOf(item) : int
* list.length : int
* list.size : int

### Enumerable

Currently these methods are supported on anything that inherets from Enumerable, 
I.E. List. Hopefully soon, more, such as groupBy, join, etc. will be added.

* enumerable.where(delegate) : Enumerable
* enumerable.select(delegate) : Enumerable
* enumerable.selectMany(enumerable) : Enumerable
* enumerable.concat(enumerable) : Enumerable
* enumerable.distinct(delegate) : Enumerable
* enumerable.skip(length) : Enumerable
* enumerable.take(length) : Enumerable
* enumerable.any([delegate]) : boolean
* enumerable.count([delegate]) : number
* enumerable.toArray() : Array
* enumerable.toList() : List
* enumerable.toSet() : Set
* enumerable.toMap(keySelector, valueSelector) : Map

