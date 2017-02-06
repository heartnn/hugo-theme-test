+++
description = ''
tags = ['react', 'animation']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2015-11-19T10:29:28+08:00"
title="React 动画"
+++

由于 React 加持了虚拟 DOM 等诸多特性，所以在 React 上实现常规的动画效果有一些特别之处。本文不会深入探讨 React 对动画的处理逻辑，只会简单地演示如何使用 React 创建动画效果，因为我也没有做过线上的 React 动画实例，谨以此文抛砖引玉，算是最基础的入门了解。

<!--more-->

## React 插件

React 官方提供了两个插件用于处理动画效果：一个是偏底层的 `react-addons-transition-group`，一个是在前者基础上进一步封装的 `react-addons-css-transition-group`。在使用它们之前，需要先检查下你使用的是哪种类型的 React 版本，一般通过 npm 安装的 React 默认不会安装这两个插件，需要手动安装它们：

```shell
npm install --save react-addons-transition-group react-addons-css-transition-group
```

在这里先介绍 `react-addons-css-transition-group` 的使用方式，使用它可以快速利用 CSS 的能力实现组件的入场和出场动画。使用该插件实现 React 动画需要两个部分的协作，首先是 JS 部分的组件：

```diff
// 非完整代码
class App extends React.Component {
    state = {
        itemList: [{
            key: getRandomKey(),
            color: colorSet[getRandomIndex(0, 10)]
        }]
    };

    render () {
        const { itemList } = this.state;
        let itemNodeList = [];

        itemList.forEach((item) => {
            itemNodeList.push(
                <div
                    // 重点：CSSTransitionGroup 的直接子组件必须有一个独一无二的 key 值
+                   key={item.key}
                    className="item"
                    style={{ backgroundColor: `${item.color}` }}
                    onClick={() => this.handleRemove(item.key)}>
                    {item.key}
                </div>
            );
        });

        return (
            <div id="color-wrapper">
                <button onClick={this.handleAdd}>ADD</button>
+               <CSSTransitionGroup
+                   component="div"
+                   className="color-set"
+                   transitionName="todo"
+                   transitionAppear={true}
+                   transitionAppearTimeout={500}
+                   transitionEnterTimeout={500}
+                   transitionLeaveTimeout={300}>
+                   {itemNodeList}
+               </CSSTransitionGroup>
            </div>
        );
    }
}
```

在 CSSTransitionGroup 组件上，我们声明了一堆以 `transition` 开头的属性，这些属性被用来控制动画效果：

- `transitionName`，写样式时的前缀，比如这里的值为 `todo`，那么 CSS 的类型就应该是 `todo-enter`、`todo-leave` 等等
- `transitionAppear`，布尔值，是否在所有组件挂载时触发动画
- `transitionEnterTimeout`，控制入场动画的时长
- `transitionLeaveTimeout`，控制退场动画的时长
- `transitionAppearTimeout`，控制所有组件挂载的动画时长

默认情况下，CSSTransitionGroup 组件会被渲染为 `span` 标签，如果你想修改标签类型，可以使用 `component` 属性进行修改。其次是 CSS 部分的样式，CSS 中类选择器遵循类似 `${transitionName}-appear` 的命名格式：

```css
.todo-appear {
    opacity: 0.01;
    transform: translateY(-50px);
}

.todo-appear.todo-appear-active {
    opacity: 1;
    transform: translateY(0px);
    transition: all 500ms ease-in;
}

.todo-enter {
    opacity: 0.01;
    transform: translateY(-50px);
}

.todo-enter.todo-enter-active {
    opacity: 1;
    transform: translateY(0px);
    transition: all 500ms ease-in;
}

.todo-leave {
    opacity: 1;
    transform: translateY(0px);
}

.todo-leave.todo-leave-active {
    opacity: 0.01;
    transform: translateY(-50px);
    transition: all 300ms ease-in;
}
```

通过上述两部分的结合，当我们删除 `itemNodeList` 中的某个组件时，React 会立即通过 key 找到这个组件，然后为其添加 `todo-leave` 类名，并瞬间添加 `todo-leave-active` 类名，在 500 毫秒之后移出该组件。

总结一下这种动画处理方式的优点：

- 简单快速，与 React 的融合性好，性能有保障
- 可以使用 Sass、Less 等预处理器，提高开发效率
- 易于上手，无第三方依赖，也就是无门的动画处理模块，这里的插件只是将类选择器应用到相关的节点上

缺点也是一堆：

- 只有入场和出场动画，无法实现复杂动画
- 组件之间的动画效果是独立的，无互动，动画效果生硬
- 要求和限制条件多
- 使用 CSS Modules 需要硬编码，也就是使用 CSSTransitionGroup 组件自定义类名的功能

最后，列出使用 React 插件开发动画的几点要求：

