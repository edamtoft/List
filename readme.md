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
let firstFiveNames = array
  .filter(v => v.name !== null) // ignore enties with no name
  .map(v => v.name) // get name
  .slice(0,5) // take first 5
  .foreach(name => console.log(name))
```

In this example, each step creates an entire new array. So say the initial
array has 1000 entries. We've now created 2 additional arrays with ~1000 entries each
and another with just the first 5 results. We've also had to wait for all ~1000 of the
results to process for each step before then next step can begin.

Using generator functions, we can make this more efficient by streaming through each step as we iterate:

```javascript
function* ignoreNulls(iterable) {
  for (let item of iterable) {
    if (item  !== null) yield item;
  }
}

function* getName(iterable) {
  for (let item of iterable) {
    yield item.name;
  }
}

function* takeFirstFive(iterable) {
  let count = 0;
  for (let item of iterable) {
    if (count >= 5) break;
    count++;
    yield item;
  }
}

let notNull = ignoreNulls(array);
let names = getName(notNull);
let firstFive = takeFirstFive(names);

// No iteration of the initial array has happened at this point.

for (let name of firstFive) {
  console.log(name);
}

```

Unfortunately, while this is more efficient, it is also much more verbose, and you'll have to 
call the generator functions each time you want to iterate. This library wraps this behavior is
an easier to use api, while preserving the ability to use native for...of iteration. To do this with
a List, we would use the following syntax:

```javascript
let firstFiveNames = List.from(array)
  .where(v => v.name !== null) // ignore enties with no name
  .select(v => v.name) // get name
  .take(5); // take first 5
  
for (let name of firstFiveNames) {
  console.log(name);
}
```

The syntax is as concise and as using the native Array.prototype functions, but we get all the performance
benefits of using generator functions. When it is enumerated, it streams through the steps, and after the first
5 results have been found, no more need to be enumerated.

## Compatibility

This is currently designed to work with recent builds of node.js. It requires support for es6 features such as Symbol.iterator, 
for..of loops, and generator functions. The base code works fine on modern browsers with minor adjustments, but would require
transpilation and a polyfill to work on older browsers. Currently, it's targeted primarily for server side use.

## API

### List

static methods:
* List.from(enumerable: iterable) : List
* List.of(...items: any) : List

instance methods:
* list.add(item: any) : this List
* list.remove(item: any) : this List
* list.at(index: index) : this List
* list.addRange(enumerable: iterable) : this List
* list.removeAt(index: int) : this List
* list.indexOf(item: any) : int
* list.length : int
* list.size : int

### Enumerable

Currently these methods are supported on anything that inherets from Enumerable, 
I.E. List. Hopefully soon, more, such as groupBy, join, etc. will be added.

* enumerable.where(delegate: function<bool>) : Enumerable
* enumerable.select(delegate: function<any>) : Enumerable
* enumerable.selectMany(delegate: function<iterable>) : Enumerable
* enumerable.concat(enumerable: iterable) : Enumerable
* enumerable.distinct() : Enumerable
* enumerable.skip(length: int) : Enumerable
* enumerable.take(length: int) : Enumerable
* enumerable.orderBy(keySelector: function<any>) : OrderedEnumerable
* enumerable.orderByDescending(keySelector: function<any>) : OrderedEnumerable
* orderedEnumerable.thenBy(keySelector: function<any>) : OrderedEnumerable
* orderedEnumerable.thenByDescending(keySelector: function<any>) : OrderedEnumerable
* enumerable.any([delegate: function<bool>]) : boolean
* enumerable.count([delegate: function<bool>]) : number
* enumerable.toArray() : Array
* enumerable.toList() : List
* enumerable.toSet() : Set
* enumerable.toMap(keySelector: function<any>, valueSelector: function<any>) : Map

