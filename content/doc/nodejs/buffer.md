+++
description = ""
tags = ["node.js"]
categories = ["doc"]
isCJKLanguage = true
date = "2016-11-14T10:29:28+08:00"
title = "buffer"
weight = 0
notoc = false
+++

## Buffer

<div class="s s2"></div>

在 ECMAScript 2015（ES6）引入 `TypedArray` 之前，JavaScript 语言中并没有读写二进制数据流的机制。Node.js API 中的 `Buffer` 类提供了与八进制数据流交互的机制，常用于处理 TCP 数据流和文件操作。

在 ES6 增加了 `TypedArray` 之后，`Buffer` 类基于 `Uint8Array` 接口重新做了修改，根据 Node.js 的实际情况优化了某些方面的性能表现，使其更适用于 Node.js 的开发环境。

`Buffer` 类的实例非常类似整数数组，但其大小是固定不变的，由 V8 分配原始内存空间。`Buffer` 类的实例一旦生成，所占有的内存大小就不能再进行调整。

`Buffer` 类是 Node.js 的全局对象，无需像其他模块一样使用 `require()` 引入到当前文件：

```js
const buf1 = Buffer.alloc(10);
// Creates a zero-filled Buffer of length 10.

const buf2 = Buffer.alloc(10, 1);
// Creates a Buffer of length 10, filled with 0x01.

const buf3 = Buffer.allocUnsafe(10);
// Creates an uninitialized buffer of length 10.
// This is faster than calling Buffer.alloc() but the returned
// Buffer instance might contain old data that needs to be
// overwritten using either fill() or write().

const buf4 = Buffer.from([1,2,3]);
// Creates a Buffer containing [01, 02, 03].

const buf5 = Buffer.from('test');
// Creates a Buffer containing ASCII bytes [74, 65, 73, 74].

const buf6 = Buffer.from('tést', 'utf8');
// Creates a Buffer containing UTF8 bytes [74, c3, a9, 73, 74].
```

## Buffer.from() / Buffer.alloc() / Buffer.allocUnsafe()

在 Node.js v6 之前，我们使用 `new Buffer()` 的方式创建 Buffer 实例，但这种方式会由于传入的参数类型不同具有不同的返回结果：

- 如果传入的第一个参数是数值（比如 `new Buffer(10)`），则生成一个特定长度的 Buffer 对象，但是此类 Buffer 实例分配到的内存是未经初始化和包含敏感数据的内存。此类 Buffer 实例必须通过 `buf.fill(0)` 或一次完整的数据重写手动完成内存的初始化操作。虽然这种方式有助于改善性能，但是过往的开发经验表明，我们需要特定的函数分别用作创建未初始化和已初始化的 Buffer 实例，使其职责清晰
- 如果传入的第一个参数是字符串、数组或 Buffer 实例，则系统会将它们的数据拷贝到新的 Buffer 实例中
- 如果传入的参数是 ArrayBuffer 实例，则生成的 Buffer 实例与该 ArrayBuffer 实例共享同一段内存

由于 `new Buffer()` 会根据第一个参数的类型发生不同的行为，所以当应用程序无法合理校验传入 `new Buffer()` 的参数或无法正确初始化 Buffer 实例的内存时，就有可能会在代码中引入安全性和可靠性问题。

为了避免创建 Buffer 实例时产生的安全性和可靠性问题，所以在新版本中建议放弃使用 `new Buffer()` 并使用 `Buffer.from()`、`Buffer.alloc()` 和 `Buffer.allocUnsafe()` 方法。

开发者应该使用以下函数替换过去使用 `new Buffer()` 创建的 Buffer 实例：

- `Buffer.from(array)`，创建并返回一个包含 `array` 数据的 Buffer 实例
- `Buffer.from(arrayBuffer[, byteOffset [, length]])`，创建并返回一个与 `ArrayBuffer` 共享内存片段的 Buffer 实例
- `Buffer.from(buffer)`，创建并返回一个包含 `buffer` 数据的 Buffer 实例
- `Buffer.from(str[, encoding])`，创建并返回一个包含 `str` 数据的 Buffer 实例
- `Buffer.alloc(size[, fill[, encoding]])`，创建并返回一个已初始化的 Buffer 实例，长度为 `size`，该方法在性能上虽然明显比 `Buffer.allocUnsafe(size)` 慢很多，但可以保证新建的 Buffer 实例绝对不会包含敏感或遗留数据
- `Buffer.allocUnsafe(size)` 和 `Buffer.allocUnsafeSlow(size)` 都可以新建 Buffer 实例，但不会自动初始化内存片段，必须使用 `buf.fill(0)` 或重写内存片段的方式对内存片段进行初始化。

如果 `Buffer.allocUnsafe(size)` 的 `size` 小于或等于 `Buffer.poolSize` 的一半，那么 Buffer 实例就有可能由内部共享内存池分配内存片段，而使用 `Buffer.allocUnsafeSlow(size)` 生成的 Buffer 实例则不会使用内部的共享内存池。

#### `--zero-fill-buffers`

