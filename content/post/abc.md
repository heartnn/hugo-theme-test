+++
description = "函数式编程蔚然成风，越来越多的开源项目、技术交流在使用函数式编程的术语降低开发或沟通成本"
tags = ["javascript", "函数式编程"]
categories = ["技术", "front-end"]
series = ["node"]
isCJKLanguage = true
weight = 0
date = "2016-11-06T15:05:27+08:00"
title = "函数式编程术语解析"
+++


函数式编程蔚然成风，越来越多的开源项目、技术交流在使用函数式编程的术语降低开发或沟通成本，这无形中对不了解函数式编程的开发者造成了一定的学习门槛，翻译本文的初衷就是要普及函数式编程的基本知识，从新的角度扩展编程思维。至于为什么要使用 JavaScript 演示函数式编程，一方面是因为 JavaScript 的特性在很多方面与函数式编程浑然天成，另一方面是因为 JavaScript 是世界上最 XX 的语言……

<!-- more -->

## Arity

指函数的参数数量，由 `-ary` 和 `-ity` 这两个英文后缀拼接而成：

```js
const sum = (a, b) => a + b;

const arity = sum.length;
console.log(arity); 
// => 2
```

## Higher-Order Functions

高阶函数，此类函数可以接收其他函数作为参数，也可以返回一个函数作为返回值：

```js
const filter = (pred, xs) => {
    const result = [];
    for (let idx = 0; idx < xs.length; idx++) {
        if (pred(xs[idx])) {
            result.push(xs[idx]);
        }
    }
    return result;
};

const is = (type) => (x) => Object(x) instanceof type;

filter(is(Number), [0, '1', 2, null]); 
// => [0, 2]
```

## Partial Application

偏函数，在原函数的基础上预填充（pre-filling）部分参数并返回的新函数：

```js
// 下面是一个创建偏函数的辅助函数
const partial = (f, ...args) => (...moreArgs) => f(...args, ...moreArgs);

const add3 = (a, b, c) => a + b + c;

// 预填充 (add3, 2, 3) 三个参数，空置最后一个参数，返回一个新的函数
const fivePlus = partial(add3, 2, 3); // (c) => 2 + 3 + c

fivePlus(4); 
// => 9
```

JavaScript 中的 `Function.prototype.bind()` 函数是创建偏函数的最简单方式：

```js
const add1More = add3.bind(null, 2, 3); 
// => (c) => 2 + 3 + c
```

## Currying

柯里化，将一个接收多个参数的函数转化为单参数函数的方式，转化后的函数每次只接收一个参数，然后返回一个新函数，新函数可以继续接收参数，直到接收到所有的参数：

```js
const sum = (a, b) => a + b;

sum(2, 3)
// => 6

const curriedSum = (a) => (b) => a + b;

curriedSum(40)(2) 
// => 42.

const add2 = curriedSum(2); 
// (b) => 2 + b

add2(10) 
// => 12
```

## Function Composition

函数合成，接收多个函数作为参数并返回一个新函数的方式，新函数按照传入的参数顺序，从右往左依次执行，前一个函数的返回值是后一个函数的输入值：

```js
const compose = (f, g) => (a) => f(g(a))

const floorAndToString = compose((val) => val.toString(), Math.floor)

floorAndToString(121.212121) 
// => "121"
```

## Purity

一个纯函数需要满足两个条件，第一是函数的返回值只能由输入值（函数接收的参数）决定，也就是说纯函数接收相同的参数会返回相同的值；第二是纯函数不会对自身作用域之外的运行环境产生副作用（side effects），比如说不会改变外部环境中变量的值，这会被认为是不安全的行为：

```js
let greeting;
const greet = () => greeting = "Hi, " + window.name;

// greet() 执行时更改了外部环境的变量
greet(); 
// => "Hi, Brianne"
```

纯函数示例：

```js
const greet = (name) => "Hi, " + name ;

greet("Brianne") 
// => "Hi, Brianne"
```

## Side effects

如果函数或表达式与其自身作用域之外的可变数据（mutable data）发生了读写操作，那么此时函数和表达式就产生了副作用：

```js
let greeting;
const greet = () => greeting = "Hi, " + window.name;

// greet() 执行时更改了外部环境的变量
greet(); 
// => "Hi, Brianne"

// new Date() 是可变数据
const differentEveryTime = new Date();

// 这里表示系统接收到的输入值是不确定的，是一种可变数据
console.log("IO is a side effect!");
```

