+++
description = ''
tags = ['react component']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2015-11-19T10:29:28+08:00"
title="React 组件的生命周期"
+++

在 React 所实践的组件化中，非常重要的一点就是组件的生命周期，简而言之是组件的挂载、更新和卸载流程。下图详细列述了 React 组件在整个生命周期中所涉及的方法和行为：

![React 组件的生命周期](/img/react-lifecycle.png)

<!-- more -->

在组件实例创建之初，会依序调用 `getDefaultProps()`、`getInitialState()` 方法初始化数据。在 ES6 中，可以简写为：

```js
static defaultProps = {
    key: value
};

state = {
    key: value
};
```

对于从父组件传递来的 props，React 提供了 `propTypes` 配置对象来校验数据类型或格式，常用类型如下：

```js
// 布尔值
React.PropTypes.bool                              
// 数值
React.PropTypes.number                            
// 字符串
React.PropTypes.string                            
// 函数
React.PropTypes.func                              
// 数组
React.PropTypes.array                             
// 对象
React.PropTypes.object                            
// 数值、字符串、DOM 元素及包含这些类型的数组
React.PropTypes.node                              
// React 元素
React.PropTypes.element                           
// 对象实例
React.PropTypes.instanceOf(Message)               
// 数组包含的值之一
React.PropTypes.oneOf(['News' 'Photos'])          
// 数组包含的类型之一
React.PropTypes.oneOfType([                       
    React.PropTypes.string,         
    React.PropTypes.number,         
    React.PropTypes.instanceOf(Message)                                  
])                                               
// 数值数组
React.PropTypes.arrayOf(React.PropTypes.number)   
// 对象的属性值为数值类型
React.PropTypes.objectOf(React.PropTypes.number)  
// 组合类型
React.PropTypes.shape({                           
    React.PropTypes.string                                   
    React.PropTypes.number                                   
})                                                 
// 任何类型，必填
React.PropTypes.any.isRequired                    
// 自定义规则
customProp: function(props propName componentName) {
    if (!/matchme/.test(props[propName])) {
        return new Error('Validation failed!');
    }
}
```

## mount

在组件的挂载过程中，会依次调用 componentWillMount()、render() 和 componentDidMount()。挂载完成后，`componentWillMount()` 和 `componentDidMount()` 将不会再被触发，`render()` 则会根据 props 和 state 的变化多次执行。

在 componentDidMount() 调用之前，只能得到由 render() 返回的虚拟 DOM；在该方法执行时，真实 DOM 的渲染已经完成，此时，可以通过 React 内建的 `getDOMNode()` 访问真实的 DOM。

## update

挂载结束后，组件处于监听状态，监听 props 和 state 的变化。props 和 state 的差异在于：state 用于配置组件内的状态，props 则用于在组件间传递数据。

在实际开发中，这一阶段调用的核心都是围绕 state 展开的。state changed 之后，系统会立即调用 `boolean shouldComponentUpdate(object nextProps, object nextState)` 方法来决定是否重新渲染页面。当遭遇性能瓶颈时，适当地通过该方法控制页面渲染的频率是为提升性能不二法门。

当 props changed 时，系统会立即调用 `componentWillReciveProps(object nextProps)` 方法。该方法常被用来执行 props -> state 的更新，继而触发整个页面的渲染。

在这一阶段重新渲染页面所需要的同样是 will -> render -> did 三个方法。不同之处在于，此处的 did 和 will 附加了 props 和 state 信息：

```js
componentWillUpdate(object nextProps, object nextState) {
    ...
}

componentDidUpdate(object prevProps, object prevState) {
    ...
}
```

## unmount

组件卸载前会执行 `componentWillUnmount()`，用于清理 `componentDidMount()` 之后创建的组件。此外，对于组件生命周期内累积的监听事件和定时器，也应当在该方法内执行解绑、清除操作。

## 实践

```js
class App extends React.Compoent {
    state = {}

    componentWillMount () {
        const { taskId } = this.props;
        this.restoreData(taskId);
    }

    componentDidMount () {
        Store.event.subscribe('data', this.updateState);
    }

    componentWillReceiveProps (nextProps) {
        const { taskId } = nextProps;
        this.restoreData(taskId);
    }

    shouldComponentUpdate () {}

    componentWillUnmount () {
        Store.event.unsubscribe('data', this.updateState);
    }

    restoreData (taskId) {
        if（isDataInStore) {
            this.updateStateFromStore(id)
        }
        else {
            // 1. 设置默认值
            // 2. 恢复已有值
            // 3. 从服务器获取属性值
            // 4. 更新 state
            // 5. 更新 store
        }
    }

    updateStore (activeId || taskId) {
        // 1. 从头 State 提取数据更新 store
    }

    updateStateFromStore (activeId || taskId) {
        // 1. 从 Store 提取数据更新 State
    }
}
```

## 组件化

目前组内正在构建一套 React 基础组件，方法和思路与 AlloyTeam [《致我们终将组件化的 Web》](http://www.alloyteam.com/2015/11/we-will-be-componentized-web-long-text/)一文类似。其中，作者对组件提出了五点要求，如下图所示，值得参考：

![组件化的要求](/img/react-component.png)

其中“规范化的接口”，也可更改为可管理的生命周期。