如果在命令行中以 `--zero-fill-buffers` 命令启动 Node.js，将会强制为 Buffer 实例分配新内存并自动初始化为 0。使用该命令会改变一些默认行为，并对系统性能造成一些影响。建议只在处理敏感数据时使用该数据：

```bash
$ node --zero-fill-buffers
> Buffer.allocUnsafe(5);
<Buffer 00 00 00 00 00>
```

#### 为什么 `Buffer.allocUnsafe(size)` 和 `Buffer.allocUnsafeSlow(size)` unsafe?

当使用 `Buffer.allocUnsafe(size)` 和 `Buffer.allocUnsafeSlow(size)` 生成 Buffer 实例时，其分配到的内存片段都是未经初始化的。虽然这种操作执行速度快，但这些内存片段可能包含遗漏数据和敏感信息，那么当系统读取 Buffer 实例内存内容时，就有可能发生内存泄露。

虽然 `Buffer.allocUnsafe()` 的执行性能很好，但必须十分小心由此造成的安全性问题。

## Buffer 和字符编码

Buffer 实例常用于处理编码后的字符序列，比如 UTF8 / UCS2 / Base64 甚至是十六进制编码后的数据。通过指定字符编码，数据可以在 Buffer 实例和原始的 JavaScript 字符串之间来回转换：

```js
const buf = Buffer.from('hello world', 'ascii');
console.log(buf.toString('hex'));
// prints: 68656c6c6f20776f726c64
console.log(buf.toString('base64'));
// prints: aGVsbG8gd29ybGQ=
```                      

当前 Node.js 支持以下字符编码格式：

- `ascii`，仅支持大小为 7 位的 ASCII 字符，该方法解析速度快。如果字符编码超过 127，则自动去除高位。
- `utf8`，使用多个字节对 unicode 字符进行编码。诸多 web 页面和文档都在采用 UTF-8 编码规范。
- `utf16le`，大小为二到四个字节，以小端字节序对 unicode 字符进行编码，支持代理对（surrogate pair, U+10000 ~ U+10FFFF)。
- `ucs2`，`utf16le` 的别名。
- `base64`，Base64 编码。
- `binary`，将 Buffer 实例转换为单字节（latin-1）的字符串，Node.js 并不支持 `latin-1` 这个参数，所以请使用 `binary` 表示 `latin-1`。
- `hex`，将每个字节转换为两个十六进制字符。

## Buffer 和 TypedArray

Buffer 实例实际上也是 `TypedArray` 中 `Uint8Array` 的实例，不过，这里的 `TypedArray` 与 ECMAScript 2015 规范所规定的 `TypedArray` 稍有不同。举例来说，规范规定 `ArrayBuffer#slice()` 方法创建一个内存拷贝，而 Node.js 中 `Buffer#slice()` 则会根据既有的 Buffer 实例新建一个视图（View，译者注：ES2015 中有两种视图，分别是 TypedArray 和 DataView），而不是拷贝数据，提高执行效率。

使用 `Buffer` 类创建 `TypedArray` 实例还需留意以下几点特征：

1. `Buffer` 实例的内存数据会被拷贝到 `TypedArray` 实例中，它们之间不是内存共享的关系。
1. `Buffer` 实例的内存数据会被解释为一个直观的整数数组，而不是一个特定类型的单元素数组。举例来说，`new Uint32Array(new Buffer([1,2,3,4]))` 会创建一个 `Uint32Array` 视图，它包含 `[1,2,3,4]` 四个元素，而不是创建一个 `Uint32Array` 类型的单元素数组 `[0x1020304]` 或 `[0x4030201]`。

如果你想创建一个和 `TypedArray` 实例共享内存的 `Buffer` 实例，可以使用 TypedArray 对象的 `.buffer` 属性：

```js
const arr = new Uint16Array(2);
arr[0] = 5000;
arr[1] = 4000;

const buf1 = Buffer.from(arr); // copies the buffer
const buf2 = Buffer.from(arr.buffer); // shares the memory with arr;

console.log(buf1);
// Prints: <Buffer 88 a0>, copied buffer has only two elements
console.log(buf2);
// Prints: <Buffer 88 13 a0 0f>

arr[1] = 6000;
console.log(buf1);
// Prints: <Buffer 88 a0>
console.log(buf2);
// Prints: <Buffer 88 13 70 17>
```

使用 `TypedArray` 的 `.buffer` 属性创建 Buffer 实例时，可以使用 `byteOffset` 和 `length` 参数截取 `ArrayBuffer` 的内存数据：

```js
const arr = new Uint16Array(20);
const buf = Buffer.from(arr.buffer, 0, 16);
console.log(buf.length);
// Prints: 16
```

`Buffer.from()` 和 `TypedArray.from()`（比如 `Uint8Array.from()`）拥有不同的参数和实现，举例来说，TypedArray 接收一个函数作为第二个参数，该函数可被每个元素调用：

- `TypedArray.from(source[, mapFn[, thisArg]])`

但是 `Buffer.from` 函数不具有这种用法：