- 组件必须挂载才能实现动画
- 组件必须设定独一无二的 key 值
- transitionName 必须与 CSS 中的样式类名保持一致

从上面的示例可以看出，CSSTransitionGroup 组件主要用来在组件入场和出场时给 DOM 节点添加类名，相当于是与 CSS 的结合，那么我们是否能够通过 JS 生成行内样式，然后添加到 DOM 节点，实现更加灵活的动画效果呢？可以，React 提供了 ReactTransitionGroup 组件供开发者在以下六个阶段向 DOM 节点注入数据：

- `componentWillAppear(callback)`
- `componentDidAppear()`
- `componentWillEnter(callback)`
- `componentDidEnter()`
- `componentWillLeave(callback)`
- `componentDidLeave()`

有关 ReactTransitionGroup 组件的使用实例，我们将在第三节中结合 GSAP 做介绍。

## React Motion

```shell
npm install --save react-motion
```

从下面的表格数据来说，react-motion 的大小不应该成为你拒绝使用它的理由：

|                                       | Minified | Gzip + Minified |
|:--------------------------------------|:---------|:----------------|
| React + ReactDom                      | 148KB    | 43KB            |
| React + ReactDom + CSSTransitionGroup | 157KB    | 46KB            |
| React + ReactDom + ReactMotion        | 165KB    | 48KB            |

对于绝大多数的动画组件，我们往往不希望对动画属性（宽高、颜色等）的变化时间做硬编码处理，react-motion 提供的 `spring` 函数就是用来解决这一需求的，它可以逼真地模仿真实的物理效果，也就是我们常见的各类缓动效果。react-motion 一共提供了五个 API 接口，其中前两个是辅助类函数，后三个是具体的动画组件：

- `spring`，声明动画的缓动效果，比如 `spring(10, {stiffness: 120, damping: 17})`，`10` 是目标值，`stiffness` 是弹性动画的刚度值，影响弹性，`damping` 是弹性动画的阻尼
- `presets`，预置的缓动效果，比如 `spring(10, preset.gentle)`
- `Motion`，该动画组件内部往往只有一个直接子组件，也就是只有一个动画目标
- `StaggerdMotion`，该动画组件内部有一个或多个直接子组件，多个子组件之间的动画效果由关联性
- `TransitionMotion`，该动画组件内部的一个或多个组件可以卸载或挂载，提供 Enter 和 Leave 动画效果

```js
<Motion
    defaultStyle={{x: 0}}
    style={{x: spring(10)}}
    onRest={() => void}>
    {
        interpolatingStyle => (
            <div style={interpolatingStyle}>{interpolatingStyle.x}</div>
        )
    }
</Motion>
```

上面代码演示了 `Motion` 组件的最基础使用方法，也包含了该组件的所有接口：

- `defaultStyle?: PlainStyle`，可选参数，`PlainStyle` 指的就是 React 常用作行内样式的对象类型的 `{ width: '10px', height: '10px' }`，见名知意，为动画设定初始值
- `style: Style`，必选参数，指定动画完成的目标值，并设定动画的变化类型，实际上是一种数据驱动的形式
- `onRest?: () => void`，可选参数，在动画完成后调用
- `children: (interpolatedStyle: PlainStyle) => ReactElement`，必选函数，接收一个从初始值到目标值中间的值，这个值不断变化，用于渲染子组件的样式

关于 StaggerdMotion 组件和 TransitionMotion 组件这里就不多做介绍了，有兴趣的话请阅读官方文档，官方文档的接口和示例都非常清晰。总结一下使用 react-motion 的优点：

- 易用且实用的 spring 让动画非常逼真
- StaggerdMotion 组件提供了多多组件复杂动画的支持
- onRest 钩子方法可以实现序列化动画

缺点也很明显：

- 上手难度略高，容易产生大量有关样式处理的代码
- onRest 钩子方法尚不支持 StaggerdMotion 组件
- 多组件复杂动画效果的代码并不清晰，可读性一般

建议阅读本文并且喜欢 React 动画的读者去尝试一下 react-motion 的示例，你会惊讶于 react-motion 动画的流畅度，虽然这功劳并不能完全归到 react-motion 的头上（还包括 GPU 硬件加速、React 生态等），但它一定功不可没。如果上面的动画效果远不能满足你的需求，我们还能做什么呢？使用 GSAP！

## GSAP

