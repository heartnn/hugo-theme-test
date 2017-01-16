+++
description = ""
tags = ["node.js"]
categories = ["doc"]
isCJKLanguage = true
date = "2016-11-12T10:29:28+08:00"
title = "about"
weight = 0
notoc = false
+++

当前文档翻译自 [Node.js 6.x 官方文档](https://nodejs.org/dist/latest-v6.x/docs/api/documentation.html)，致力于从概念和实践两方面介绍 Node.js API 的使用方式。文档整体分为多个章节，每一章节针对一个模块或一个高阶概念展开。

## 稳定性

在阅读文档的过程中，你会经常看到如下四种稳定性标识，用于说明当前模块的稳定程度：

<div class="s s0">
模块存在已知问题，不建议过度依赖该模块，使用时 Node.js 会抛出警告信息，无法有效保障向后兼容性。
</div>

<div class="s s1">
模块正在开发中，需要使用命令行参数启用，未来可能会被修改或移除。
</div>

<div class="s s2">
模块整体表现稳定，除非绝对需要，否则不会修改，以 npm 开发环境的向后兼容性为优先开发原则。
</div>

<div class="s s3">
模块已锁定，不接受新的 API 建议，后续只会进行安全、性能或 Bug 方面的优化。
</div>

> 本文档不会翻译稳定性为 0 的模块，也不建议使用此类模块。

## 系统调用和 man 页面

类似 [open(2)](http://man7.org/linux/man-pages/man2/open.2.html) 和 [read(2)](http://man7.org/linux/man-pages/man2/read.2.html) 的系统调用命令定义了用户程序与底层操作系统之间的接口。对于 Node.js 简单封装的系统调用命令都会在文档中显式标注，比如 `fs.open()`。对于系统调用命令，文档会直接链接到相应的 man 页面。

**警告：** 部分系统调用命令是某些系统特有的，比如 [lchown(2)](http://man7.org/linux/man-pages/man2/lchown.2.html) 就是 BSD Unix 特有的。也就是说，`fs.lchown()` 只能用于 Mac OS X 和其他 BSD 衍生操作系统，不能用于 Linux 和 Windows 系统。

大多数的 Unix 系统调用命令在 Windows 上都有类似的系统调用命令，但两者的行为可能不同，在某些时候两者微妙的差异导致了绝对的不可替代性，详细信息请参考 [Node issue 4760](https://github.com/nodejs/node/issues/4760)。

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