- `Buffer.from(array)`
- `Buffer.from(buffer)`
- `Buffer.from(arrayBuffer[, byteOffset [, length]])`
- `Buffer.from(str[, encoding])`

## Buffers 和 ES6 遍历器

使用 ECMAScript 2015 提供的 `for...of` 语法可以遍历 Buffer 实例：

```js
const buf = Buffer.from([1, 2, 3]);

for (var b of buf)
  console.log(b)

// Prints:
//   1
//   2
//   3
```

此外，使用 `buf.values()`、`buf.keys()` 和 `buf.entries()` 方法可以创建遍历器实例。

## Class: Buffer

Buffer 类是一个用于处理二进制数据的全局对象，Node.js 提供了多种方法来创建 Buffer 实例。

#### new Buffer(...)

`new Buffer()` 的创建方式已在 Node.js 6+ 中被抛弃，此处不再翻译。



#### 成员方法：Buffer.byteLength(string[, encoding])

- `string`，字符串
- `encoding`，字符串格式的可选参数，默认值为 `utf8`
- 返回值类型：Number

返回字符串的实际字节长度。与 `String.prototype.length` 不同的是，该方法返回数值表示字符串占多少字节，而 `String.prototype.length` 返回的数值表示字符串有多少个字符。

```js
const str = '\u00bd + \u00bc = \u00be';

console.log(`${str}: ${str.length} characters, ` +
            `${Buffer.byteLength(str, 'utf8')} bytes`);
// ½ + ¼ = ¾: 9 个字符, 12 个字节
```

#### 成员方法：Buffer.compare(buf1, buf2)

- `buf1`，Buffer 实例
- `buf2`，Buffer 实例
- 返回值类型：Number

比较 `buf1` 和 `buf2` 常常是为了对 Buffer 实例的数组进行排序，该方法等同于 `buf1.compare(buf2)`:

```js
const arr = [Buffer('1234'), Buffer('0123')];
arr.sort(Buffer.compare);
```

#### 成员方法：Buffer.concat(list[, totalLength])

- `list`，用于合并的 Buffer 实例数组
- `totalLength，数值类型的可选参数，用于说明数组中所有 Buffer 实例的字节之和
- 返回值类型：Buffer

返回一个 Buffer 实例，该实例是传入的 Buffer 实例数组中所有元素合并后生成的。如果实例数组为空，或者 `totalLength` 为 0，则返回一个长度为 0 的 Buffer 实例。

如果没有传入 `totalLength` 参数，则系统根据 `list` 参数中所有实例的大小自动求取。不过，这需要系统通过循环计算出来字节总数，所以通过提供该参数可以提高系统的执行效率。

```js
const buf1 = new Buffer(10).fill(0);
const buf2 = new Buffer(14).fill(0);
const buf3 = new Buffer(18).fill(0);
const totalLength = buf1.length + buf2.length + buf3.length;

console.log(totalLength);
const bufA = Buffer.concat([buf1, buf2, buf3], totalLength);
console.log(bufA);
console.log(bufA.length);

// 42
// <Buffer 00 00 00 00 ...>
// 42
```

#### 成员方法：Buffer.isBuffer(obj)

- `obj`，对象类型的参数
- 返回值类型：Boolean

如果 `obj` 为 Buffer 实例，则返回 `true`，反之异然。

#### 成员方法：Buffer.isEncoding(encoding)

- `encoding`，字符串形式的字符串编码说明
- 返回值类型：Boolean

如果 `encoding` 参数为合法的字符串编码，则返回 `true`，反之异然。

#### buf[index]

`[index]` 索引操作可以用于从 Buffer 实例的指定位置存取（get and set）二进制数据。`index` 的值为单字节数据，所以在这里索引的合法范围是 0x00 ~ 0xFF（十六进制）或者 0 ~ 255（十进制）。

```js
const str = "Node.js";
const buf = new Buffer(str.length);

for (var i = 0; i < str.length ; i++) {
  buf[i] = str.charCodeAt(i);
}

console.log(buf);
// 输出结果: Node.js
```

#### buf.compare(otherBuffer)

- `otherBuffer`，Buffer 实例
- 返回值类型：Number

比较两个 Buffer 实例，返回一个数值，用于标识 `buf` 和 `otherBuffer` 的先后顺序。比较过程是基于每个 Buffer 实例的元素顺序进行的。

- `0` 表示 `buf` 和 `otherBuffer` 相同
- `1` 表示排序时 `otherBuffer` 应该排在 `buf` 之前
- `-1` 表示排序时 `otherBuffer` 应该排在 `buf` 之后

```js
const buf1 = new Buffer('ABC');
const buf2 = new Buffer('BCD');
const buf3 = new Buffer('ABCD');

console.log(buf1.compare(buf1));
// 输出结果: 0
console.log(buf1.compare(buf2));
// 输出结果: -1
console.log(buf1.compare(buf3));
// 输出结果: -1
console.log(buf2.compare(buf1));
// 输出结果: 1
console.log(buf2.compare(buf3));
// 输出结果: 1

