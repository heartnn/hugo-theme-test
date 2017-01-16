+++
description = ''
tags = ['template']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2016-11-29T10:29:28+08:00"
title="pug"
+++

如果你熟悉 Sublime Text 和 Emmet 的组合，那么 Pug 也会是你的菜。Pug 类似于 Python，都采用了对缩进敏感的语法形式，比如下面这段代码创建了一个无序列表：

```javascript
ul(class="inline")
    li  Item C
    li  Item A
    li  Item B
```

<!-- more -->

<div class="tip">
由于商标版权问题，Jade 已经改名为了 Pug，详见 [issue](https://github.com/pugjs/jade/issues/2184)。
</div>

## 属性

Pug 的另一大特点就是和 JavaScript 的融合度很高，比如设置属性：

```javascript
- var authenticated = true
body(class= authenticated ? 'authed' : 'anon')
- var currentUrl = '/about'
a(class={active: currentUrl === '/'} href='/') Home
a(class={active: currentUrl === '/about'} href='/about') About
```

此外，给标签设置行内样式时，需要以对象的形式赋值给 style：

```javascript
a(style={color: 'red', background: 'green'})
```

## 插值

Pug 提供了字符串插值和标签插值。其中，字符串插值由于要考虑到安全性问题，所以又分成了转义和不转义两种情况：

```javascript
// 转义插值 #{}
- var theGreat = "<span>escape!</span>";
p This will be safe: #{theGreat}

// 不转义插值 !{}
- var theGreat = "<span>escape!</span>";
p This will be safe: !{theGreat}

// 标签插值
p #[a(href="Pug-lang.com") Pug]
```

编译结果：

```html
<!-- 转义插值 #{}-->
<p>This will be safe: &lt;span&gt;escape!&lt;/span&gt;</p>

<!-- 不转义插值 !{}-->
<p>This will be safe: <span>escape!</span></p>

<!-- 标签插值-->
<p><a href="Pug-lang.com">Pug</a></p>
```

## 逻辑语句

Pug 提供了条件、分支、循环、遍历四种逻辑语句，这四种语句继承自 JavaScript，只是语法上有些差异:

- 条件语句：if ... else if ... else
- 分支语句：case ... when ... default
- 循环语句：while
- 遍历数组：each $elem in [elem...]
- 遍历对象：each $key, $value in {key: value}

```javascript
// 分支语句
- var friends = 10
case friends
    when 0
        p you have no friends
    when 1
        p you have a friend
    default
        p you have #{friends} friends
```

## mixin

Pug 和 Sass 都提供了 mixin 语法来实现代码的复用，两者语法也很相似：

```javascript
mixin list(id, ...items)
    ul(id=id)
        each item in items
            li= item

+list('my-list', 1, 2, 3, 4)
```

mixin 一般放在独立的文件中，需要使用 `include` 指令导入到其他文件中。

## extends

`extends` 是 Pug 的模板继承语法，通过 `extends filename.Pug` 可以将模板文件导入到其他文件中。继承机制基本上是一个复制代码片段的过程，为了能够动态修改其中的部分内容，Pug 提供了 `block` 语法：

```javascript
// 声明 block
block content
    p Hello

// 修改 block
// 同名重新赋值
block content
    p Hi

// 前置追加
block append content
    p APPEND

// 后置追加
block prepend content
    p PREPEND
```
