+++
description = ""
tags = ["node.js"]
categories = ["doc"]
isCJKLanguage = true
date = "2016-11-15T10:29:28+08:00"
title = "c and c plus plus addons"
weight = 0
notoc = false
+++

## 插件

Node.js 的插件是基于 C/C++ 编写的动态链接共享对象（dynamically-linked shared objects)，可以像普通的 Node.js 模块一样通过 `require()` 函数加载到 Node.js 的开发环境中。Node.js 插件主要用于支持 Node.js 中 JavaScript 调用 C/C++ 库的接口。

目前，创建 Node.js 插件的方法比较复杂，需要了解以下几个组件和 API：

- V8：基于 C++ 函数库，当前 Node.js 的 JavaScript 引擎。V8 实现了 JavaScript 创建对象、调用函数等诸多底层机制。V8 的 API 主要集中在 v8.h 头文件（详见 Node.js 项目中的 `deps/v8/include/v8.h`）中，更多信息请参考线上地址 [https://v8docs.nodesource.com/](https://v8docs.nodesource.com/)。
- [libuv](https://github.com/libuv/libuv)：基于 C 的函数库，实现了 Node.js 的事件循环机制、worker 线程机制以及 Node.js 上所有与异步相关的机制。同时，它是一个跨平台的抽象库，提供了简洁、类 POSIX 的接口，方便开发者调用主流操作系统的常规系统任务，比如与文件系统、网络套接字、定时器以及系统事件的交互。此外，libuv 实现了一个类 pthreads 的线程机制，便于开发者在标准事件循环机制之上构建更强大的异步插件。libuv 鼓励开发者思考如何避免 I/O、任务加载失败等因素对系统操作、worker 线程以及自定义 libuv 线程的阻塞行为。
- Node.js 内建库：Node.js 本身内建了一系列 C/C++ API 供插件使用，其中最重要的就是 `node::ObjectWrap` 类。
- Node.js 内置了一系列静态链接库，比如 OpenSSL，其中大部分位于项目的 `deps/` 目录内，只有 V8 和 OpenSSL 刻意被 Node.js 进行了重定向输出，便于诸多插件的调用，更多信息请参考[Linking to Node.js's own dependencies](https://nodejs.org/dist/latest-v5.x/docs/api/addons.html#addons_linking_to_node_js_own_dependencies)。

以下所有示例都可以在 [https://github.com/nodejs/node-addon-examples](https://github.com/nodejs/node-addon-examples) 下载到。如果你想要开发 Node.js 的插件，也可以使用这些示例作为初始模板。

## Hello World

该示例是使用 C++ 开发插件的简单示例，等同于下面这段 JavaScript 代码：

```js
module.exports.hello = () => 'world';
```

首先，创建 `hello.cc` 文件：

```cpp
// hello.cc
#include <node.h>

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void Method(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(isolate, "world"));
}

void init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "hello", Method);
}

NODE_MODULE(addon, init)

}  // namespace demo
```

值得注意的是，开发 Node.js 插件的开发时，必须输出一个初始化函数，模式如下：

```cpp
void Initialize(Local<Object> exports);
NODE_MODULE(module_name, Initialize)
```

在 `NODE_MODULE` 的行末没有分号，因为它并不是一次函数调用（详见 `node.h`）。`module_name` 必须二进制文件名相匹配（不包含文件名的 `.node` 后缀）。通过上述代码，我们在 `hello.cc` 文件中声明了初始化函数是 `init`，插件名称是 `addon`。

#### 构建

在上面的源代码编写完成后，需要将其编译为二进制文件 `addon.node`。首先，在项目的根目录创建一个 `binding.gyp` 文件，使用类 JSON 格式配置构建信息。该文件创建完成后会被 `node-gyp` 用来编译模块，`node-gyp` 是一个专门用于编译 Node.js 插件的工具。

```json
{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "hello.cc" ]
    }
  ]
}
```

> **注意：**Node.js 中捆绑了一个特殊版本的 `node-gyp` 工具集，它是 `npm` 的一部分，用于支持 `npm install` 命令编译和安装插件，但是不能直接被开发者使用。如果开发者想直接使用 `node-gyp`，需要使用 `npm install -g node-gyp` 命令安装 `node-gyp`，更多信息请参考[ node-gyp 的安装指南](https://github.com/nodejs/node-gyp#installation)，其中包括了对特定平台的需求信息。

创建完 `bindings.gyp` 文件之后，即可使用 `node-gyp configure` 命令生成适用于当前平台的构建文件，同时会在 `build` 目录下生成一个适用于 UNIX 平台的 `Makefile` 或者适用于 Windows 平台的 `vcxproj` 文件。

接下来，调用 `node-gyp build` 命令在 `build/Release/` 目录下编译生成 `addon.node` 文件。

当使用 `npm install` 命令安装 Node.js 的插件时，npm 会使用自身捆绑的 `node-gyp` 再次编译和生成适用于用户平台的相关文件。

构建完成后，就可以在 Node.js 的开发中使用 `require()` 加载 `addon.node` 模块了：

```js
// hello.js
const addon = require('./build/Release/addon');

console.log(addon.hello()); // 'world'
```

更多信息请参考下面的几个示例，或者查看用于生产环境的示例 [https://github.com/arturadib/node-qt](https://github.com/arturadib/node-qt)。

因为插件编译后二进制文件路径（有时候可能是 `./build/Debug/`）由编译方式确定，所以建议使用 [bindings](https://github.com/TooTallNate/node-bindings) 包加载编译后的模块。

值得注意的是，`bindings` 包定位插件模块的方式非常类似于 `try-catch`：

```js
try {
  return require('./build/Release/addon.node');
} catch (err) {
  return require('./build/Debug/addon.node');
}
```

#### 链接到 Node.js 自身的依赖

Node.js 自身用到了许多静态链接库，比如 V8、libuv 以及 OpenSSL。所有的插件都可以链接到这些静态链接库，链接方式非常简单，只需要声明 `#include <...>`（比如：`#include <v8.h>`）语句，`node-gyp` 就会自动定位到合适的头文件。不过，开发时需要注意以下几点：

- 运行 `node-gyp` 时，它会检测 Node.js 的特定版本并下载源码或者头文件信息。如果下载的是源码，那么插件就可以完整的使用 Node.js 的依赖；如果下载的只是头文件信息，那么只能使用 Node.js 输出的特定依赖。
- 使用 `node-gyp` 命令时，可以添加 `--nodedir` 标志，用于指定本地的 Node.js 源数据。开启这个可选参数之后，插件可以使用 Node.js 的全部依赖。

#### 使用 require() 加载插件

插件编译后的二进制文件使用 `.node` 作为后缀名，通过 `require()` 函数可以查找以 `.node` 为扩展名的文件并将它们初始化为动态链接库。

调用 `require()` 时，`.node` 扩展名虽然可以被 Node.js 查找到并初始化为动态链接库，但是有一个问题值得注意，那就是如果插件名字和其他文件重名了， Node.js 会优先加载 Node.js 模块和 JavaScript 文件。 举例来说，如果在同一目录下有 `addon.js` 和 `addon.node` 两个文件，那么 `require('addon')` 函数会优先加载 `addon.js` 文件。

## Node.js 的本地抽象

本文档中的每个示例都直接使用了 Node.js 和 V8 的 API 开发插件，所以有一点非常值得注意，那就是 V8 API 随着版本升级仍在快速迭代之中。对于 V8 和 Node.js 的版本升级，插件需要重新修改和编译以适应新的 API。当前 Node.js 在发布计划中尽量减少 API 的变动对插件所带来的影响，但是这无法确保 V8 API 的稳定性。

[Native Abstrations for Node.js](https://github.com/nodejs/nan)（简称 NAN）提供了一系列工具帮助插件开发者在新旧版本的 V8 和 Node.js 之间保持插件的一致性。更多有多 NAN 的使用信息请参考 [NAN 开发实例](https://github.com/nodejs/nan/tree/master/examples/)。

## 插件实例

以下内容是用于帮助开发者快读上手的插件实例，它们都在开发过程中调用了 V8 API。通过在线的 [V8 指南](https://v8docs.nodesource.com/) 可以了解更多有关 V8 调用的信息，也可以参考 [Embedder 的使用指南](https://developers.google.com/v8/embed) 了解 V8 的核心概念，比如句柄、作用域、函数模板等等。

每一个示例都使用了如下的 `binding.gyp` 文件：

```json
{
  "targets": [
    {
      "target_name": "addon",
      "sources": [ "addon.cc" ]
    }
  ]
}
```

如果插件涉及多个 `.cc` 文件，可以使用将其依次添加入 `source` 字段所引用的数组中：

```json
"sources": ["addon.cc", "myexample.cc"]
```

`binding.gyp` 创建完成后，最后使用 `node-gyp` 生成配置文件和编译成二进制文件：

```bash
$ node-gyp configure build
```

#### 函数参数

插件通常都会暴漏某些对象和函数给 Node.js 中的 JavaScript 调用。当 JavaScript 调用函数时，也必须将将传入的参数映射给 C/C++ 代码，在函数调用完成后，还要映射 C/C++ 传回的返回值。

下面代码演示了如何读取 JavaScript 传递来的函数以及如何传输返回值：

```cpp
// addon.cc
#include <node.h>

namespace demo {

using v8::Exception;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

// This is the implementation of the "add" method
// Input arguments are passed using the
// const FunctionCallbackInfo<Value>& args struct
void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  // Check the number of arguments passed.
  if (args.Length() < 2) {
    // Throw an Error that is passed back to JavaScript
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Wrong number of arguments")));
    return;
  }

  // Check the argument types
  if (!args[0]->IsNumber() || !args[1]->IsNumber()) {
    isolate->ThrowException(Exception::TypeError(
        String::NewFromUtf8(isolate, "Wrong arguments")));
    return;
  }

  // Perform the operation
  double value = args[0]->NumberValue() + args[1]->NumberValue();
  Local<Number> num = Number::New(isolate, value);

  // Set the return value (using the passed in
  // FunctionCallbackInfo<Value>&)
  args.GetReturnValue().Set(num);
}

void Init(Local<Object> exports) {
  NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(addon, Init)

}  // namespace demo
```

编译成功之后，在 Node.js 环境中使用 `require()` 函数加载插件：

```js
// test.js
const addon = require('./build/Release/addon');

console.log('This should be eight:', addon.add(3,5));
```

#### 回调函数

在 Node.js 开发环境中使用 JavaScript 通过插件向 C++ 函数传递并执行一个回调函数是非常常见的操作，下面代码演示了如何在 C++ 中执行回调函数：

```cpp
// addon.cc
#include <node.h>

namespace demo {

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Null;
using v8::Object;
using v8::String;
using v8::Value;

void RunCallback(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  Local<Function> cb = Local<Function>::Cast(args[0]);
  const unsigned argc = 1;
  Local<Value> argv[argc] = { String::NewFromUtf8(isolate, "hello world") };
  cb->Call(Null(isolate), argc, argv);
}

void Init(Local<Object> exports, Local<Object> module) {
  NODE_SET_METHOD(module, "exports", RunCallback);
}

NODE_MODULE(addon, Init)

}  // namespace demo
```

值得注意的是，在上面的示例中 `Init` 函数使用了两个参数，其中第二个参数用于接收完整的 `module` 对象。这种做法便于插件通过简单的函数重写 `exports`，而无需将函数挂载在 `exports` 之下。

编译成功之后，在 Node.js 环境中使用 `require()` 函数加载插件：

```js
// test.js
const addon = require('./build/Release/addon');

var obj1 = addon('hello');
var obj2 = addon('world');
console.log(obj1.msg+' '+obj2.msg); // 'hello world'
```

```js
// test.js
const addon = require('./build/Release/addon');

addon((msg) => {
  console.log(msg); // 'hello world'
});
```

> 在上面的示例中，回调函数是以同步方式调用的。

#### 对象工厂

在下面的代码中演示了如何使用 C++ 函数创建和返回一个新对象，新对象有一个 `msg` 属性：

```cpp
// addon.cc
#include <node.h>

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void CreateObject(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  Local<Object> obj = Object::New(isolate);
  obj->Set(String::NewFromUtf8(isolate, "msg"), args[0]->ToString());

  args.GetReturnValue().Set(obj);
}

void Init(Local<Object> exports, Local<Object> module) {
  NODE_SET_METHOD(module, "exports", CreateObject);
}

NODE_MODULE(addon, Init)

}  // namespace demo
```

编译成功之后，在 Node.js 环境中使用 `require()` 函数加载插件：

```js
// test.js
const addon = require('./build/Release/addon');

var obj1 = addon('hello');
var obj2 = addon('world');
console.log(obj1.msg+' '+obj2.msg); // 'hello world'
```

#### 函数工厂

另一个常见操作就是通过 C++ 函数创建 Javascript 函数并将其返回到 JavaScript 开发环境中：

```cpp
// addon.cc
#include <node.h>

namespace demo {

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void MyFunction(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();
  args.GetReturnValue().Set(String::NewFromUtf8(isolate, "hello world"));
}

void CreateFunction(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, MyFunction);
  Local<Function> fn = tpl->GetFunction();

  // omit this to make it anonymous
  fn->SetName(String::NewFromUtf8(isolate, "theFunction"));

  args.GetReturnValue().Set(fn);
}

void Init(Local<Object> exports, Local<Object> module) {
  NODE_SET_METHOD(module, "exports", CreateFunction);
}

NODE_MODULE(addon, Init)

}  // namespace demo
```

编译成功之后，在 Node.js 环境中使用 `require()` 函数加载插件：

```js
// test.js
const addon = require('./build/Release/addon');

var fn = addon();
console.log(fn()); // 'hello world'
```

#### 包装 C++ 对象

在某些情况下，可以通过包装 C++ 对象或类让 JavaScript 使用 `new` 操作符创建新的实例：

```cpp
// addon.cc
#include <node.h>
#include "myobject.h"

namespace demo {

using v8::Local;
using v8::Object;

void InitAll(Local<Object> exports) {
  MyObject::Init(exports);
}

NODE_MODULE(addon, InitAll)

}  // namespace demo
```

然后，在 `myobject.h` 头文件中，包装类继承 `node::ObjectWrap`：

```js
// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <node_object_wrap.h>

namespace demo {

class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Local<v8::Object> exports);

 private:
  explicit MyObject(double value = 0);
  ~MyObject();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void PlusOne(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;
  double value_;
};

}  // namespace demo

#endif
```

在 `myobject.cc` 文件中，具体实现需要暴漏出来的代码逻辑。在下面的代码中，通过将 `plusOne()` 方法挂载在构造器的原型上，将其暴漏给了外部：

```cpp
// myobject.cc
#include "myobject.h"

namespace demo {

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;

Persistent<Function> MyObject::constructor;

MyObject::MyObject(double value) : value_(value) {
}

MyObject::~MyObject() {
}

void MyObject::Init(Local<Object> exports) {
  Isolate* isolate = exports->GetIsolate();

  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);

  constructor.Reset(isolate, tpl->GetFunction());
  exports->Set(String::NewFromUtf8(isolate, "MyObject"),
               tpl->GetFunction());
}

void MyObject::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  if (args.IsConstructCall()) {
    // Invoked as constructor: `new MyObject(...)`
    double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    MyObject* obj = new MyObject(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Invoked as plain function `MyObject(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    args.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

void MyObject::PlusOne(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.Holder());
  obj->value_ += 1;

  args.GetReturnValue().Set(Number::New(isolate, obj->value_));
}

}  // namespace demo
```

构建该示例之前，需要将 `myobject.cc` 文件名添加到 `binding.gyp` 文件中：

```json
{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "addon.cc",
        "myobject.cc"
      ]
    }
  ]
}
```

编译成功之后，在 Node.js 环境中使用 `require()` 函数加载插件：

```js
// test.js
const addon = require('./build/Release/addon');

var obj = new addon.MyObject(10);
console.log( obj.plusOne() ); // 11
console.log( obj.plusOne() ); // 12
console.log( obj.plusOne() ); // 13
```

#### 包装对象工厂方法

此外，可以使用工厂模式在 JavaScript 中隐式创建对象实例：

```js
var obj = addon.createObject();
// instead of:
// var obj = new addon.Object();
```

首先，需要在 `addon.cc` 文件中实现 `createObject()` 方法的逻辑：

```cpp
// addon.cc
#include <node.h>
#include "myobject.h"

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::String;
using v8::Value;

void CreateObject(const FunctionCallbackInfo<Value>& args) {
  MyObject::NewInstance(args);
}

void InitAll(Local<Object> exports, Local<Object> module) {
  MyObject::Init(exports->GetIsolate());

  NODE_SET_METHOD(module, "exports", CreateObject);
}

NODE_MODULE(addon, InitAll)

}  // namespace demo
```

在 `myobject.h` 头文件中，添加静态方法 `NewInstance()` 用于实例化对象，该方法用于替换 JavaScript 中的 `new` 操作：

```cpp
// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <node_object_wrap.h>

namespace demo {

class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Isolate* isolate);
  static void NewInstance(const v8::FunctionCallbackInfo<v8::Value>& args);

 private:
  explicit MyObject(double value = 0);
  ~MyObject();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static void PlusOne(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;
  double value_;
};

}  // namespace demo

#endif
```

`myobject.cc` 文件的具体实现与前例代码非常类似：

```js
// myobject.cc
#include <node.h>
#include "myobject.h"

namespace demo {

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;

Persistent<Function> MyObject::constructor;

MyObject::MyObject(double value) : value_(value) {
}

MyObject::~MyObject() {
}

void MyObject::Init(Isolate* isolate) {
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  // Prototype
  NODE_SET_PROTOTYPE_METHOD(tpl, "plusOne", PlusOne);

  constructor.Reset(isolate, tpl->GetFunction());
}

void MyObject::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  if (args.IsConstructCall()) {
    // Invoked as constructor: `new MyObject(...)`
    double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    MyObject* obj = new MyObject(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Invoked as plain function `MyObject(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    args.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

void MyObject::NewInstance(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  const unsigned argc = 1;
  Local<Value> argv[argc] = { args[0] };
  Local<Function> cons = Local<Function>::New(isolate, constructor);
  Local<Object> instance = cons->NewInstance(argc, argv);

  args.GetReturnValue().Set(instance);
}

void MyObject::PlusOne(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  MyObject* obj = ObjectWrap::Unwrap<MyObject>(args.Holder());
  obj->value_ += 1;

  args.GetReturnValue().Set(Number::New(isolate, obj->value_));
}

}  // namespace demo
```

构建示例之前，先将 `myobject.cc` 文件名添加到 `binding.gyp` 配置文件中：

```json
{
  "targets": [
    {
      "target_name": "addon",
      "sources": [
        "addon.cc",
        "myobject.cc"
      ]
    }
  ]
}
```

编译成功之后，在 Node.js 环境中使用 `require()` 函数加载插件：

```js
// test.js
const createObject = require('./build/Release/addon');

var obj = createObject(10);
console.log( obj.plusOne() ); // 11
console.log( obj.plusOne() ); // 12
console.log( obj.plusOne() ); // 13

var obj2 = createObject(20);
console.log( obj2.plusOne() ); // 21
console.log( obj2.plusOne() ); // 22
console.log( obj2.plusOne() ); // 23
```

#### 传递包装对象

在包装盒返回 C++ 对象之外，还可以使用 Node.js 中的辅助函数 `node::ObjectWrap::Unwrap` 解包包装对象。在下面的示例中演示了函数 `add()` 如何解析传入的两个对象参数：

```cpp
// addon.cc
#include <node.h>
#include <node_object_wrap.h>
#include "myobject.h"

namespace demo {

using v8::FunctionCallbackInfo;
using v8::Isolate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

void CreateObject(const FunctionCallbackInfo<Value>& args) {
  MyObject::NewInstance(args);
}

void Add(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  MyObject* obj1 = node::ObjectWrap::Unwrap<MyObject>(
      args[0]->ToObject());
  MyObject* obj2 = node::ObjectWrap::Unwrap<MyObject>(
      args[1]->ToObject());

  double sum = obj1->value() + obj2->value();
  args.GetReturnValue().Set(Number::New(isolate, sum));
}

void InitAll(Local<Object> exports) {
  MyObject::Init(exports->GetIsolate());

  NODE_SET_METHOD(exports, "createObject", CreateObject);
  NODE_SET_METHOD(exports, "add", Add);
}

NODE_MODULE(addon, InitAll)

}  // namespace demo
```

在 `myobject.h` 头文件中，添加一个新的公共方法，用于调用对象解包后的私有属性：

```cpp
// myobject.h
#ifndef MYOBJECT_H
#define MYOBJECT_H

#include <node.h>
#include <node_object_wrap.h>

namespace demo {

class MyObject : public node::ObjectWrap {
 public:
  static void Init(v8::Isolate* isolate);
  static void NewInstance(const v8::FunctionCallbackInfo<v8::Value>& args);
  inline double value() const { return value_; }

 private:
  explicit MyObject(double value = 0);
  ~MyObject();

  static void New(const v8::FunctionCallbackInfo<v8::Value>& args);
  static v8::Persistent<v8::Function> constructor;
  double value_;
};

}  // namespace demo

#endif
```

`myobject.cc` 的具体实现和前面的示例类似：

```cpp
// myobject.cc
#include <node.h>
#include "myobject.h"

namespace demo {

using v8::Function;
using v8::FunctionCallbackInfo;
using v8::FunctionTemplate;
using v8::Isolate;
using v8::Local;
using v8::Object;
using v8::Persistent;
using v8::String;
using v8::Value;

Persistent<Function> MyObject::constructor;

MyObject::MyObject(double value) : value_(value) {
}

MyObject::~MyObject() {
}

void MyObject::Init(Isolate* isolate) {
  // Prepare constructor template
  Local<FunctionTemplate> tpl = FunctionTemplate::New(isolate, New);
  tpl->SetClassName(String::NewFromUtf8(isolate, "MyObject"));
  tpl->InstanceTemplate()->SetInternalFieldCount(1);

  constructor.Reset(isolate, tpl->GetFunction());
}

void MyObject::New(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  if (args.IsConstructCall()) {
    // Invoked as constructor: `new MyObject(...)`
    double value = args[0]->IsUndefined() ? 0 : args[0]->NumberValue();
    MyObject* obj = new MyObject(value);
    obj->Wrap(args.This());
    args.GetReturnValue().Set(args.This());
  } else {
    // Invoked as plain function `MyObject(...)`, turn into construct call.
    const int argc = 1;
    Local<Value> argv[argc] = { args[0] };
    Local<Function> cons = Local<Function>::New(isolate, constructor);
    args.GetReturnValue().Set(cons->NewInstance(argc, argv));
  }
}

void MyObject::NewInstance(const FunctionCallbackInfo<Value>& args) {
  Isolate* isolate = args.GetIsolate();

  const unsigned argc = 1;
  Local<Value> argv[argc] = { args[0] };
  Local<Function> cons = Local<Function>::New(isolate, constructor);
  Local<Object> instance = cons->NewInstance(argc, argv);

  args.GetReturnValue().Set(instance);
}

}  // namespace demo
```

编译成功之后，在 Node.js 环境中使用 `require()` 函数加载插件：

```js
// test.js
const addon = require('./build/Release/addon');

var obj1 = addon.createObject(10);
var obj2 = addon.createObject(20);
var result = addon.add(obj1, obj2);

console.log(result); // 30
```

#### AtExit 钩子函数

"AtExit" 钩子函数在 Node.js 事件循环结束之后、JavaScript VM 终止以及 Node.js 退出之前调用。需要使用 "node::AtExit" 接口注册 "AtExit" 钩子函数。

**void AtExit(callback, args)**

- `callback`，`void (*)(vodi*)`，一个指向函数的指针，函数结束时调用
- `args`，`void*`，函数结束是传递给 `callback` 的指针

注册 AtExit 钩子函数需要在事件循环之后和 VM 退出之前。`callback` 按照后入先出的顺序执行。下面 `addon.cc` 文件中的代码实现了 AtExit 钩子函数：

```cpp
// addon.cc
#undef NDEBUG
#include <assert.h>
#include <stdlib.h>
#include <node.h>

namespace demo {

using node::AtExit;
using v8::HandleScope;
using v8::Isolate;
using v8::Local;
using v8::Object;

static char cookie[] = "yum yum";
static int at_exit_cb1_called = 0;
static int at_exit_cb2_called = 0;

static void at_exit_cb1(void* arg) {
  Isolate* isolate = static_cast<Isolate*>(arg);
  HandleScope scope(isolate);
  Local<Object> obj = Object::New(isolate);
  assert(!obj.IsEmpty()); // assert VM is still alive
  assert(obj->IsObject());
  at_exit_cb1_called++;
}

static void at_exit_cb2(void* arg) {
  assert(arg == static_cast<void*>(cookie));
  at_exit_cb2_called++;
}

static void sanity_check(void*) {
  assert(at_exit_cb1_called == 1);
  assert(at_exit_cb2_called == 2);
}

void init(Local<Object> exports) {
  AtExit(sanity_check);
  AtExit(at_exit_cb2, cookie);
  AtExit(at_exit_cb2, cookie);
  AtExit(at_exit_cb1, exports->GetIsolate());
}

NODE_MODULE(addon, init);

}  // namespace demo
```

编译成功之后，在 Node.js 环境中使用 `require()` 函数加载插件：

```js
// test.js
const addon = require('./build/Release/addon');
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