[buf1, buf2, buf3].sort(Buffer.compare);
// 输出结果: [buf1, buf3, buf2]
```

#### buf.copy(targetBuffer[, targetSet[, sourceStart[, sourceEnd]]])

- `targetBuffer`，Buffer 实例，拷贝目标（将 buf 的数据拷贝到 targetBuffer)
- `targetStart`，默认值为 `0`
- `sourceStart`，默认值为 `0`
- `sourceEnd`，默认值为 `buffer.length`
- 返回值类型：Number，说明拷贝的字节总数

该方法用于将数据从 `buf` 拷贝到 `targetBuffer`，即使对自身进行拷贝也没有问题。

```js
const buf1 = new Buffer(26);
const buf2 = new Buffer(26).fill('!');

for (var i = 0 ; i < 26 ; i++) {
  buf1[i] = i + 97; // 97 is ASCII a
}

buf1.copy(buf2, 8, 16, 20);
console.log(buf2.toString('ascii', 0, 25));
// Prints: !!!!!!!!qrst!!!!!!!!!!!!!
```

下面代码演示了对自身进行的拷贝：

```js
const buf = new Buffer(26);

for (var i = 0 ; i < 26 ; i++) {
  buf[i] = i + 97; // 97 is ASCII a
}

buf.copy(buf, 0, 4, 10);
console.log(buf.toString());
// efghijghijklmnopqrstuvwxyz
```

#### buf.entries()

- 返回值类型：Iterator

根据 Buffer 实例的数据创建并返回一个格式为 `[index, byte]` 的遍历器：

```js
const buf = new Buffer('buffer');
for (var pair of buf.entries()) {
  console.log(pair);
}
// 输出结果:
// [0, 98]
// [1, 117]
// [2, 102]
// [3, 102]
// [4, 101]
// [5, 114]
```

#### buf.equals(otherBuffer)

- `otherBuffer`，Buffer 实例
- 返回值类型：Boolean

该方法用于判断两个 Buffer 实例是否具有相同的值，如果相等则返回 `true`，反之异然。

```js
const buf1 = new Buffer('ABC');
const buf2 = new Buffer('414243', 'hex');
const buf3 = new Buffer('ABCD');

console.log(buf1.equals(buf2));
// 输出结果: true
console.log(buf1.equals(buf3));
// 输出结果: false
```

#### buf.fill(value[, offset[, end]])

- `value`，字符串或者数值
- `offset`，数值，默认值为 0
- `end`，数值，默认值为 `buffer.length`
- 返回值类型：Buffer

将 Buffer 实例的每个值置为 `value` 参数所表示的值。如果未传入了 `offset` 和 `end` 参数，默认重置 Buffer 实例的所有元素。因为该实例方法返回 Buffer 实例自身，所以可以执行链式调用。

```js
const b = new Buffer(50).fill('h');
console.log(b.toString());
// 输出结果: hhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhhh
```

#### buf.indexOf(vlaue[, byteOffset][, encoding])

- `value`，字符串，Buffer 实例或者数值
- `byteOffset`，默认值为 0
- `encoding`，默认值为 'utf8'
- 返回值类型：Number

该实例方法类似于 `Array#indexOf()` 方法，如果查找成功，则返回 `value` 的起始位置；如果查找失败，则返回 `-1`。`value` 参数可以是字符串、Buffer 实例或者数值。如果传入的 `vlaue` 参数是字符串类型，默认被解释为 `UTF8` 编码格式；如果传入的 `value` 参数是 Buffer 实例，默认查找与 Buffer 实例整体内容相匹配的值（使用 `buf.slice()` 可以查找 Buffer 实例的部分值）；如果传入的 `value` 参数是数值类型，则只能使用 0 ~ 255 之间数值（如果值为负，则表示从后往前查找）。

```js
const buf = new Buffer('this is a buffer');

buf.indexOf('this');
// 返回值： 0
buf.indexOf('is');
// 返回值： 2
buf.indexOf(new Buffer('a buffer'));
// 返回值： 8
buf.indexOf(97);
// ascii for 'a'
// 返回值： 8
buf.indexOf(new Buffer('a buffer example'));
// 返回值： -1
buf.indexOf(new Buffer('a buffer example').slice(0,8));
// 返回值： 8

const utf16Buffer = new Buffer('\u039a\u0391\u03a3\u03a3\u0395', 'ucs2');

utf16Buffer.indexOf('\u03a3',  0, 'ucs2');
// 返回值： 4
utf16Buffer.indexOf('\u03a3', -4, 'ucs2');
// 返回值： 6
```

#### buf.includes(value[, byteOffset][, encoding])

- `value`，字符串，Buffer 实例或者数值
- `byteOffset`，默认值为 0
- `encoding`，默认值为 'utf8'
- 返回值类型：Number

该实例方法类似于 `Array#includes()`，其中 `value` 参数可以是字符串、Buffer 实例或者数值。。如果传入的 `vlaue` 参数是字符串类型，默认被解释为 `UTF8` 编码格式；如果传入的 `value` 参数是 Buffer 实例，默认查找与 Buffer 实例整体内容相匹配的值（使用 `buf.slice()` 可以查找 Buffer 实例的部分值）；如果传入的 `value` 参数是数值类型，则只能使用 0 ~ 255 之间数值（如果值为负，则表示从后往前查找）。

