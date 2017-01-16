+++
description = ''
tags = ['phantomjs']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2016-11-28T10:29:28+08:00"
title="PhantomJS"
+++

[PhantomJS](https://github.com/ariya/phantomjs/) 是一个脚本化的无界面 WebKit，以 JavaScript 为脚本语言实现各项功能，官方列举的使用场景包括：无界面测试，页面自动化，屏幕截图和网络监控。在 Mac 下，可以使用 Homebrew 安装最新版本：

```bash
brew install phantomjs
```

<!-- more -->

## Command Line Interface

PhantomJS 运行在终端中，通过以下格式进行调用：

```bash
phantomjs [options] somescript.js [arg1[, arg2 [, ...]]]
```

如果在终端直接执行 `phantomjs` 命令，则进入 REPL 环境。通过 `phantomjs --help` 命令可以查看详细的 `options` 参数。实际上有两种方式设置 `options`，一种是如上所示的终端传入命令的方式，另一种是将 `options` 写入一个 JSON 格式的配置文件，比如：

```js
{
    /* Same as: --ignore-ssl-errors=true */
    "ignoreSslErrors": true,
    /* Same as: --max-disk-cache-size=1000 */
    "maxDiskCacheSize": 1000,
    /* Same as: --output-encoding=utf8 */
    "outputEncoding": "utf8"
}
```

然后在终端中指定该配置文件：

```bash
phantomjs --config=/path/to/config.json somescript.js [arg1[, arg2 [, ...]]]
```

值得注意的是，并不是所有的 `options` 参数都可以直接转换为 JSON 中的键名，特殊的 `options` 参数包括：

- `--disk-cache` => `diskCacheEnabled`
- `--load-images` => `autoLoadImages`
- `--web-security` => `webSecurityEnabled`
- `--local-storage-path` => `offlineStoragePath`
- `--local-storage-quota` => `offlineStorageDefaultQuota`
- `--local-to-remote-url-access` => `localToRemoteUrlAccessEnabled`

## Phantom Object

`phantom` 对象挂载在 window 对象下面，包含以下属性：

- `phantom.cookies`，对象数组，获取或设置 cookies，cookies 信息存储在 CookieJar 中
- `phantom.version`，只读对象，返回当前 PhantomJS 的版本信息，类似 `{ "major": 2, "minor": 1, "patch": 1 }`
- `phantom.libraryPath`，字符串，为 `injectJS()` 设置查找路径
- `phantom.cookiesEnabled`，布尔值，决定是否使用 CookieJar，默认值为 `true`

包含以下方法：

- `phantom.injectJS(filename)`，该方法用于执行外部脚本，如果无法根据传入的 `filename` 找到脚本，就使用 `libraryPath` 指定的路径查找脚本。脚本注入成功后返回 true，否则返回 false
- `phantom.addCookie(Object)`，向 CookieJar 添加 cookie 信息，操作成功返回 true，否则返回 false
- `phantom.clearCookies()`，清空 CookieJar 中的 cookie 信息，无返回值。
- `phantom.deleteCookie(cookieName)`，删除 CookieJar 中包含 `cookieName` 属性的 cookie，操作成功返回 true，否则返回 false
- `phantom.exit(returnValue)`，结束程序，携带退出码 `returnValue`，默认退出码为 0

包含以下事件处理器：

- `onError`，用于处理 `page.onError` 没有捕获的 JavaScript 执行错误，常用于捕捉全局错误，接收两个参数，一个是错误信息，另一个是数组形式的堆栈跟踪信息

## Web Page module

通过 `require(webpage)` 可以加载该模块，使用 `create()` 方法可以创建该模块的实例：

```js
var webpage = require('webpage');
var page = webpage.create();
```

该模块包含以下属性：

- `canGoBack`，回退一页
- `canGoForward`，前进一页
- `clipRect`，对象，该属性规定了 `page.render()` 方法对页面的裁减尺寸，默认裁剪整个页面
- `content`，字符串，main frame 的原始内容（包含 HTML 元素），通过修改该属性可以设置新的页面内容
- `cookies`，设置或获取当前页面的 cookie
- `customHeaders`，对象，给发送给服务器的 HTTP 请求头添加额外的信息，默认值为空对象 `{}`，头信息的键值会被编码为 `US-ASCII` 字符
- `event`，键盘等事件
- `focusedFrameName`，当前激活的 Frame 页面名称
- `frameContent`，字符串，当前激活的 Frame 的页面内容，修改该属性将会以新内容重载该页面
- `frameName`，字符串，当前激活的 Frame 的页面名称
- `framePlainText`，字符串，当前激活的 Frame 的页面内容，无 HTML 标签
- `frameTitle`，字符串，当前激活的 Frame 的页面标题
- `frameUrl`，只读字符串，当前激活的 Frame 的页面 URL
- `framesCount`，Frame 的数量
- `framesName`，所有 Frame 的名称
- `libraryPath`，字符串，为 `page.injectJS` 设置默认检索路径
- `navigationLocked`，布尔值，是否离开当前页面，默认值为 false
- `offlineStoragePath`，字符串，离线资源的存储位置
- `offlineStorageQuota`，数值，允许离线存储的大小
- `ownsPages`
- `pagesWindowName`
- `pages`
- `paperSize`，对象，定义了生成 PDF 的尺寸
- `plainText`，只读字符串，页面内容，无 HTML 标签
- `scrollPosition`，对象，滚动位置
- `title`
- `url`，字符串，当前页面的 URL
- `viewportSize`，对象，常用于在初始化页面前设定 viewport 的大小，比如 `landscape` 和 `portrait`，该对象包含 `width` 和 `height` 两个属性
- `windowName`
- `zoomFactor`，数值，指定 `page.render` 和 `page.renderBase64` 方法的放大系数，默认值为 1，即 100% 放大
- `settings`，对象，只能在调用 `page.open` 方法初始化页面时调用该页面，其他时间定义该属性无效。该对象包含以下属性：
    - `javascriptEnabled`，是否允许在当前页面执行 JavaScript
    - `loadImages`，是否允许加载图片
    - `localToRemoteUrlAccessEnabled`，是否允许使用本地资源响应远程 URL
    - `userAgent`，用户代理
    - `userName`，HTTP 验证的用户名
    - `password`，HTTP 验证的密码
    - `XSSAuditingEnabled`，是否监控跨域请求
    - `webSecurityEnabled`，是否启用网页安全
    - `resourceTimeout`，定义资源请求的延时时间，超时之后将会触发 `onResourceTimeout` 事件

该模块包含以下方法：

- `addCookie(cookie)`，为页面添加 cookie 信息，返回布尔值
- `clearCookies()`，清除当前 URL 下的所有 cookie 信息
- `close()`，关闭当前页面并清空内存
- `deleteCookie(cookieName)`，删除当前 URL 下所有包含 `cookieName` 属性的 cookie 信息，返回布尔值
- `evaluteAsync(function, [delayMillis, arg1, arg2, ...])`，在当前页面异步执行代码，第二个参数定义了延迟执行的时间
- `evaluteJavaScript(str)`，在当前页面执行代码，代码必须写为字符串的形式
- `evalute(function, arg1, arg2, ...)`，在当前页面执行代码
- `getPage(windowName)`
- `goBack()`
- `goForward()`
- `go(index)`
- `includeJs(url, callback)`，向当前页面添加额外的脚本，且当脚本执行完毕后调用回调函数
- `injectJs(filename)`，与 `includeJs` 不同的是，加载的脚本可以跟当前页面不同域
- `openUrl(url, httpConf, settings)`
- `open(url, callback)`、`open(url, method, callback)`、`open(url, method, data, callback)`、`open(url, settings, callback)`，打开 `url` 页面，加载完成后触发回调函数，回电函数接收一个状态参数 `status`，该状态函数的值为 `success` 或 `fail`
- `reload`
- `renderBase64(format)`，将页面导出为 `format` 格式，该格式的可选值包括 `PNG`、`GIF` 和 `JPEG`
- `render(filename[, {format, quality}])`，将页面导出为 `fromat` 格式，系统会根据指定的 `filename` 文件名自动匹配格式，或者自定义格式，`quality` 是 0~100 的数值，用于指定导出文件的质量
- 对于鼠标事件，`sendEvent(mouseEventType[, mouseX, mouseY, button="left"])`，`mouseEventType` 指定了事件类型，可选值包括 `mouseup`、`mousedown`、`mousemove`、`doubleclick` 和 `click`
- 对于键盘事件，`sendEvent(keyboardEventType, keyOrKeys, [null, null, modifier])`，`keyboardEventType` 指定了事件类型，可选值包括 `keyup`、`keypress` 和 `keydown`，第五个参数是修饰键
- `setContent(content, url)`，用于设定 `page.content` 和 `page.url` 属性，设定完成后会重载页面
- `stop()`
- `switchToFocusedFrame()`
- `switchToFrame(frameName)` 或 `switchToFrame(framePosition)`
- `switchToMainFrame()`
- `switchToParentFrame()`
- `uploadFile(selector, filename)`，将 `filename` 上传到表单的 `selector` 节点

```js
// 模拟 Shift + Alt + A 键
var webPage = require('webpage');
var page = webPage.create();

page.sendEvent('keypress', page.event.key.A, null, null, 0x02000000 | 0x08000000);
```

该模块包含以下事件：

- `onAlert`，当页面出现 `alert` 弹出框时触发该事件，接收一个字符串参数
- `onCallback`，当在网页调用 `window.callPhantom` 时触发该事件
- `onClosing`，当 `WebPage` 实例被关闭时触发该事件，比如调用 `page.close()` 或 `window.close()`，接受一个 `closingPage` 参数，指向关闭的页面
- `onConfirm`，当页面出现 `confirm` 弹出框时触发该事件，接收一个字符串参数，并返回一个布尔值
- `onConsoleMessage`，当 JavaScript 中执行 `console` 时就会触发该事件，接收三个参数 (message, lineNumber, sourceIdentifier)
- `onError`，当 JavaScript 出现执行错误时就会触发该事件，接受两个参数，一个是表示错误信息的字符串，一个是表示堆栈跟踪信息的数组
- `onFilePicker`
- `onInitialized`，当 page 实例创建后且 URL 加载前触发该事件
- `onLoadFinished`，当页面资源加载完成后触发该事件，接收一个表示加载状态的参数 `status`，可选值为 "success" 和 "fail"
- `onLoadStarted`，当页面开始加载资源时触发该事件
- `onNavigationRequested`，当页面跳转时触发该事件，回调函数接收四个参数，其中 `url` 表示跳转的目标地址；`type` 的可选值包括 Undefined/LinkClocked/FormSubmitted/BackOrForward/Reload/FormResubmitted/other；`willNavigate` 是一个布尔值，表示是否会发生跳转；`main` 是一个布尔值，表示事件是否来自于 main frame
- `onPageCreated`，当新建子窗口时触发该事件，比如 `window.open`
- `onPrompt`，当页面出现 `prompt` 弹出框时触发该事件，接收一个字符串参数，返回一个字符串
- `onResourceError`，当页面加载资源失败时触发该事件，回调函数接收一个 `resourceError` 的对象，该对象包含四个属性（id, url, errorCode, errorString）。
- `onResourceReceived`，当页面成功加载资源后触发该事件，回调函数接收一个 `response` 对象，该对象包含多个属性（id, url, time, headers, bodySize, contentType, redirectURL, stage, status, statusText）
- `onResourceRequested`，当页面请求资源时触发该事件，回调函数接收两个参数，一个是 `requestData` 对象，另一个是 `networkRequest` 对象。requestData 对象包含多个属性，包括（id, method, url, time, headers），`networkRequest` 对象包含多个方法，包括 (abort, changeUrl(newUrl), setHeader(key, value))
- `onResourceTimeout`，当资源请求超时时触发该事件，回调函数接收一个 `request` 对象作为参数，该对象包含多个属性（id, method, url, time, headers, errorCode, errorString）
- `onUrlChanged`，当 URL 发生变化时触发该事件，回调函数接收一个 `targetURL` 的参数

## Child Process Module

通过 `require('child_process')` 可以加载 Child Process 模块，该模块常用于创建子进程处理输出、发送邮件和调用其他语言脚本等任务。

```js
var process = require("child_process")
var spawn = process.spawn
var execFile = process.execFile

var child = spawn("ls", ["-lF", "/rooot"])

child.stdout.on("data", function (data) {
    console.log("spawnSTDOUT:", JSON.stringify(data))
})

child.stderr.on("data", function (data) {
    console.log("spawnSTDERR:", JSON.stringify(data))
})

child.on("exit", function (code) {
    console.log("spawnEXIT:", code)
})

//child.kill("SIGKILL")

execFile("ls", ["-lF", "/usr"], null, function (err, stdout, stderr) {
    console.log("execFileSTDOUT:", JSON.stringify(stdout))
    console.log("execFileSTDERR:", JSON.stringify(stderr))
})
```

## File System Module

通过 `require('fs')` 可以加载 File System 模块，该模块常用于处理文件和目录相关的任务。

该模块包含以下属性：

- `separator`，字符串，路径分隔符
- `workingDirectory`，字符串，当前工作路径

该模块包含以下方法：

- `absolute(path)`，如果 `path` 是绝对路径，则返回 `path`；如果 `path` 是相对路径，则返回该相对路径相对当前工作路径的路径
- `changeWorkingDirectory(path)`，修改当前工作路径，如果修改成功，则返回 true，否则返回 false
- `copyTree(src, dest)`，将 `src` 路径下的文件拷贝到 `dest` 路径下，默认递归拷贝，如果拷贝失败，则抛出错误并中断执行
- `copy(src, dest)`，将 `src` 文件拷贝为 `dest` 文件，如果找不到 `src` 文件或无法创建 `dest` 文件，则抛出错误并中断执行
- `exissts(string)`，判断文件是否存在，返回一个布尔值，同样适用于软链接
- `isAbsolute(string)`，判断路径是否是绝对路径，返回布尔值
- `isDirectory(string)`，判断路径是否是目录，返回布尔值
- `isExecutable(string)`，判断路径是否是可执行文件，返回布尔值
- `isFile(string)`，判断路径是否是文件，返回布尔值
- `isLink(string)`，判断路径是否是软链接，返回布尔值
- `isReadable(string)`，判断文件是否可读，返回布尔值
- `isWritable(stirng)`，判断文件是否可写，返回布尔值
- `list(string)`，参数 `string` 表示相对路径，列出当前路径下的所有文件和目录
- `makeDirectory(string)`，根据指定路径创建目录，返回值为布尔值
- `makeTree(string)`，递归创建目录，返回值为布尔值，如果目标目录已存在，同样返回 true
- `move(src, dest)`，将 `src` 移动到 `dest`，如果 `src` 不存在、无法删除或无法创建 `dest` 文件，则抛出错误
- `open(path，{ mode, charset })`，第二个参数接收包含两个属性，其中 `mode` 的值是 'r'、'w'、'a/+'、'b' 之一，`charset` 是字符串编码名称。该方法返回一个 Stream 对象，开发者在使用完 Stream 之后有必要显式关闭它。
- `readLink(string)`，该方法返回软链接指向的真实文件或目录的绝对路径，如果传入的不是软链接，则返回空字符串
- `read(path, {mode, charset})`，打开 `path` 指定的文件并以字符串的形式返回所有内容
- `removeDirectory(string)`，删除目录，删除时目录需要为空，否则会抛出错误
- `removeTree(string)`，递归删除目录
- `remove(string)`，删除文件
- `size(string)`，如果文件存在，则返回表示文件大小的数值
- `touch(string)`，创建空文件，如果文件已存在则不会抛出错误
- `write(src, content, {mode, charset})`，如果无法向目标文件写入数据，则抛出错误并中断后续执行

```js
var fs = require('fs');

console.log('LIST: ');
console.log(fs.list());

console.log('ABSOLUTE(): ');
console.log(fs.absolute('../'));

console.log('CHANGEWORKINGDIRECTORY: ');
console.log(fs.changeWorkingDirectory('../'));
console.log(fs.workingDirectory);

console.log('EXISTS: ');
console.log(fs.exists('./index.js'));
console.log(fs.exists('./index.html'));

phantom.exit(0);
```

## System Module

通过 `require('system')` 可以加载 System 模块，该模块包含以下属性：

- `os`，只读对象，操作系统信息
- `pid`，只读数值，进程 ID
- `env`，对象，键值对形式的环境变量
- `args`，字符串数组，从终端传入的参数，数组中的第一个元素一定是脚本名称。
- `platform`，只读字符串，平台名称，总是返回 "phantomjs"

```js
var system = require('system');

console.log('ARGS: ');
console.log(system.args);
console.log('OS: ');
console.log(Object.keys(system.os));
console.log('ENV: ');
console.log(Object.keys(system.env));
console.log('PID: ');
console.log(system.pid);
console.log('PLATFORM: ');
console.log(system.platform);
```

## Web Server Module

通过 `require('webserver')` 可以加载 Web Server 模块，该模块包含以下属性：

- `port`，只读属性，服务器监听的端口

包含以下方法：

- `close()`，该方法用于关闭服务器
- `listen()`，该方法用于监听指定的端口，该方法接收三个参数，第一个参数是监听端口，既可以是 port（比如 8080），也可以是 ipaddress:port（比如 127.0.0.1:8080）；第二个参数是一个可选对象，该对象目前只包含属性 `keepAlive`，如果值为 true，则使用持久连接；最后一个参数是一个回调函数，该回调函数接收 request 和 response 两个参数。

回调函数中的 `request` 对象包含以下属性：

- `method`，请求方法，比如 `GET` 和 `POST`
- `url`，返回请求 URL 的路径和查询字符串部分
- `httpVersion`，HTTP 版本
- `headers`，键值对形式的 HTTP 头信息
- `post`，请求体（对于 `POST` 和 `PUT` 请求有效）
- `postRaw`，如果 `Content-Type: application/x-www-form-urlencoded`，post 的原始内容就会保存在该属性中，且 post 中的数据会被转义

回调函数中的 `response` 对象包含以下属性和方法：

- `headers`，键值对形式的 HTTP 请求头，该属性必须调用 `write()` 之前配置好
- `statusCode`，设置返回的 HTTP 状态码
- `setHeader(name, value)`，设置头信息
- `header(name)`，获取头信息
- `setEncoding(encoding)`，设置数据的编码格式，默认值为 UTF-8，如果数据是二进制数据，则应该设为 "binary"
- `write(data)`，向响应体发送数据块，可以反复调用
- `writeHead(statusCode, headers)`，向请求发送响应头信息，`statusCode` 是一个三位的 HTTP 状态码，`headers` 是响应头信息
- `close()`，关闭 HTTP 连接。为了避免客户端检测到连接中断，最后最好调用一下 `write()`，比如 `response.write("")`
- `closeGracefully()`，`close()` 的温和版本，确保优先发送响应头信息并在最后发送 `response.write("")`

```js
var webserver = require('webserver');
var server = webserver.create();
var service = server.listen('127.0.0.1:8989', {
    keepAlive: true
}, function(req, res) {
    res.statusCode = 200;
    res.write('<html><body>Hello!Sean</body></html>');
    res.close();
});

console.log("Server is runing at " + server.port);
```

##### 参考资料

- [PhantomJS 官方文档](http://phantomjs.org/documentation/)
- [PhantomJS 官方 API](http://phantomjs.org/api/)
