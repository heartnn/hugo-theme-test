+++
description = ""
tags = ["node.js"]
categories = ["doc"]
isCJKLanguage = true
date = "2016-11-13T10:29:28+08:00"
title = "assertion-testing"
weight = 0
notoc = false
+++

## 断言

<div class="s s3"></div>

`assert` 模块提供了一系列的断言测试函数，设计这些辅助函数的初衷是服务于 Node.js 内建模块的开发和测试，当然开发者也可以通过 `require('assert')` 将其应用到第三方模块的开发中。不过，`assert` 模块不是一个测试框架，不建议用作通用的断言库。

当前 `assert` 模块的 API 处于锁定状态，这意味着该模块将不会轻易新增或修改现有接口。

## assert(value[, message])

等同于 `assert.ok()`:

```js
const assert = require('assert');

assert(true);  
// OK
assert(1);     
// OK
assert(false);
// throws "AssertionError: false == true"
assert(0);
// throws "AssertionError: 0 == true"
assert(false, 'it\'s false');
// throws "AssertionError: it's false"
```

## assert.deepEqual(actual, expected[, message])

判断参数 `actual` 和 `expected` 是否深度相等，对参数中的原始值（primitive value）使用 `==` 进行比较。

`deepEqual()` 只会遍历比较对象的自有属性，不会比较对象的原型、symbol 和不可遍历的属性，所以在某些情况下结果可能会出人意料。比如在下面的示例中就不会抛出 `AssertionError`，这是因为 Error 对象的属性不是可枚举属性：

```js
// WARNING: This does not throw an AssertionError!
assert.deepEqual(Error('a'), Error('b'));
```

方法名中的 `Deep` 一词意指会对传入的两个对象进行深度比较，包括对对象子级属性的比较：

```js
const assert = require('assert');

const obj1 = {
    a: {
        b: 1
    }
};
const obj2 = {
    a: {
        b: 2
      }
};
const obj3 = {
    a: {
        b: 1
    }
}
const obj4 = Object.create(obj1);

assert.deepEqual(obj1, obj1);
// OK, object is equal to itself

assert.deepEqual(obj1, obj2);
// AssertionError: { a: { b: 1 } } deepEqual { a: { b: 2 } }
// values of b are different

assert.deepEqual(obj1, obj3);
// OK, objects are equal

assert.deepEqual(obj1, obj4);
// AssertionError: { a: { b: 1 } } deepEqual {}
// 原型继承而来的属性不计入比较范围
```

如果 actual 和 expected 不相等，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.deepStrictEqual(actual, expected[, message])

与 `assert.deepEqual()` 的功能基本相同，区别在于，`assert.deepStrictEqual()` 使用 `===` 判断原始值是否相等，这里的原始值既包括对象自身的属性，也包括引用的子对象的属性：

```js
const assert = require('assert');

assert.deepEqual({a:1}, {a:'1'});
// OK, because 1 =a= '1'

assert.deepStrictEqual({a:1}, {a:'1'});
// AssertionError: { a: 1 } deepStrictEqual { a: '1' }
// because 1 !== '1' using strict equality
```

如果 actual 和 expected 不相等，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.doesNotThrow(block[, error][, message])