可选参数 `byteOffset` 表示在 `buf` 中检索的起点位置：

```js
const buf = new Buffer('this is a buffer');

buf.includes('this');
// 返回结果： true
buf.includes('is');
// 返回结果： true
buf.includes(new Buffer('a buffer'));
// 返回结果： true
buf.includes(97);
// ascii for 'a'
// 返回结果： true
buf.includes(new Buffer('a buffer example'));
// 返回结果： false
buf.includes(new Buffer('a buffer example').slice(0,8));
// 返回结果： true
buf.includes('this', 4);
// 返回结果： false
```

#### buf.keys()

- 返回值类型：Iterator

根据 Buffer 实例的键创建和返回一个 Iterator:

```js
const buf = new Buffer('buffer');
for (var key of buf.keys()) {
  console.log(key);
}
// 返回结果:
// 0
// 1
// 2
// 3
// 4
// 5
```

#### buf.length

- 返回值类型：Number

该属性返回 Buffer 实例在内存中所占有的字节大小。值得注意的是，该属性并不表示 Buffer 实例的使用量，比如下面的这个例子，虽然 Buffer 实例占有 1234 个字节，但是只有 11 个字节用于存储 ASCII 字符，其他空间处于闲置状态：

```js
const buf = new Buffer(1234);

console.log(buf.length);
// 输出结果: 1234

buf.write('some string', 0, 'ascii');
console.log(buf.length);
// 输出结果: 1234
```

该属性是不可变属性（immutable），修改该属性将会返回 undefined，且会影响 Buffer 实例的正常使用。如果你想修改 `length` 属性，可以变通地使用 `buf.slice()` 方法创建一个新 Buffer 实例：

```js
const buf = new Buffer(10);
buf.write('abcdefghj', 0, 'ascii');
console.log(buf.length);
// 输出结果: 10
buf = buf.slice(0,5);
console.log(buf.length);
// 输出结果: 5
```

#### buf.rendDoubleBE(offset[, noAssert])
#### buf.rendDoubleLE(offset[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - 8`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个 64 位的双精度浮点数（double 类型），如果使用的是 `readDoubleBE()`，则使用大端字节序读取；如果使用的是 `readDoubleLE()`，则使用小端字节序读取。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 8`。

```js
const buf = new Buffer([1,2,3,4,5,6,7,8]);

buf.readDoubleBE();
// 返回结果: 8.20788039913184e-304
buf.readDoubleLE();
// 返回结果: 5.447603722011605e-270
buf.readDoubleLE(1);
// throws RangeError: 索引越界

buf.readDoubleLE(1, true);
// Warning: reads passed end of buffer!
// Segmentation fault! don't do this!
```

#### buf.rendFloatBE(offset[, noAssert])
#### buf.rendFloatLE(offset[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - 4`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个 32 位的单精度浮点数（float 类型），如果使用的是 `readFloatBE()`，则使用大端字节序读取；如果使用的是 `readFloatLE()`，则使用小端字节序读取。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 4`。

```js
const buf = new Buffer([1,2,3,4]);

buf.readFloatBE();
// 返回结果: 2.387939260590663e-38
buf.readFloatLE();
// 返回结果: 1.539989614439558e-36
buf.readFloatLE(1);
// throws RangeError: 索引越界

buf.readFloatLE(1, true);
// Warning: reads passed end of buffer!
// Segmentation fault! don't do this!
```

#### buf.reanInt8(offset[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - 1`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个单字节整数（int 类型）。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 1`。

```js
const buf = new Buffer([1,-2,3,4]);

buf.readInt8(0);
// 返回结果: 1
buf.readInt8(1);
// 返回结果: -2
```

#### buf.readInt16BE(offset[, noAssert])
#### buf.readInt16LE(offset[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - 2`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个 16 位的双字节整数（int 类型），如果使用的是 `readInt16BE()`，则使用大端字节序读取；如果使用的是 `readInt16LE()`，则使用小端字节序读取。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 2`。

```js
const buf = new Buffer([1,-2,3,4]);

buf.readInt16BE();
// 返回结果: 510
buf.readInt16LE();
// 返回结果: -511
```

#### buf.readInt32BE(offset[, noAssert])
#### buf.readInt32LE(offset[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - 4`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个 32 位的双字节整数（int 类型），如果使用的是 `readInt32BE()`，则使用大端字节序读取；如果使用的是 `readInt32LE()`，则使用小端字节序读取。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 4`。

```js
const buf = new Buffer([1,-2,3,4]);

buf.readInt32BE();
// 返回结果: 33424132
buf.readInt32LE();
// 返回结果: 67370497
```

