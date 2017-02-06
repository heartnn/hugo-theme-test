+++
description = ''
tags = ['node.js', 'faq']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2016-11-25T10:29:28+08:00"
title="Node 开发常见问题"
from = "http://google.com"
+++

Node.js 的生态圈发展迅速，各种工具层出不穷，本文缩减了原文中的大部分内容，只列出 Node.js 开发中需要注意的方面。

<!--more-->

1. 使用开发工具自动重启 Node.js 服务或自动刷新浏览器页面，比如 [nodemon](http://nodemon.io/) 和 [browsersync](https://www.browsersync.io/)
2. 使用工具监控事件循环运行情况，避免异常事件长时间阻塞代码执行，比如 [strongops](http://docs.strongloop.com/display/SLA/Application+monitoring) 和 [blocked](http://npm.im/blocked)
3. 避免频繁执行回调函数
4. 使用异步模块避免过度回调嵌套，未来 Node.js 将会支持 Async/Await 等语法改善该问题
5. 代码模块化
6. 使用比 `console.log()` 更实用的日志输出工具，比如 [bunyan](https://github.com/trentm/node-bunyan/)
7. 使用测试框架设计并开发测试用例，比如 [tape](https://github.com/substack/tape)
8. 使用静态分析工具减少代码错误，比如 [ESLint](http://eslint.org/)
9. 使用性能监测和分析工具，比如 [StrongLoop](http://strongloop.com/node-js/monitoring/)
10. 使用 `debug()` 函数调试，而不是使用 `console.log()`