`assert.doesNotThrow()` 期望传入的 `block` 函数不会抛出错误，更多信息请查看 [assert.thorws()](#assertthrowsblock-error-message)。

调用 `assert.doesNotThrow()` 时，会立即执行 `block` 函数。

如果 `block` 函数抛出了错误，且错误类型与 `error` 参数指定的类型相符，就会抛出 `AssertionError` 错误；如果 `block` 函数抛出的错误类型与 `error` 参数指定的类型不符，或者未传入可选参数 `error`，则错误会被传递给函数的调用者。

由于传入的 `error` 参数为 `SyntaxError` 与 `block` 函数的错误不匹配，所以下面的示例代码将会抛出 `block` 函数产生的 `TypeError`：

```js
assert.doesNotThrow(
    () => {
        throw new TypeError("Wrong Type");
    },
    SyntaxError
);
```

如果 `error` 参数指定的错误与 `block` 函数抛出的错误匹配，则抛出 `AssertionError`：

```js
assert.doesNotThrow(
    () => {
        throw new TypeError("Wrong Type");
    },
    TypeError
);
```

如果提供了可选参数 `message` 字符串，那么该字符串信息会被附加到 `AssertionError` 信息之后：

```js
assert.doesNotThrow(
    () => {
        throw new TypeError('Wrong value');
    },
    TypeError,
    'Whoops'
);
// Throws: AssertionError: Got unwanted exception (TypeError). Whoops
```

## assert.equal(actual, expected[, message])

使用 `==` 比较 `actual` 参数和 `expected` 参数是否相等，如果参数是原始值，则比较值是否相等；如果参数是引用值，则比较内存地址是否相等：

```js
const assert = require('assert');

assert.equal(1, 1);
// OK, 1 == 1
assert.equal(1, '1');
// OK, 1 == '1'

assert.equal(1, 2);
// AssertionError: 1 == 2
assert.equal({a: {b: 1}}, {a: {b: 1}});
// AssertionError: { a: { b: 1 } } == { a: { b: 1 } }
```

如果 actual 和 expected 不相等，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.fail(actual, expected, message, operator)

抛出 `AssertionError`。如果参数 `message == undefined`，则错误信息为 `actual #{operator} expected`；如果参数 `message != undefined`，则错误信息为参数 `message`：

```js
const assert = require('assert');

assert.fail(1, 2, undefined, '>');
// AssertionError: 1 > 2

assert.fail(1, 2, 'whoops', '>');
// AssertionError: whoops
```

## assert.ifError(value)

如果 `value` 为真值，则抛出 `value`，这对于测试回调函数中的 `error` 参数很有用：

```js
const assert = require('assert');

assert.ifError(0); // OK
assert.ifError(1); // Throws 1
assert.ifError('error') // Throws 'error'
assert.ifError(new Error()); // Throws Error
```

## assert.notDeepEqual(actual, expected[, message])

与 assert.deepEqual() 的功能相反，该函数用于测试 `actual` 参数和 `expected` 参数是否不深度相等：

```js
const assert = require('assert');

const obj1 = {
    a: {
        b: 1
    }
};
const obj2 = {
    a: {
        b: 2
      }
};
const obj3 = {
    a: {
        b: 1
    }
}
const obj4 = Object.create(obj1);

assert.notDeepEqual(obj1, obj1);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj2);
// OK, obj1 and obj2 are not deeply equal

assert.notDeepEqual(obj1, obj3);
// AssertionError: { a: { b: 1 } } notDeepEqual { a: { b: 1 } }

assert.notDeepEqual(obj1, obj4);
// OK, obj1 and obj2 are not deeply equal
```

如果 actual 和 expected 深度相等，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.notDeepStrictEqual(actual, expected[, message])

与 assert.notDeepStrictEqual() 的功能相反，该函数用于测试 `actual` 参数和 `expected` 参数是否不严格深度相等：

```js
const assert = require('assert');

assert.notDeepEqual({a:1}, {a:'1'});
// AssertionError: { a: 1 } notDeepEqual { a: '1' }

assert.notDeepStrictEqual({a:1}, {a:'1'});
// OK
```

如果 actual 和 expected 相等，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.notEqual(actual, expected[, message])

使用 `!=` 比较 `actual` 参数和 `expected` 参数是否不相等，如果参数是原始值，则比较值是否不相等；如果参数是引用值，则比较内存地址是否不相等：

```js
const assert = require('assert');

assert.notEqual(1, 2);
// OK

assert.notEqual(1, 1);
// AssertionError: 1 != 1

assert.notEqual(1, '1');
// AssertionError: 1 != '1'
```

如果 actual 和 expected 相等，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.notStrictEqual(actual, expected[, message])

使用 `!==` 比较 `actual` 参数和 `expected` 参数是否不相等：

```js
const assert = require('assert');

assert.notStrictEqual(1, 2);
// OK

assert.notStrictEqual(1, 1);
// AssertionError: 1 != 1

assert.notStrictEqual(1, '1');
// OK
```

如果 actual 和 expected 相等，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.ok(value[, message])

测试 `value` 是否为真值，等同于 `assert.equal(!!value, true, message)`:

```js
const assert = require('assert');

assert.ok(true);  
// OK

assert.ok(1);     
// OK

assert.ok(false);
// throws "AssertionError: false == true"

assert.ok(0);
// throws "AssertionError: 0 == true"

assert.ok(false, 'it\'s false');
// throws "AssertionError: it's false"
```

如果 `value` 不为真值，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.strictEqual(actual, expected[, message])

使用 `===` 比较 `actual` 参数和 `expected` 参数是否相等：

```js
const assert = require('assert');

assert.strictEqual(1, 2);
// AssertionError: 1 === 2

assert.strictEqual(1, 1);
// OK

assert.strictEqual(1, '1');
// AssertionError: 1 === '1'
```

如果 actual 和 expected 不相等，则抛出 `AssertionError` 错误和 `message` 错误信息。这里的 `message` 参数为可选字符串参数，如果未传入该参数，系统自动分配默认的错误信息。

## assert.throws(block[, error][, message])

`assert.throws()` 期望传入的 `block` 函数会抛出错误（译者注：如果 `block` 函数抛出错误，`assert.throws()` 无返回值，表示正常；如果未抛出错误，则 `assert.throws()` 抛出 AssertionError 错误），可选参数 `error` 可以是构造函数、正则表达式和自定义的检验函数。

使用构造函数校验错误实例：

```js
assert.throws(
    () => {
        throw new Error('Wrong value');
    },
    Error
);
```

使用正则表达式校验错误信息：

```js
assert.throws(
    () => {
        throw new Error('Wrong value');
    },
    /value/
);
```

使用自定义函数校验错误实例和错误信息：

```js
assert.throws(
    () => {
        throw new Error('Wrong value');
    },
    function(err) {
        if ( (err instanceof Error) && /value/.test(err) ) {
            return true;
        }
    },
    'unexpected error'
);
```

注意，这里的 `error` 参数不能是字符串，如果该参数是字符串，则会触发错误并被识别为 `message` 信息，这是非常容易被忽略的错误用法：

```js
// THIS IS A MISTAKE! DO NOT DO THIS!
assert.throws(myFunction, 'missing foo', 'did not throw with expected message');

// Do this instead.
assert.throws(myFunction, /missing foo/, 'did not throw with expected message');
```

<style>
.s {
    margin: 1.5rem 0;
    padding: 10px 20px;
    color: white;
    border-radius: 5px;
}
.s:before {
    display: block;
    font-size: 2rem;
    font-weight: 900;
}
.s0 {
    background-color: #C04848;
}
.s0:before {
    content: "接口稳定性: 0 - 已过时";
}
.s1 {
    background-color: #F07241;
}
.s1:before {
    content: "接口稳定性: 1 - 实验中";
}
.s2 {
    background-color: #457D97;
}
.s2:before {
    content: "接口稳定性: 2 - 稳定";
}
.s3 {
    background-color: #14C3A2;
}
.s3:before {
    content: "接口稳定性: 3 - 已锁定";
}
</style>