#### buf.readIntBE(offset, byteLength[, noAssert])
#### buf.readIntLE(offset, byteLength[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - byteLength`
- `byteLength`，数值，取值范围为 `0 < byteLength <= 6`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个长度为 `byteLength` 的字节，最高精度为 48 位。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - byteLength`。

```js
const buf = new Buffer(6);
buf.writeUInt16LE(0x90ab, 0);
buf.writeUInt32LE(0x12345678, 2);
buf.readIntLE(0, 6).toString(16);  
// 返回结果: '1234567890ab'

buf.readIntBE(0, 6).toString(16);
// 返回结果: -546f87a9cbee
```

#### buf.readUInt8(offset[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - 1`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个 8 位的无符号整数。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 1`。

```js
const buf = new Buffer([1,-2,3,4]);

buf.readUInt8(0);
// 返回结果: 1
buf.readUInt8(1);
// 返回结果: 254
```

#### buf.readUInt16BE(offset[, noAssert])
#### buf.readUInt16LE(offset[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - 2`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个 16 位的无符号整数（int 类型），如果使用的是 `readUInt16BE()`，则使用大端字节序读取；如果使用的是 `readUInt16LE()`，则使用小端字节序读取。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 2`。

```js
const buf = new Buffer([0x3, 0x4, 0x23, 0x42]);

buf.readUInt16BE(0);
// 返回结果: 0x0304
buf.readUInt16LE(0);
// 返回结果: 0x0403
buf.readUInt16BE(1);
// 返回结果: 0x0423
buf.readUInt16LE(1);
// 返回结果: 0x2304
buf.readUInt16BE(2);
// 返回结果: 0x2342
buf.readUInt16LE(2);
// 返回结果: 0x4223
```

#### buf.readUInt32BE(offset[, noAssert])
#### buf.readUInt32LE(offset[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - 4`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个 32 位的无符号整数（int 类型），如果使用的是 `readUInt32BE()`，则使用大端字节序读取；如果使用的是 `readUInt32LE()`，则使用小端字节序读取。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 4`。

```js
const buf = new Buffer([0x3, 0x4, 0x23, 0x42]);

buf.readUInt32BE(0);
// 返回结果: 0x03042342
console.log(buf.readUInt32LE(0));
// 返回结果: 0x42230403
```

#### buf.readUIntBE(offset, byteLength[, noAssert])
#### buf.readUIntLE(offset, byteLength[, noAssert])

- `offset`，数值，取值范围为 `0 <= offset <= buf.length - byteLength`
- `byteLength`，数值，取值范围为 `0 < byteLength <= 6`
- `noAssert`，布尔值，默认值为 false
- 返回值类型：Number

从 Buffer 实例中 `offset` 位置开始读取一个长度为 `byteLength` 的字节，最高精度为 48 位。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - byteLength`。

```js
const buf = new Buffer(6);
buf.writeUInt16LE(0x90ab, 0);
buf.writeUInt32LE(0x12345678, 2);
buf.readUIntLE(0, 6).toString(16);
// 返回结果: '1234567890ab'

buf.readUIntBE(0, 6).toString(16);
// 返回结果: ab9078563412
```

#### buf.slice([start[, end]])

- `start`，数值，默认值为 0
- `end`，数值，默认值为 `buffer.length`
- 返回值类型：Buffer

根据可选参数 `start` 和 `end` 指定的位置从 `buf` 中切片出新的 Buffer 实例，且它们共享同一段内存。

因为两个 Buffer 实例共享内存，所以其中一个实例修改数据后，另一个实例得到的就是修改后的数据。

```js
const buf1 = new Buffer(26);

for (var i = 0 ; i < 26 ; i++) {
  buf1[i] = i + 97; // 97 is ASCII a
}

const buf2 = buf1.slice(0, 3);
buf2.toString('ascii', 0, buf2.length);
// 返回结果: 'abc'
buf1[0] = 33;
buf2.toString('ascii', 0, buf2.length);
// 返回结果 : '!bc'
```

使用负值索引可以从后往前执行切片：

```js
const buf = new Buffer('buffer');

buf.slice(-6, -1).toString();
// 返回结果: 'buffe', 等同于 buf.slice(0, 5)
buf.slice(-6, -2).toString();
// 返回结果: 'buff', 等同于 buf.slice(0, 4)
buf.slice(-5, -2).toString();
// 返回结果: 'uff', 等同于 buf.slice(1, 4)
```

#### buf.toString([encoding[, start[, end]]])

- `encoding`，字符串，默认值为 `utf8`
- `start`，数值，默认值为 0
- `end`，数值，默认值为 `buffer.length`
- 返回值类型：String

该方法根据 `encoding` 指定的编码格式，从 Buffer 实例存储的数据中编码和返回一个字符串：

```js
const buf = new Buffer(26);
for (var i = 0 ; i < 26 ; i++) {
  buf[i] = i + 97; // 97 is ASCII a
}
buf.toString('ascii');
// 返回结果: 'abcdefghijklmnopqrstuvwxyz'
buf.toString('ascii',0,5);
// 返回结果: 'abcde'
buf.toString('utf8',0,5);
// 返回结果: 'abcde'
buf.toString(undefined,0,5);
// 返回结果: 'abcde', encoding defaults to 'utf8'
```

#### buf.toJSON()

- 返回值类型：Object