GSAP 是一个老牌的专业级动画库，从古老的 Flash 动画时代一直兴盛至今，它是一个商业产品，虽然开发者可以免费下载源代码，但如果要在商业活动中使用它，请购买相关的会员。如果你没有使用过 GSAP，建议阅读[《GSAP，专业的 Web 动画库》](http://acgtofe.com/posts/2016/05/gsap-for-animation-pro)一文，接下来，我们尝试将 GSAP 融入到 React 的开发中。

将 GSAP 与 React 结合最简单的方式：使用 `ref` 或 `findDOMNode()`。这种获取真实的 DOM 节点的方式，其创建动画的方式与传统的实现方式一致：

```js
// 导入通过 NPM 安装的 GSAP
import TweenMax from 'gsap';

// 保存 ref 指向的真实节点
let refNode;

class App extends React.Component {
    componentDidMount () {
        TweenMax.to(refNode, 2, {
            x: '+=200px',
            backgroundColor: '#2196f3'
        });

        // TweenMax 可以做什么？
        // 暂停
        tween.pause();

        // 继续播放
        tween.resume();

        // 反转播放
        tween.reverse();

        // 跳转到1s进度处开始播放
        tween.seek(1);

        // 重播
        tween.restart();

        // 动画变为三倍速
        tween.timeScale(3);
    }

    render () {
        return (
            <div
                id="ball"
                ref={c => (refNode = c)}
                style={{
                    width: '100px',
                    height: '100px',
                    margin: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'red'
                }}>
            </div>
        );
    }
}
```

TweenMax 的强大在于多年的动画开发经验所积累的技术底蕴，非一朝一夕可以被替代，上面简单演示了 TweenMax 的一小部分功能，像是 Timeline 的用法就没有介绍，这是一种类似视频编辑中的时间轴技术，当需要组织的元素越来越多时，其灵活性就会越加凸显。

![timeline](/img/react-animation-2016-08-31.png)

GSAP 与 React 结合的另一种方式是使用 ReactTransitionGroup 组件，ReactTransitionGroup 组件提供了六个生命周期的钩子方法：

- `componentWillAppear(callback)`
- `componnetDidAppear()`
- `componentWillEnter(callback)`
- `componnetDidEnter()`
- `componentWillLeave(callback)`
- `componnetDidLeave()`

这些方法的调用时间可以参考 CSSTransitionGroup 组件中相关方法的执行时间:

```js
class Box extends React.Component {
    componentWillEnter (callback) {
        const el = ReactDOM.findDOMNode(this);
        TweenMax.fromTo(el, 0.3, {y: 100, opacity: 0}, {y: 0, opacity: 1, onComplete: callback});
    }

    componentWillLeave (callback) {
        const el = ReactDOM.findDOMNode(this);
        TweenMax.fromTo(el, 0.3, {y: 0, opacity: 1}, {y: -100, opacity: 0, onComplete: callback});
    }

    render () {
        return (
            <div
                style={{
                    width: '100px',
                    height: '100px',
                    margin: '100px',
                    borderRadius: '50%',
                    backgroundColor: 'red'
                }}>
            </div>
        );
    }
}

class App extends React.Component {
    state = {
        show: true
    }

    handleToggle = () => {
        this.setState({
            show: !this.state.show
        });
    }

    render () {
        return (
            <div className="wrapper">
                <button onClick={this.handleToggle}>Toggle</button>
                <TransitionGroup>
                    { this.state.show && <Box key="a"></Box> }
                </TransitionGroup>
            </div>
        );
    }
}
```

## 总结

- 易用性：CSSTransitionGroup >= React Motion > GSAP
- 可维护性：看代码量和技术能力，CSSTransitionGroup 最简单
- 用户体验：GSAP >= React Motion > CSSTransitionGroup
- 对复杂动画的支持程度：GSAP > React Motion > CSSTransitionGroup

|                   | 学习成本 + 易用性   | 可维护性  | 用户体验   | 复杂动画  |
|:------------------|:------------------|:---------|:---------|:---------|
| CSSTransitionGroup| 4                 | 4        | 2        | 2        |
| React Motion      | 3                 | 3        | 4        | 4        |
| GSAP              | 2                 | 3        | 4        | 5        |

满分 5 分，及格 3 分，总体来说对于常见的动画效果，可以考虑使用 React Motion 进行实现，这也是当前 React 开源社区推崇的动画实现方式，至于这种动画实现方式是否有性能问题，还要具体到实际的项目中进行衡量。

###### 参考资料

- [React Animation](https://facebook.github.io/react/docs/animation.html)
- [React Motion](https://github.com/chenglou/react-motion)
- [A Comparison of Animation Technologies](https://css-tricks.com/comparison-animation-technologies/)
- [GSAP，专业的Web动画库](http://acgtofe.com/posts/2016/05/gsap-for-animation-pro)
- [React GSAP Enhancer](https://github.com/azazdeaz/react-gsap-enhancer)
- [Animations with ReactTransitionGroup](https://medium.com/@cheapsteak/animations-with-reacttransitiongroup-4972ad7da286#.o7ta17de0)
- [GSAP Examples](http://www.shanemielke.com/archives/usopen-sessions/)
