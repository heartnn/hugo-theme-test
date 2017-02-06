+++
description = ''
tags = ['sass']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2015-11-20T10:29:28+08:00"
title="React 组件间的消息传递"
+++

从 [Ben Frain](http://benfrain.com/) 的书中可以看出，他是一个勇于实践、善于学习的开发者。一直以来都很关注他的动态，当他的新书《Sass 和 Compass 设计师指南》初版时，就迫不及待地入手了，这是我和 Sass 的第一次见面。后来机缘巧合翻译了 [Sass Guidelines](http://sass-guidelin.es/zh) 和其它一些颇具实践性的 Sass 文章，零零散散至今大概有了一年的时间。

以前的翻译专注于“学习”，在这篇文章之后，我将会分配更多的精力到“实践”中，做一些共享性的库或工具回馈社区。

<div class="tip">
    预处理器很强大，但它只是编写 CSS 的辅助工具。出于对扩展和维护等方面的考虑，在大型项目中有必要使用预处理器构建 CSS；但是对于小型项目，原生的 CSS 可能是一种更好的选择。不要肆意使用预处理器！
</div>

<!--more-->

## Quick Start

Sass 扩展了 CSS 的现有语法，并提供了一些新的语法糖。在下面的简短代码中，集合了 Sass 中最常用的模块引用 `@import`、变量和嵌套：

```scss
// 设置字符集
@charset "UTF-8";

// 引入模块
@import "reset";

// 创建变量
$primary-color: #333;

// 嵌套
body {
    color: $primary-color;
    ul {
        list-style-type: none;
    }
}
```

## 插值字符串

Sass 中的插值字符串 `#{$var}` 有两方面的作用：动态拼接字符串和去除字符串首尾的引号。示例如下：

```scss
@mixin header($tag) {
    #{$tag}:before {
        content: "#{$tag}";
        // 等同于 content: $tag;
    }
}

.post-content {
    @include header("h1");
}
```

编译结果：

```css
.post-content h1:before {
    content: "h1";
}
```

## 父级引用符：`&`

可以将父级引用符 `&` 看做是一个值为父级选择器的插值语法：

```scss
a {
    text-decoration: none;
    &:hover {
        text-decoration: underline;
    }
}
```

编译结果：

```css
a {
    text-decoration: none;
}

a:hover {
    text-decoration: underline;
}
```

## 占位符选择器

占位符选择器是 Sass 特有的一种选择器，声明时以 `%` 开头，编译时不会输出到 CSS 文件中，主要用于抽象组件的公共部分，配合 `@extend` 指令实现样式的继承机制：

```scss
%font {
    font-size: 14px;
    font-family: "Source Sans Pro";
}

body {
    @extend %font;
}
```

编译结果：

```css
body {
    font-size: 14px;
    font-family: "Source Sans Pro";
}
```

## 数据类型

- 字符串 (string): "foo", foo
- 数值 (number): 1.3, 13, 10px
- 列表 (list): ( 1.5em 1em 0 2em, Helvetica, Arial, sa ns-serif )
- 映射 (map): ( key1: value1, key2: value2 )
- 颜色值 (color): blue, #FFFFFF, rgb, hsl, rgba, hsla
- 布尔值 (bool): true, false
- 空类型 (null): null

## 操作符

- 赋值 `:`
- 计算 `+`、`-`、`*`、`/`、`%`
- 比较 `==`、`!=`、`>`、`>=`、`<`、`<=`
- 逻辑 `and`、`or`、`not`

其中，`+` 除了用作算术运算之外，也可以用于拼接字符串和求取颜色值。在 Sass 中字符串分为两种：引用字符串（quoted string，外部被引号包裹）和未引用字符串（unquoted string，外部没有引号）。使用 `+` 拼接字符串时，最终生成的字符串类型为第一个运算子的字符串类型：

```scss
body {
    font-family: "Source Sans " + TC;
    p {
        font-family: sans- + "serif";
    }
}
```

编译结果：

```css
body {
  font-family: "Source Sans TC";
}

body p {
  font-family: sans-serif;
}
```

使用 `+` 求取颜色值时，必须保证运算子具有相同的不透明度：

```scss
body {
    color: rgba(70, 132, 153, 1) + rgba(32, 68, 121, 1);
    // => color: #66c8ff;

    background-color: rgba(70, 132, 153, .9) + rgba(32, 68, 121, .7);
    // alpha channels must be equal when combining colors
    // 报错：不透明通道值必须相等
}
```

<div class="tip">
    `/` 在 CSS 中是有意义的，为了避免和 Sass 除法运算的混淆，所有的除法操作都应该使用小括号 `()` 包裹，比如使用 `font-size: (10px / 2)` 产出 `font-size: 5px`。
</div>

## 变量标识符

Sass 中的变量有三种身份：普通变量、默认值变量（`!default`）和全局变量（`!global`），而且这些变量具有作用域的概念，每个代码块 `{}` 内一个作用域，整个代码文件内也有一个作用域。

当我们引用普通变量时，Sass 首先会从当前作用域开始检索变量，如果找不到就上溯到父级作用域，直到递归到最顶层的作用域：

```scss
$color: orange;

div {
    // 对 $color 重新赋值
    $color: blue;
    color: $color;
    p {
        color: $color;
    }
}

a {
    color: $color;
}
```

编译结果：

```css
div {
  color: blue;
}

div p {
  color: blue;
}

a {
  color: orange;
}
```

> 默认值变量往往用于主题的配置文件，起到标识默认值，方便后续的重写覆盖。在最顶层作用域下，变量默认具有全局性，此时使用 `!global` 并没有实际意义；在块级作用域中，可以通过 `!global` 将变量提升为全局变量，但这么做势必降低代码的可维护性，所以目前全局变量显得有些鸡肋。

## `@` 指令

- @import 模块引用
- @media 媒体查询
- @extend 选择器继承
- @at-root 嵌套提取
- @debug / @warn / @error 异常和测试

`@extend` 的强大无可置疑，但是复杂性也一直为人诟病，稍微控制不当就会生成冗余的选择器。归根结底，使用 `@extend` 是为了继承组件的公有样式，所以在不影响功能的基础上，应该适当的束缚它的能力。到目前为止，最优秀的实践方式就是 `@extend` 搭配占位符选择器。

```scss
%btn {
    color: white;
    font-size: 20px;
}

.btn-danger {
    @extend %btn;
    background-color: red;
}

.btn-default {
    @extend %btn;
    background-color: gray;
}
```

编译结果：

```css
.btn-danger, .btn-default {
    color: white;
    font-size: 20px;
}

.btn-danger {
    background-color: red;
}

.btn-default {
    background-color: gray;
}
```

在这个组合中，占位符选择器本身不会被编译到 CSS 文件中，可以节省文件体积，而且 `@extend` 只继承了单一的占位符选择器，杜绝了选择器泛滥。此外，相比起 `@mixin` 来，`@extend` 搭配占位符选择器生成的结果会聚合在同一个样式集中：

![@extend vs @mixin](/img/mixin-vs-extend.png)

> 如果再上升一个层次分工的话，那就需要比较一下 `@mixin` 和 `@extend`。这两种方式都可以生成公有样式，但是仅此而已就是浪费了 `@mixin` 的能力。就目前的最佳实践来说，建议使用 `@extend` 搭配占位符选择器继承公有样式，使用 `@mixin` 产出动态样式。`@mixin` 的详细介绍见后续小节。


## 控制指令

- @if ... @else if ... @else ... 条件判断
- @for $var from start through end [start, end] 循环
- @for $var from start to end [start, end) 循环
- @each ... in ... 遍历
- @while

`@each` 可以用来遍历 list 和 map 类型的数据，示例如下：

```scss
$btn: (
    danger: red,
    primary: blue,
    warning: orange
);

@each $type, $color in $btn {
    .btn-#{$type} {
        color: $color;
    }
}
```

编译结果：

```css
.btn-danger {
    color: red;
}

.btn-primary {
    color: blue;
}

.btn-warning {
    color: orange;
}
```

## 混合宏 `@mixin`

在 `@extend` 部分已经介绍到 `@mixin` 的一个功能是生成公有样式，但事实上，建议你避开使用该功能，而是着眼于使用 `@mixin` 动态生成共有样式，更优雅地实现组件复用：

```scss
@mixin btn($fontSize, $borderRadius) {
    font-size: $fontSize;
    border-radius: $borderRadius;
}

.btn-sm {
    @include btn(14px, 3px);
}

.btn-lg {
    @include btn(18px, 5px);
}
```

编译结果：

```css
.btn-sm {
    font-size: 14px;
    border-radius: 3px;
}

.btn-lg {
    font-size: 18px;
    border-radius: 5px;
}
```

`@mixin` 的参数除了上面示例的普通参数，还包括默认值参数和不定参数。默认值参数通过提供默认样式，可以在参数缺失时，保障代码的健壮性：

```scss
@mixin btn($fontSize, $borderRadius: 5px) {
    font-size: $fontSize;
    border-radius: $borderRadius;
}

.btn-lg {
    @include btn(18px);
}
```

编译结果：

```css
.btn-lg {
    font-size: 18px;
    border-radius: 5px;
}
```

不定参数可以保存零个或多个值，最常用的地方就是为同一属性添加多个值，比如多重阴影：

```scss
@mixin box-shadow($shadows...) {
    -moz-box-shadow: $shadows;
    -webkit-box-shadow: $shadows;
    box-shadow: $shadows;
}

.shadows {
    @include box-shadow(0px 4px 5px #666, 2px 6px 10px #999);
}
```

编译结果：

```css
.shadows {
    -moz-box-shadow: 0px 4px 5px #666, 2px 6px 10px #999;
    -webkit-box-shadow: 0px 4px 5px #666, 2px 6px 10px #999;
    box-shadow: 0px 4px 5px #666, 2px 6px 10px #999;
}
```

此外，在传参时也可以使用不定参数：

```scss
@mixin colors($text, $background, $border) {
    color: $text;
    background-color: $background;
    border-color: $border;
}

$values: #ff0000, #00ff00, #0000ff;
.primary {
    @include colors($values...);
}

$value-map: (text: #00ff00, background: #0000ff, border: #ff0000);
.secondary {
    @include colors($value-map...);
}
```

编译结果：

```css
.primary {
    color: #ff0000;
    background-color: #00ff00;
    border-color: #0000ff;
}

.secondary {
    color: #00ff00;
    background-color: #0000ff;
    border-color: #ff0000;
}
```

<div class="tip">
    在 `@mixin` 中配置参数时，先写普通参数，然后是默认值参数，最后是不定参数。
</div>

## 函数指令 `@function`

相比起上面的继承和动态生成，`@function` 在生成方式上自由度更高。此外，还可以嵌套上面的各种指令和操作符，对数据进行筛选、在加工，生成特定样式。在下面的代码中，混合宏根据栅格的数量，动态生成容器的宽度：

```scss
$grid-width: 40px;
$gutter-width: 10px;

@function width($n) {
    @return $n * $grid-width + ($n - 1) * $gutter-width;
}

.container {
    width: width(5);
}
```

编译结果：

```css
.container {
    width: 240px;
}
```

###### 参考资料

- [Sass 内建函数](http://sass-lang.com/documentation/Sass/Script/Functions.html#blue-instance_method)