## Idempotent

幂等，同一个函数使用相同的参数嵌套执行多次的结果与执行一次的结果相同: 
    
$$f(...f(f(x))...)=f(x)$$

```js
Math.abs(Math.abs(10))

sort(sort(sort([2,1])))
```

## Point-Free Style

point-free style 是一种不显式向函数传递参数的代码风格，通常需要柯里化和高阶函数来实现：

```js
const map = (fn) => (list) => list.map(fn);
const add = (a) => (b) => a + b;

// Not points-free
// numbers 是一个显式传递的参数
const incrementAll = (numbers) => map(add(1))(numbers);

// Points-free
// add(1) 的返回值隐式传递给了 map，作为 map 的 list 参数
const incrementAll2 = map(add(1));
```

point-free style 的函数看起来就像是一个赋值表达式，没有使用我们常见的 `function` 或 `=>` 等来声明其接收的参数。

## Predicate

断言，一个返回布尔值的函数：

```js
const predicate = (a) => a > 2;

[1, 2, 3, 4].filter(predicate); 
// => [3, 4]
```

## Contracts

TODO

## Guarded Functions

TODO

## Categories

categories 内部都绑定了具体的函数用于约束或执行特定的逻辑，比如 Monoid。

## Value

任何可以赋值给变量的值都可以称为 `value`:

```js
5
Object.freeze({name: 'John', age: 30}) // The `freeze` function enforces immutability.
(a) => a
[1]
undefined
```

## Constant

常量，初始化后不能再次执行赋值操作的数据类型：

```js
const five = 5
const john = { name: 'John', age: 30 }

// 因为常量不可变，所以下面表达式一定为 true
john.age + five === ({ name: 'John', age: 30 }).age + (5)
```

常量具有 referentially transparent 的特性，也就是说将程序中出现的常量替换为它们实际的值，并不会影响程序的结果。译者话外：实际上在 JavaScript 中的 `const` 所声明的常量并不是完全稳定的，使用 Immutable.js 演示更加恰当：

```js
const five = fromJS(5);
const john = fromJS({name: 'John', age: 30})

john.get('age') + five === ({ name: 'John', age: 30 }).age + (5)
```

f(g()) === g 

## Functor

functor 都拥有 `map` 函数，并且在执行 `map` 之后会返回一个新的 functor:

```js
object.map(x => x) === object

object.map(x => f(g(x))) === object.map(g).map(f)
```

JavaScript 中最常见的 functor 就是数组类型的实例：

```js
[1, 2, 3].map(x => x); 
// => [1, 2, 3]

const f = x => x + 1;
const g = x => x * 2;

[1, 2, 3].map(x => f(g(x))); 
// => [3, 5, 7]
[1, 2, 3].map(g).map(f);     
// => [3, 5, 7]
```

## Pointed Functor

pointed functor 都拥有 `of` 函数，用于接收和构建 functor。ES2015 提供了 `Array.of` 函数，所以数组实例就可以看成是 pointed functor:

```js
Array.of(1) 
// => [1]
```

## Lift

lift 发生在你将值放入 functor 的时候，如果你将函数 lift 进了 Applicative Functor，那么就可以使用这个函数处理传递给这个 functor 的值。某些 lift 的实现拥有 lift 或 liftA2 函数，便于在 functor 上执行相关的函数：

```js
const mult = (a, b) => a * b;

const liftedMult = lift(mult); 
// => this function now works on functors like array

liftedMult([1, 2], [3]); 
// => [3, 6]
lift((a, b) => a + b)([1, 2], [3, 4]); 
// => [4, 5, 5, 6]
```

lift 一个单参数的函数非常类似于 `map` 操作：

```js
const increment = (x) => x + 1;

lift(increment)([2]); 
// => [3]
[2].map(increment); 
// => [3]
```

## Referential Transparency

如果一个表达式可以被替换为实际的值而不影响程序的运行结果，那么我们就说这个表达式是 referentially transparent：

```js
const greet = () => "Hello World!";
```

以上面代码为例，任何调用 `greet()` 的地方都可以替换为 `"Hello World!"` 而不影响程序的执行结果。