该方法返回一个 JSON 对象，用于描述调用它的 Buffer 实例。如果 `JSON.stringify()` 收到的参数是一个 Buffer 实例，那么它会隐式调用 `buf.toJSON()` 进行解析：

```js
const buf = new Buffer('test');
const json = JSON.stringify(buf);

console.log(json);
// 输出结果: '{"type":"Buffer","data":[116,101,115,116]}'

const copy = JSON.parse(json, (key, value) => {
    return value && value.type === 'Buffer'
      ? new Buffer(value.data)
      : value;
});

console.log(copy.toString());
// 输出结果: 'test'
```

#### buf.values()

- 返回值类型：Iterator

根据 Buffer 实例的值创建和返回一个 Iterator 对象。当使用 `for...of` 遍历 Buffer 实例时，系统会隐式调用该方法解析 Buffer 实例：

```js
const buf = new Buffer('buffer');
for (var value of buf.values()) {
  console.log(value);
}
// prints:
//   98
//   117
//   102
//   102
//   101
//   114

for (var value of buf) {
  console.log(value);
}
// prints:
//   98
//   117
//   102
//   102
//   101
//   114
```

#### buf.write(string[, offset[, length[, encoding]]])

- `string`，字符串，用于写入到 Buffer 实例中数据
- `offset`，数值，默认值为 0
- `length`，数值，默认值为 `buffer.length - offset`
- `encoding`，字符串，默认值为 `utf8`
- 返回值类型：Number，表示成功写入的字节数量

该方法按照 `encoding` 参数指定的编码格式从 `offset` 位置开始向 Buffer 实例中写入 `string` 参数所引用的数据。`length` 参数显式声明要写入到 Buffer 实例的字节数量。如果 Buffer 实例无法容纳所有写入的数据，那么就只会解析和写入部分数据：

```js
const buf = new Buffer(256);
const len = buf.write('\u00bd + \u00bc = \u00be', 0);
console.log(`${len} bytes: ${buf.toString('utf8', 0, len)}`);
// 输出结果: 12 bytes: ½ + ¼ = ¾
```

#### buf.writeDoubleBE(value, offset[, noAssert])
#### buf.writeDoubleLE(value, offset[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - 8`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，如果使用的是 `writeDoubleBE()`，则使用大端字节序写入；如果使用的是 `writeDoubleLE()`，则使用小端字节序写入。`value` 参数引用的数据必须是有效的 64 位双精度浮点数（double 类型）。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 8`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(8);
buf.writeDoubleBE(0xdeadbeefcafebabe, 0);

console.log(buf);
// 输出结果: <Buffer 43 eb d5 b7 dd f9 5f d7>

buf.writeDoubleLE(0xdeadbeefcafebabe, 0);

console.log(buf);
// 输出结果: <Buffer d7 5f f9 dd b7 d5 eb 43>
```

#### buf.writeFloatBE(value, offset[, noAssert])
#### buf.writeFloatLE(value, offset[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - 4`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，如果使用的是 `writeFloatBE()`，则使用大端字节序写入；如果使用的是 `writeFloatLE()`，则使用小端字节序写入。`value` 参数引用的数据必须是有效的 32 位单精度浮点数（float 类型）。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 4`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(4);
buf.writeFloatBE(0xcafebabe, 0);

console.log(buf);
// 输出结果: <Buffer 4f 4a fe bb>

buf.writeFloatLE(0xcafebabe, 0);

console.log(buf);
// 输出结果: <Buffer bb fe 4a 4f>
```

#### buf.writeInt8(value, offset[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - 1`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，该数据必须是有效地单字节整数（int 类型）。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 1`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(2);
buf.writeInt8(2, 0);
buf.writeInt8(-2, 1);
console.log(buf);
// 输出结果: <Buffer 02 fe>
```

#### buf.writeInt16BE(value, offset[, noAssert])
#### buf.writeInt16LE(value, offset[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - 2`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，如果使用的是 `writeInt16BE()`，则使用大端字节序写入；如果使用的是 `writeInt16LE()`，则使用小端字节序写入。`value` 参数引用的数据必须是有效的 16 位双字节整数。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 2`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(4);
buf.writeInt16BE(0x0102,0);
buf.writeInt16LE(0x0304,2);
console.log(buf);
// 输出结果: <Buffer 01 02 04 03>
```

#### buf.writeInt32BE(value, offset[, noAssert])
#### buf.writeInt32LE(value, offset[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - 4`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，如果使用的是 `writeInt32BE()`，则使用大端字节序写入；如果使用的是 `writeInt32LE()`，则使用小端字节序写入。`value` 参数引用的数据必须是有效的 32 位四字节整数。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 4`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(8);
buf.writeInt32BE(0x01020304,0);
buf.writeInt32LE(0x05060708,4);
console.log(buf);
// 输出结果: <Buffer 01 02 03 04 08 07 06 05>
```

#### buf.writeIntBE(value, offset, byteLength[, noAssert])
#### buf.writeIntLE(value, offset, byteLength[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - byteLength`
- `byteLength`，数值，取值范围 `0 < byteLength <= 6`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，长度为 `byteLength`，最高精度为 48 位。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - byteLength`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf1 = new Buffer(6);
buf1.writeUIntBE(0x1234567890ab, 0, 6);
console.log(buf1);
// 输出结果: <Buffer 12 34 56 78 90 ab>

const buf2 = new Buffer(6);
buf2.writeUIntLE(0x1234567890ab, 0, 6);
console.log(buf2);
// 输出结果: <Buffer ab 90 78 56 34 12>
```

