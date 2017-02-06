+++
description = ''
tags = ['react component']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2015-11-20T10:29:28+08:00"
title="React 组件间的消息传递"
+++

当我们封装了可复用的组件之后，用来驱动组件渲染内容的数据就变得愈发灵活，组件之间数据通信的问题就摆在了桌面上。React 组件间的消息传递主要集中于三种关系中：

- 从父组件向子组件的消息传递
- 从子组件向父组件的消息传递
- 无关联组件之间的消息传递

前两种关系都可以使用 React 内建的 `this.props` 对象来处理：

![父子组件之间的消息传递](/img/react-component-comunication.png)

<!--more-->

## 无关联组件之间的消息传递

这里的“无关联”，是指两个组件既不是父子关系，也不是兄弟关系。对于这种关系，可以用一个简单的发布订阅模型来实现，这种模型又被称为观察者模式。

这里选用的是基于全局对象的发布订阅模型，需要自定义事件名称：

```js
// 事件集合
let events = {};

// 发布事件
const trigger = (event, ...data) => {
    const fns = events[event];

    // 如果没有对应方法
    if (!fns || fns.length === 0) {
        return false;
    }
    // 如果存在对应方法，依次执行
    for ( let i = 0; i <= fns.length - 1; i++) {
        fns[i](...data);
    }
};

// 监听事件
const on = (event, fn) => {
    // 如果尚没有该事件，创建一个数组来存储对应的方法
    if (!events[event]) {
        events[event] = [];
    }
    events[event].push(fn);
};

// 取消监听事件
const off = (event, fn) => {
    const fns = events[event];

    // 如果不存在事件集合
    if (!fns) {
        return false;
    }
    // 如果不存在事件
    if (!fn && fns) {
        fns.length = 0;
    }
    // 取消指定事件
    else {
        for (let i = fns.length - 1; i >= 0; i--) {
            if (fn === fns[i]) {
                fns.splice(i, 1);
            }
        }
    }
};

const PubSub = {
    on: on,
    off: off,
    trigger: trigger
};

export default PubSub;
```