## Equational Reasoning

如果一个应用由多个表达式组合而成，且每个表达式都没有 side effect，那么这个应用就可以由部分推导出整体。

## Lambda

匿名函数，本质上是一个 value：

```js
function(a){
    return a + 1;
};

(a) => a + 1;

// Lambda 常用语高阶函数中
[1, 2].map((a) => a + 1); 
// = [2, 3]

// Lambda 作为 value 被赋值给变量
let addOne = (a) => a + 1;
```

## Lambda Calculus

数学的分支之一，使用函数创建通用的计算模型（[universal model of computation](https://en.wikipedia.org/wiki/Lambda_calculus)）。

## Lazy evaluation

惰性求值，是一种按需执行的求值策略，只有需要某个值时才会执行相关的表达式。在函数式编程语言中，这一特性可用于构造无限列表。

```js
const rand = function*() {
    while (true) {
        yield Math.random();
    }
}

const randIter = rand();
randIter.next().value; 
// 每次执行 next() 函数都会返回一个新的随机数
// 有且只有在执行 next() 的时候才会返回新值
```

## Monoid

Monoid，通过一个函数“合并”两个同类型数据后返回相同的数据类型。最简单的 monoid 就是两数相加：

```js
1 + 1; 
// => 2
```

这里的 `+` 就是上面所说的“合并”函数。Monoid 中存在恒等式的概念：

```js
1 + 0
// => 1
// 这里的 0 就是恒等式

// Monoid 还必须满足结合律
1 + (2 + 3) === (1 + 2) + 3; 
// => true

// 数组的 concat() 操作可以构造一个 monoid
[1, 2].concat([3, 4]); 
// => [1, 2, 3, 4]

// 空数组可以视为是恒等式
[1, 2].concat([]); 
// => [1, 2]
```

如果知道了一个函数的的恒等式和“合并”函数 compose，函数本身就是一个 monoid:

```js
const identity = (a) => a;
const compose = (f, g) => (x) => f(g(x));

compose(foo, identity) ≍ compose(identity, foo) ≍ foo
```

## Monad

Monad，是一个拥有 `of` 和 `chain` 函数的数据类型，`chain` 类似于 `map`，但它会输出非嵌套形式的结果：

```js
['cat,dog', 'fish,bird'].chain((a) => a.split(',')) 
// => ['cat', 'dog', 'fish', 'bird']

['cat,dog', 'fish,bird'].map((a) => a.split(',')) 
// => [['cat', 'dog'], ['fish', 'bird']]
```

在其他函数式编程语言中，`of` 也被称为 `return`，`chain` 也被称为 `flatmap` 和 `bind`。

## Comonad

Comonad，拥有 `extract` 和 `extend` 函数的数据类型：

```js
const CoIdentity = (v) => ({
    val: v,
    extract() { return this.val },
    extend(f) { return CoIdentity(f(this)) }
})

// extract() 可以从 functor 中取值
CoIdentity(1).extract() 
// => 1

// extend() 可以返回新的 comonad
CoIdentity(1).extend(co => co.extract() + 1) 
// => CoIdentity(2)
```

## Applicative Functor

Applicative Functor，是拥有 `ap` 函数的数据类型，`ap` 函数可以将 functor 中的值转化为其他 functor 中的同类型值：

```js
[(a) => a + 1].ap([1]) 
// => [2]
```

这一特性对于多个 applicative functor 需要接收多个参数时，就显得很有用：

```js
const arg1 = [1, 2];
const arg2 = [3, 4];
const add = (x) => (y) => x + y;

const partiallyAppliedAdds = [add].ap(arg1); 
// => [(y) => 1 + y, (y) => 2 + y]

partiallyAppliedAdds.ap(arg2); 
// => [4, 5, 5, 6]
```

## Morphism

态射，一个转换函数。

## Isomorphism

同构转换，相同数据下不同结构之间的转换。举例来说，2D 坐标既可以存储为数组 `[2, 3]` 也可以存储为 `{ x: 2, y: 3 }`：

```js
const pairToCoords = (pair) => ({x: pair[0], y: pair[1]})
const coordsToPair = (coords) => [coords.x, coords.y]

coordsToPair(pairToCoords([1, 2])) 
// => [1, 2]

pairToCoords(coordsToPair({x: 1, y: 2})) 
// => { x: 1, y: 2 }
```

## Setoid

Setoid，拥有 `equals` 函数的数据类型，可用于与其他同类型的数据进行比较。为 Array 类型添加 `equals` 函数使其成为 Setoid：

```js
Array.prototype.equals = (arr) => {
    const len = this.length
    if (len !== arr.length) {
        return false
    }
    for (let i = 0; i < len; i++) {
        if (this[i] !== arr[i]) {
            return false
        }
    }
    return true
}

[1, 2].equals([1, 2]) 
// => true
[1, 2].equals([0]) 
// => false
```

## Semigroup

Semigroup，拥有 `concat` 函数的数据类型，可以与同类型数据进行合并：

```js
[1].concat([2]) 
// => [1, 2]
```

## Foldable

Foldable，拥有 `reduce` 函数的数据类型，可以将 Foldable 的实例转换为其他数据类型：

```js
const sum = (list) => list.reduce((acc, val) => acc + val, 0);
sum([1, 2, 3]) 
// => 6
```

## Traversable

TODO

## Type Signatures

类型签名，在 JavaScript 中通常会在注释中写明当前函数的参数类型和返回值类型，虽然各种语言的类型签名不同，但通常与以下示例相似：

```js
// functionName :: firstArgType -> secondArgType -> returnType

// add :: Number -> Number -> Number
const add = (x) => (y) => x + y

// increment :: Number -> Number
const increment = (x) => x + 1
```

如果某个函数要作为参数传递给其他函数，那么在类型签名中需要使用括号包裹起这个函数的类型信息：

```js
// call :: (a -> b) -> a -> b
const call = (f) => (x) => f(x)
```

上面示例中的 `a`、`b` 表示参数可以是任何数据类型的，但在下面的代码中，`map` 的类型签名表示: f 是一个函数，f 接收一个 a 类型的参数，返回一个 b 类型的值，同时 map 是一个柯里化的函数，其第二个接收一个列表形式的 a 类型参数，并返回列表形式的 b 类型参数：

```js
// map :: (a -> b) -> [a] -> [b]
const map = (f) => (list) => list.map(f)
```

## Union type

联合类型，表示将多个类型信息放入一个类型变量中。JavaScript 中没有类型机制，所以让我们假设有一个类型变量 `NumOrString`，它表示 Number 或者 String 类型。`+` 运算符在 JavaScript 中既可用于 Number，也可用于 String，所以我们使用 `NumOrString` 定义 `+` 的输入输出类型信息：

```js
// add :: (NumOrString, NumOrString) -> NumOrString
const add = (a, b) => a + b;

add(1, 2); 
// => Number 3
add('Foo', 2); 
// => String "Foo2"
add('Foo', 'Bar'); 
// => String "FooBar"
```

## Product type

product type 同样包含多种基本类型：

```js
// point :: (Number, Number) -> {x: Number, y: Number}
const point = (x, y) => ({x: x, y: y});
```

## Option

Option，是 union type 的特例，它只包含两种类型 `Some` 和 `None`。Option 常用于表示那些不确定是否返回值的函数：

```js
// Naive definition
const Some = (v) => ({
    val: v,
    map(f) {
        return Some(f(this.val));
    },
    chain(f) {
        return f(this.val);
    }
});

const None = () => ({
    map(f){
        return this;
    },
    chain(f){
        return this;
    }
});

// maybeProp :: (String, {a}) -> Option a
const maybeProp = (key, obj) => typeof obj[key] === 'undefined' ? None() : Some(obj[key]);
```

使用 `chain` 函数执行链式调用可以返回具体的 `Option`：

```js
// getItem :: Cart -> Option CartItem
const getItem = (cart) => maybeProp('item', cart);

// getPrice :: Item -> Option Number
const getPrice = (item) => maybeProp('price', item);

// getNestedPrice :: cart -> Option a
const getNestedPrice = (cart) => getItem(obj).chain(getPrice);

getNestedPrice({}); 
// => None()
getNestedPrice({item: {foo: 1}}); 
// => None()
getNestedPrice({item: {price: 9.99}}); 
// => Some(9.99)
```

某些语言中使用 `Maybe` 表示 `Option`，使用 `Just` 表示 `Some`，使用 `Nothing` 表示 `Node`。