#### buf.writeUInt8(value, offset[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - 1`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，该数据必须是无符号的单字节整数（int 类型）。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 1`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(4);
buf.writeUInt8(0x3, 0);
buf.writeUInt8(0x4, 1);
buf.writeUInt8(0x23, 2);
buf.writeUInt8(0x42, 3);

console.log(buf);
// 输出结果: <Buffer 03 04 23 42>
```

#### buf.writeUInt16BE(value, offset[, noAssert])
#### buf.writeUInt16LE(value, offset[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - 2`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，如果使用的是 `writeUInt16BE()`，则使用大端字节序写入；如果使用的是 `writeUInt16LE()`，则使用小端字节序写入。`value` 参数引用的数据必须是无符号的双字节整数。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 2`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(4);
buf.writeUInt16BE(0xdead, 0);
buf.writeUInt16BE(0xbeef, 2);

console.log(buf);
// 输出结果: <Buffer de ad be ef>

buf.writeUInt16LE(0xdead, 0);
buf.writeUInt16LE(0xbeef, 2);

console.log(buf);
// 输出结果: <Buffer ad de ef be>
```

#### buf.writeUInt32BE(value, offset[, noAssert])
#### buf.writeUInt32LE(value, offset[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - 4`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，如果使用的是 `writeUInt32BE()`，则使用大端字节序写入；如果使用的是 `writeUInt32LE()`，则使用小端字节序写入。`value` 参数引用的数据必须是无符号的四字节整数。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - 4`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(4);
buf.writeUInt32BE(0xfeedface, 0);

console.log(buf);
// 输出结果: <Buffer fe ed fa ce>

buf.writeUInt32LE(0xfeedface, 0);

console.log(buf);
// 输出结果: <Buffer ce fa ed fe>
```

#### buf.writeUIntBE(value, offset, byteLength[, noAssert])
#### buf.writeUIntLE(value, offset, byteLength[, noAssert])

- `value`，数值，用于写入到 Buffer 实例的数据
- `offset`，数值，取值范围 `0 <= offset <= buf.length - byteLength`
- `byteLength`，数值，取值范围 `0 < byteLength <= 6`
- `noAssert`，布尔值，默认值为 `false`
- 返回值类型：Number，表示成功写入的字节数量

从 Buffer 实例中 `offset` 位置开始写入 `value` 参数所引用的数据，长度为 `byteLength`，最高精度为 48 位。

如果传入可选参数 `noAssert` 且值为 `true`，则执行该方法时忽略参数 `offset` 是否符合取值范围 `0 <= offset <= buf.length - byteLength`，同时忽略 `value` 参数所引用的数据是否过长。除非确信数据的准确性，否则不建议忽略对 `value` 和 `offset` 参数的检查。

```js
const buf = new Buffer(6);
buf.writeUIntBE(0x1234567890ab, 0, 6);
console.log(buf);
// 输出结果: <Buffer 12 34 56 78 90 ab>
```

## buffer.INSPECT_MAX_BYTES

- 数值，默认值为 50

该属性用于设置 `buffer.inspect()` 方法返回的最大字节数，可以被开发者自定义的模块修改，更多有关 `buffer.inspect()` 方法的信息请参考 `util.inspect()` 方法。

值得注意的是，该属性并不挂载在全局对象 Buffer 或者 Buffer 实例上，而是存在于 `require('buffer')` 的返回值中。

## Class: SlowBuffer

`SlowBuffer` 类用于创建 un-pooled（不放入内存池？）的 Buffer 实例。

为了降低创建 Buffer 实例的开销，避免 Buffer 实例冗杂凌乱的现象，默认情况下对于小于 4KB 的 Buffer 实例使用单个大内存对象存储和管理。这种方式可以有效提高性能和内存利用率，避免 V8 频繁追踪和清理过多的 `Persistent` 对象。

有时候，开发者希望对内存中的一小块空间保留一个不确定的时间，针对这种情况，就可以使用 `SlowBuffer` 类创建 un-pooled（不放入内存池？）的 Buffer 实例，然后通过内存拷贝获取目标数据：

```js
// need to keep around a few small chunks of memory
const store = [];

socket.on('readable', () => {
  var data = socket.read();
  // allocate for retained data
  var sb = new SlowBuffer(10);
  // copy the data into the new allocation
  data.copy(sb, 0, 0, 10);
  store.push(sb);
});
```

通过 `SlowBuffer` 类创建 Buffer 实例的方式应该被视为一种最终手段，除非开发者观察到应用中有过多不必要的内存，否则不要使用这种方式。


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
