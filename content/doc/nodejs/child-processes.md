+++
description = ""
tags = ["node.js"]
categories = ["doc"]
isCJKLanguage = true
date = "2016-11-16T10:29:28+08:00"
title = "child processes"
weight = 0
notoc = false
+++

## 子进程

<div class="s s2"></div>

`child_process` 模块实现了创建子进程的机制，在某些方面类似于 [popen(3)](http://linux.die.net/man/3/popen)，但并不完全相同。这种机制主要由 `child_process.spawn()` 函数实现：

```js
const spawn = require('child_process').spawn;
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

默认情况下，系统会在 Node.js 主进程和子进程之间为 `stdin`、`stdout` 和 `stderr` 创建数据通道，这些数据通道可以以非阻塞的方式进行数据传输。值得注意的是，某些程序内部使用的是线性缓冲 I/O，虽然这不会影响 Node.js，但这意味着从主进程发给子进程的数据不能被立即使用啊。

`child_process.spawn()` 方法用于异步创建子进程，不会阻塞 Node.js 的事件循环机制。`child_process.spawnSync()` 方法与上一个方法提供了相同的功能，不同之处在于它是同步执行的，执行时会阻塞事件循环机制，知道子进程结束任务并退出。

为了调用方便，`child_process` 模块提供了一系列基于 `child_process.spawn()` 和 `child_process.spawnSync()` 重新包装的方法：

- `child_process.exec()`：生成一个 shell 并执行指定的命令，执行完成后调用传入的回调函数，该回调函数包含两个参数 `stdout` 和 `stderr`
- `child_process.execFile()`：功能与 `child_process.exec()` 相似，不同之处在于无需生成 shell，直接执行指定的命令
- `child_process.fork()`：生成一个新的 Node.js 进程并调用特定模块创建 IPC 信道，用于在父子进程之间进行通信
- `child_process.execSync()`，`child_process.exec()` 方法的同步执行版本，执行时阻塞 Node.js 的事件循环机制
- `child_process.execFileSync()`，`child_process.execFile()` 方法的同步执行版本，执行时阻塞 Node.js 的事件循环机制

在某些情况下，同步执行的方法可能更加合适，比如创建自动化 shell 脚本。不过在大多数情况下，由于必须执行完同步方法才能继续事件循环机制，所以此类方法通常会严重影响 Node.js 的性能。

## 创建异步进程

`child_process` 模块中的 `spawn()` / `fork()` / `exec()` 和 `execFile()` 方法是 Node.js 中典型的异步编程范式。

这些方法执行完成后会返回一个 `ChildProcess` 实例，这些实例都实现了 Node.js EventEmitter 的 API，便于父进程注册监听函数监听子进程生命周期中发生的事件。

此外，`child_process.exec()` 和 `child_process.execFile()` 方法还允许传递一个可选的回调函数，该回调函数会在子进程结束时被调用。

#### 在 Windows 平台执行 `.bat` 和 `.cmd` 文件

`child_process.exec()` 和 `child_process.execFile()` 两个方法之间的差异取决于当前 Node.js 的运行平台。在 *nix （Unix，Linux，OSX）系统上，`child_process.execFile()` 方法更加高效，这是因为它在执行时无需生成一个 shell。但是在 Windows 平台上，如果脱离了终端，`.bat` 和 `.cmd` 文件是无法执行的，因此也无法使用 `child_process.execFile()` 方法。要想在 Windows 环境下调用 `.bat` 和 `.cmd` 文件，有两种方式，一种是使用 `child_process.exec()`，另一种是使用 `child_process.spawn()` 生成一个 `cmd.exe`，然后输入 `.bat` 或者 `.cmd` 文件：

```js
// On Windows Only ...
const spawn = require('child_process').spawn;
const bat = spawn('cmd.exe', ['/c', 'my.bat']);

bat.stdout.on('data', (data) => {
  console.log(data);
});

bat.stderr.on('data', (data) => {
  console.log(data);
});

bat.on('exit', (code) => {
  console.log(`Child exited with code ${code}`);
});

// OR...
const exec = require('child_process').exec;
exec('my.bat', (err, stdout, stderr) => {
  if (err) {
    console.error(err);
    return;
  }
  console.log(stdout);
});
```

#### child_process.exec(command[, options][, callback])

- `command`，字符串，待执行的命令，多个命令之间以空格分隔
- `options`，对象
    - `cwd`，字符串，子进程当前的工作目录（current working directory）
    - `env`，对象，环境变量
    - `encoding`，字符串，默认值为 `utf8`
    - `shell`，字符串，用于执行命令的 shell，在 UNIX 上默认值为 "/bin/sh"，在 Windows 默认值为 "cmd.exe"，该 shell 必须能够解析 UNIX 中的 `-c` 和 Windows 中的 `/s /c` 开关。在 Windows 环境中，命令行解析机制需要兼容 `cmd.exe`。
    - `timeout`，数值，默认值为 0
    - `maxBuffer`，数值，指定 stdout 和 stderr 的最大数据量，如果超过了最大值，则会关闭子进程，默认值为 200 * 1024
    - `killSignal`，字符串，默认值为 "SIGTERM"
    - `uid`，数值，设置进程的用户标识
    - `gid`，数值，设置进程的组标识
- `callback`，回调函数，进程结束时调用，携带进程的输出数据
    - `error`，Error
    - `stdout`，Buffer 实例
    - `stderr`，Buffer 实例
- 返回值类型：ChildProcess 实例

在 shell 中执行 `cammand` 命令，缓存输出信息：

```js
const exec = require('child_process').exec;
const child = exec('cat *.js bad_file | wc -l',
  (error, stdout, stderr) => {
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
    if (error !== null) {
      console.log(`exec error: ${error}`);
    }
});
```

如果传入可选的回调函数 `callback`，则该回调函数接收三个来自系统的参数 `(error, stdout, stderr)`。如果执行成功，则 `error` 为 `null`，否则，`error` 为 Error 的实例。`error.code` 属性被设置为子进程的退出码，`error.signal` 属性被设置为进程结束的信号名。所有 `error.code` 不为 `0` 的执行结果都被视为程序执行过程中存在错误。

可选参数 `options` 是 `child_process.exec()` 的第二个参数，用于自定义子进程的生成方式，下面代码是该参数的默认值：

```js
{
  encoding: 'utf8',
  timeout: 0,
  maxBuffer: 200*1024,
  killSignal: 'SIGTERM',
  cwd: null,
  env: null
}
```

如果 `timeout` 的值大于 0 且子线程运行时间超过 `timeout`，则父进程会通过 `killSignal` 属性向子进程发送信号。

`maxBuffer` 参数指定了 stdout 和 stderr 的最大数据量（以字节为单位），如果超过最大值，则会关闭子进程。

> 值得注意的是，`child_process.exec()` 与 POSIX 系统调用的 `exec()` 是不同的，它不会替换现有的进程，而是会使用 shell 去执行命令。

#### child_process.execFile(file[, args][, options][, callback])

- `file`，字符串，可执行文件的文件名或者路径名
- `args`，字符串形式的参数数组
- `options`，对象
    - `cwd`，字符串，子进程当前的工作目录（current working directory）
    - `env`，对象，环境变量
    - `encoding`，字符串，默认值为 `utf8`
    - `shell`，字符串，用于执行命令的 shell，在 UNIX 上默认值为 "/bin/sh"，在 Windows 默认值为 "cmd.exe"，该 shell 必须能够解析 UNIX 中的 `-c` 和 Windows 中的 `/s /c` 开关。在 Windows 环境中，命令行解析机制需要兼容 `cmd.exe`。
    - `timeout`，数值，默认值为 0
    - `maxBuffer`，数值，指定 stdout 和 stderr 的最大数据量，如果超过了最大值，则会关闭子进程，默认值为 200 * 1024
    - `killSignal`，字符串，默认值为 "SIGTERM"
    - `uid`，数值，设置进程的用户标识
    - `gid`，数值，设置进程的组标识
- `callback`，回调函数，进程结束时调用，携带进程的输出数据
    - `error`，Error
    - `stdout`，Buffer 实例
    - `stderr`，Buffer 实例
- 返回值类型：ChildProcess 实例

`child_process.execFile()` 与 `child_process.exec()` 功能相似，唯一的不同在于不会生成新的 shell。更准确地来说，系统会使用新进程解析可执行文件，相比 `child_process.exec()` 更加高效。

`child_process.execFile()` 的可选参数与 `child_process.exec()` 相同。此外，由于没有生成新的 shell，所以不支持类似 I/O 重定向和文件名匹配的功能：

```js
const execFile = require('child_process').execFile;
const child = execFile('node', ['--version'], (error, stdout, stderr) => {
  if (error) {
    throw error;
  }
  console.log(stdout);
});
```

#### child_process.fork(modulePath[, args][, options])

- `modulePath`，字符串，在子进程中执行的模块名
- `args`，字符串形式的参数数组
- `options`，对象
    - `cwd`，字符串，子进程当前的工作目录（current working directory）
    - `env`，对象，环境变量
    - `execPath`，字符串，可执行文件的路径，用于创建子进程
    - `execArgv`，字符串形式的参数数组，传递给可执行文件，默认值为 `process.execArgv`
    - `silent`，布尔值，如果为 `true`，则将 `stdin` / `stdout` 和 `stderr` 的数据输送到父进程，否则从父进程接收数据，更多信息请参考 `child_process.spawn()` 方法中 `stdio` 的 `pipe` 和 `inherit` 参数
    - `uid`，数值，设置进程的用户标识
    - `gid`，数值，设置进程的组标识
- 返回值类型：ChildProcess 实例

`child_process.fork()` 方法是 `child_procees.spawn()` 方法的特殊用例，该方法同样返回一个 `ChildProcess` 实例，但是该实例中内建一个通信信道，用于在父子进程之间传递数据，更多信息请参考 `ChildProcess#send()` 方法。

有一点需要牢记，那就是除 IPC 信道之外，父子进程之间是相互独立的，IPC 信道则存在在父子两者之中。每一个进程都有自己的内存空间，都是独立的 V8 实例。因为创建新的进程需要分配新的空间，所以不建议创建大量的子进程。

默认情况下，`child_process.fork()` 使用父进程的 `process.execPath` 属性创建新的 Node.js 实例。可选参数对象 `options` 中的 `execPath` 属性允许使用自定义的可执行文件路径。

使用自定义 `execPath` 加载的 Node.js 进程会使用在子进程中使用环境变量 `NODE_CHANNEL_FD` 这一文件描述符与父进程进行通信。该文件描述符的输入输出要求是以行界定、冒号分隔的 JSON 对象。

> 与 POSIX 系统调用的 `fork()` 方法有所不同，`child_process.fork()` 方法不会拷贝当前进程。

#### child_process.spawn(command[, args][, options])

- `command`，字符串，待执行的命令，多个命令之间以空格分隔
- `args`，字符串形式的参数数组
- `options`，对象
    - `cwd`，字符串，子进程当前的工作目录（current working directory）
    - `env`，对象，环境变量
    - `stdio`，数组或字符串，用于配置子进程的 stdio（参考 options.stdio）
    - `detached`，布尔值，是否为子进程独立于父进程之外做准备，实际表现依赖于系统开发平台（参考 options.detached)
    - `uid`，数值，设置进程的用户标识
    - `gid`，数值，设置进程的组标识
    - `shell`，字符串或布尔值，默认值为 false。如果值为 `true`，则在 shell 之中执行 `cammand`。该 shell 在 UNIX 上默认值为 "/bin/sh"，在 Windows 默认值为 "cmd.exe"。自定义的 shell 需要传入字符串形式的路径，且自定义的 shell 必须能够解析 UNIX 中的 `-c` 和 Windows 中的 `/s /c` 开关。
- 返回值类型：ChildProcess 实例

`child_process.spawn()` 方法根据传入的 `cammand` 和 `args` 参数生成新的 进程。如果没有传入可选参数 `args`，则默认将 `args` 赋值为空数组 `[]`。

第三个参数可以指定其他可选参数，缺失则使用默认值：

```js
{
  cwd: undefined,
  env: process.env
}
```

`cwd` 指定新进程的活动路径，如果为空，则使用使用当前目录。`env` 指定环境变量，可被生成的新进程调用，默认值为 `process.env`。

下面代码演示了使用 `child_process.spawn()` 方法执行 `ls -lh /usr` 命令，并捕获 `stdout` / `stderr` 以及退出码的操作：

```js
const spawn = require('child_process').spawn;
const ls = spawn('ls', ['-lh', '/usr']);

ls.stdout.on('data', (data) => {
  console.log(`stdout: ${data}`);
});

ls.stderr.on('data', (data) => {
  console.log(`stderr: ${data}`);
});

ls.on('close', (code) => {
  console.log(`child process exited with code ${code}`);
});
```

下面代码更加细致地演示了如何执行 `ps ax | grep ssh`:

```js
const spawn = require('child_process').spawn;
const ps = spawn('ps', ['ax']);
const grep = spawn('grep', ['ssh']);

ps.stdout.on('data', (data) => {
  grep.stdin.write(data);
});

ps.stderr.on('data', (data) => {
  console.log(`ps stderr: ${data}`);
});

ps.on('close', (code) => {
  if (code !== 0) {
    console.log(`ps process exited with code ${code}`);
  }
  grep.stdin.end();
});

grep.stdout.on('data', (data) => {
  console.log(`${data}`);
});

grep.stderr.on('data', (data) => {
  console.log(`grep stderr: ${data}`);
});

grep.on('close', (code) => {
  if (code !== 0) {
    console.log(`grep process exited with code ${code}`);
  }
});
```

下面代码演示了如何监听错误事件：

```js
const spawn = require('child_process').spawn;
const child = spawn('bad_command');

child.on('error', (err) => {
  console.log('Failed to start child process.');
});
```

#### options.detached

在 Windows 开发环境下，如果将 `options.detached` 设为 `true`，则即使父进程结束之后，子进程仍可运行并拥有自己的控制台。一旦为子进程设置为 `true`，则无法取消。

在非 Windows 开发环境下，如果将 `options.detached` 设为 `true`，则该子进程将会成为新建子进程组以及会话的主管进程（leader）。注意在这种情况下，无论父子进程是否分离，父进程结束之后，子进程都会继续执行，更多信息请参考 `setsid(2)`。

默认情况下，父进程会等待已分离的子进程结束后再结束进程。如果要取消父进程等待子进程的机制，可以使用 `child.unref()` 方法，使用该方法将会让父进程的事件循环机制忽略该子进程的存在，不计入父进程的引用计数之中，实现独立结束父进程，无需检测子进程，但有一种情况例外，那就是父子进程之间存在 IPC 信道。

下面代码演示了如何分离长时间运行的进程以及如何重定向输出：

```js
const fs = require('fs');
const spawn = require('child_process').spawn;
const out = fs.openSync('./out.log', 'a');
const err = fs.openSync('./out.log', 'a');

const child = spawn('prg', [], {
 detached: true,
 stdio: [ 'ignore', out, err ]
});

child.unref();
```

使用 `detached` 选项配置长时间运行的进程时，需要注意的一点，除非提供一个不与父进程进行连接的 `stdio`，否则子进程不会再后台持续运行。如果子进程继承了父进程的 `stdio`，则子进程可以继续与控制终端进行交互。

#### options.stdio

`options.stdio` 参数常用来配置父子进程之间的通信管道。默认情况下，子进程的 stdin / stdout / stderr 都会被重定向到相应的 `ChildProcess` 对象的 `child.stdin` / `child.stdout` / `child.stderr` 数据流中，等同于设置 `options.stdio` 的值为 `['pipe', 'pipe', 'pipe']`。

为了便于理解，下面列出 `options.stdio` 所有的可选值：

- `'pipe'`，等同于 `['pipe', 'pipe', 'pipe']`，该值为 `options.stdio` 的默认值
- `'ignore'`，等同于 `['ignore', 'ignore', 'ignore']`
- `'inherit'`，等同于 `[process.stdin, process.stdout, process.stderr] or [0,1,2]`

`options.stdio` 的值为一个数组，数组的索引与子进程的文件描述符相对应，0 / 1 / 2 分别对应 stdin / stdout / stderr。此外，可以指定文件描述，在父子进程之间创建额外的管道，可选值为以下几种：

1. `pipe`，在父子进程之间创建一个管道。父进程的管道末端可以通过 `child_process` 对象的一个属性得到，比如 `ChildProcess.stdio[fd]`。为文件描述符指定的 0~2 管道也可以通过 ChildProcess.stdin / ChildProcess.stdout 和 ChildProcess.stderr 访问。
1. `ipc`，在父子进程之间创建 IPC 信道，用于传输消息和文件描述符。ChildProcess 实例最多只允许有一个 IPC stdio 文件描述符。使用该值将允许 ChildProcess 实例使用 `send()` 方法。如果子进程向文件描述符写入 JSON 数据，则会在父进程触发 `ChildProcess.on('message')` 事件。如果子进程是一个 Node.js 进程，则在子进程中允许使用 `process.send()` / `process.disconnect()` / `process.on('disconnect')` 和 `process.on('message')` 方法。
1. `ignore`，声明在子进程中忽略文件描述符。Node.js 默认为新建进程开启 0~2 文件描述符，如果将文件描述符设置为 `ignore`，则 Node.js 会将 `/dev/null` 附加给文件描述符。
1. `Stream` 对象，与子进程共享一个可读写的 tty / file / socket / pipe 数据流。数据流的底层文件描述符会被子进程复制给与 `stdio` 数组相对应的文件描述符。注意，数据流必须拥有一个底层描述符。
1. 正整数，该值表示在父进程中打开的文件描述符。父子进程共享该值，类似于 `Stream` 对象的共享机制。
1. `null` / `undefined`，使用默认值。为 stdio 的文件描述符 0~2 创建管道，为文件描述符 3 及以上设为 `ignore`

```js
const spawn = require('child_process').spawn;

// Child will use parent's stdios
spawn('prg', [], { stdio: 'inherit' });

// Spawn child sharing only stderr
spawn('prg', [], { stdio: ['pipe', 'pipe', process.stderr] });

// Open an extra fd=4, to interact with programs presenting a
// startd-style interface.
spawn('prg', [], { stdio: ['pipe', null, null, null, 'pipe'] });
```

值得注意的是，如果父子进程之间创建了 IPC 信道，且子进程是一个 Node.js 进程，则只有子进程为 `process.on('disconnected')` 注册了事件处理器之后，才会启动开启 IPC 信道（该信道通过 `unref()` 方法，不被父进程引用）的子进程。这一机制允许子进程正常退出，而无需进程通过 IPC 信道保持开启状态。

## 创建同步进程

`child_process.spawnSync()`、`child_process.execSync()` 和 `child_process.execFileSync()` 都是同步方法，它们在执行过程中会阻塞 Node.js 的事件循环机制、暂停其他代码的执行，直到进程结束。

这些同步执行的方法在某些方面大有用处，比如简化常规的脚本任务、简化应用程序配置的加载和执行过程。

#### child_process.execFileSync(file[, args][, options])

- `file`，字符串，可执行文件的文件名或者路径名
- `args`，字符串形式的参数数组
- `options`，对象
    - `cwd`，字符串，子进程当前的工作目录（current working directory）
    - `input`，字符串和 Buffer 实例，该值将会作为 stdin 传入新建进程。传入该值会覆盖 `stdio[0]` 的值
    - `stdio`，数组，用于配置子进程的 stdio，默认值为 "pipe"。除非指定 `stdio` 否则默认会将 `stderr` 传输给父进程的 `stderr`
    - `env`，对象，环境变量
    - `uid`，数值，设置进程的用户标识
    - `gid`，数值，设置进程的组标识
    - `timeout`，数值，允许子进程执行的最长时间，单位为毫秒，默认值为 undefined
    - `maxBuffer`，数值，指定 stdout 和 stderr 的最大数据量，如果超过了最大值，则会关闭子进程，默认值为 200 * 1024
    - `killSignal`，字符串，新建子进程结束时使用到的信号值，默认值为 "SIGTERM"
    - `encoding`，字符串，指定所有 stdio 输入输出的编码格式，默认值为 `buffer`
- 返回值类型：Buffer 实例或字符串

`child_process.execFileSync()` 方法与 `child_process.execFile()` 方法非常相似，最大的差别在于只有子进程完全结束，该方法才会然会值。如果子进程执行时间超过了 `tiemout` 或者收到了 `killSignal`，则直到进程完全退出前，该方法都不会返回值。注意，如果子进程拦截处理了 `SIGTERM` 信号，并且进程没有结束，那么父进程就会一直等待子进程结束。

如果进程执行时间超市，或者退出码不为 0，那么该方法就睡抛出错误，抛出的 Error 实例包含来自 `child_process.spawnSync()` 方法的完整的错误信息。

#### child_process.execSync(command[, options])

- `command`，字符串，待执行的命令，多个命令之间以空格分隔
- `options`，对象
    - `cwd`，字符串，子进程当前的工作目录（current working directory）
    - `input`，字符串和 Buffer 实例，该值将会作为 stdin 传入新建进程。传入该值会覆盖 `stdio[0]` 的值
    - `stdio`，数组，用于配置子进程的 stdio，默认值为 "pipe"。除非指定 `stdio` 否则默认会将 `stderr` 传输给父进程的 `stderr`
    - `env`，对象，环境变量
    - `shell`，字符串，用于执行命令的 shell，在 UNIX 上默认值为 "/bin/sh"，在 Windows 默认值为 "cmd.exe"，该 shell 必须能够解析 UNIX 中的 `-c` 和 Windows 中的 `/s /c` 开关。在 Windows 环境中，命令行解析机制需要兼容 `cmd.exe`。
    - `uid`，数值，设置进程的用户标识
    - `gid`，数值，设置进程的组标识
    - `timeout`，数值，允许子进程执行的最长时间，单位为毫秒，默认值为 undefined
    - `killSignal`，字符串，新建子进程结束时使用到的信号值，默认值为 "SIGTERM"
    - `maxBuffer`，数值，指定 stdout 和 stderr 的最大数据量，如果超过了最大值，则会关闭子进程，默认值为 200 * 1024
    - `encoding`，字符串，指定所有 stdio 输入输出的编码格式，默认值为 `buffer`
- 返回值类型：Buffer 实例或字符串

`child_process.execSync()` 方法与 `child_process.exec()` 方法非常相似，最大的差别在于只有子进程完全结束，该方法才会然会值。如果子进程执行时间超过了 `tiemout` 或者收到了 `killSignal`，则直到进程完全退出前，该方法都不会返回值。注意，如果子进程拦截处理了 `SIGTERM` 信号，并且进程没有结束，那么父进程就会一直等待子进程结束。

如果进程执行时间超市，或者退出码不为 0，那么该方法就睡抛出错误，抛出的 Error 实例包含来自 `child_process.spawnSync()` 方法的完整的错误信息。

#### child_process.spawnSync(command[, args][, options])

- `command`，字符串，待执行的命令，多个命令之间以空格分隔
- `args`，字符串形式的参数数组
- `options`，对象
    - `cwd`，字符串，子进程当前的工作目录（current working directory）
    - `input`，字符串和 Buffer 实例，该值将会作为 stdin 传入新建进程。传入该值会覆盖 `stdio[0]` 的值
    - `stdio`，数组，用于配置子进程的 stdio，默认值为 "pipe"。除非指定 `stdio` 否则默认会将 `stderr` 传输给父进程的 `stderr`
    - `env`，对象，环境变量
    - `uid`，数值，设置进程的用户标识
    - `gid`，数值，设置进程的组标识
    - `timeout`，数值，允许子进程执行的最长时间，单位为毫秒，默认值为 undefined
    - `killSignal`，字符串，新建子进程结束时使用到的信号值，默认值为 "SIGTERM"
    - `maxBuffer`，数值，指定 stdout 和 stderr 的最大数据量，如果超过了最大值，则会关闭子进程，默认值为 200 * 1024
    - `encoding`，字符串，指定所有 stdio 输入输出的编码格式，默认值为 `buffer`
    - `shell`，字符串或布尔值，默认值为 false。如果值为 `true`，则在 shell 之中执行 `cammand`。该 shell 在 UNIX 上默认值为 "/bin/sh"，在 Windows 默认值为 "cmd.exe"。自定义的 shell 需要传入字符串形式的路径，且自定义的 shell 必须能够解析 UNIX 中的 `-c` 和 Windows 中的 `/s /c` 开关。
- 返回值类型：对象
    - `pid`，数值，子进程的 PID（进程标识符）
    - `output`，数组，来自 stdio 的输出
    - `stdout`，Buffer 实例或字符串， `output[1]` 的内容
    - `stderr`，Buffer 实例或字符串， `output[2]` 的内容
    - `status`，数值， 子进程的退出码
    - `signal`，字符串， 用于杀死子进程的信号
    - `error`，Error 实例，如果子进程失败或超市返回此对象

`child_process.execSync()` 方法与 `child_process.exec()` 方法非常相似，最大的差别在于只有子进程完全结束，该方法才会然会值。如果子进程执行时间超过了 `tiemout` 或者收到了 `killSignal`，则直到进程完全退出前，该方法都不会返回值。注意，如果子进程拦截处理了 `SIGTERM` 信号，并且进程没有结束，那么父进程就会一直等待子进程结束。

## CLass: ChildProcess

`ChildProcess` 类的实例是 EventEmitter，相当于创建了新的子进程。`ChildProcess` 实例需要使用 `child_process.spawn()` / `child_process.exec()` / `child_process.execFile()` 或者 `child_process.fork()` 方法创建。

#### 事件：'close'

- `code`，数值，子进程正常结束时的退出码
- `signal`，字符串，子进程中断时的信号

`close` 事件发生在子进程 stdio stream 关闭时，这个 `exit` 事件有所不同，因为同一个 stdio stream 可能被多个进程共享。

#### 事件：'disconnect'

`disconnect` 事件发生在父进程或子进程调用 `ChildProcess.discount()` 方法之后。断开连接之后，将不再收发消息，`ChildProcess.connected` 属性被赋值为 false。

#### 事件：'error'

- `err`，Error 实例

`error` 事件发生的原因有以下几种：

1. 进程创建失败
2. 进程无法杀死
3. 无法向子进程发送消息

注意，`error` 事件发生后，`exit` 事件有可能发生也有可能不发生。如果你同时监听了 `exit` 和 `error` 事件，一定要预防事件处理函数被多次调用的情况。

#### 事件：'exit'

- `code`，数值，子进程正常结束时的退出码
- `signal`，字符串，子进程中断时的信号

`exit` 事件发生在子进程结束之后。进程结束之后，`code` 表示进程正常结束的退出码，否则为 `null`。如果进程因为接收到信号而中断，那么就会使用 `signal` 表示该信号的名称。两者之一必不为 `null`。

注意，触发 `exit` 事件时，子进程的 stdio stream 仍可能处于开放状态。此外，Node.js 回味 `SIGINT` 和 `SIGTERM` 创建信号处理器，所以为了接收这些信号，Node.js 进程并不会立即结束。更深的理解是，Node.js 会执行一系列的清理行为，然后再唤起信号。

#### 事件：'message'

- `message`，对象或原始值，一个解析后的 JSON 对象或原始值
- `sendHandle`，Handle 实例，一个 `net.Socket` 或 `net.Server` 对象，甚至是 undefined

子进程使用 `process.send()` 发送消息时触发 `message` 事件。

#### child.connected

- 布尔值，`disconnect()` 方法调用后，该值为 false

`child.connected` 属性用于声明是否继续与子进程接发消息，如果值为 `false`，则停止接发消息。

#### child.disconnect()

该方法用于关闭父子进程之间的 IPC 信道，如果父子进程之间不再通信了，就可以优雅的结束子进程。调用该方法后，父子进程中的 `child.connected` 和 `process.connected` 属性会被设为 false，并且不再进行通信。

如果进程不再收到消息，则触发 `disconnect` 事件。当调用 `child.disconnect()` 方法后，会直接触发 `disconnect` 事件。

注意，如果子进程是 Node.js 实例（比如使用 `child_process.fork()` 创建的进程），那么子进程中的 `process.discounnect()` 方法也会被调用，继而关闭 IPC 信道。

#### child.kill([signal])

- `signal`，字符串

`child.kill()` 方法用于给子进程发送信号。如果参数为空，则进程发送 `SIGTERM` 信号，完整的信号列表请参考 `signal(7)`。

```js
const spawn = require('child_process').spawn;
const grep = spawn('grep', ['ssh']);

grep.on('close', (code, signal) => {
  console.log(`child process terminated due to receipt of signal ${signal}`);
});

// Send SIGHUP to process
grep.kill('SIGHUP');
```

如果信号无法传递，则 `ChildProcess` 对象触发 `error` 事件。向已经结束的子进程发送信号并不会触发 `error` 事件，但是可能会发生意想不到的结果。特别值得强调的是，如果 PID 已经被其他进程注册了，那么信号就会被传递给注册了该 PID 的进程，继而导致无法预测的结果。

注意，虽然这个方法的函数名是 `kill`，但传递给子进程的信号有可能无法终端该进程。

#### child.pid

- 整数

返回子进程的 PID（进程标示符）。

```js
const spawn = require('child_process').spawn;
const grep = spawn('grep', ['ssh']);

console.log(`Spawned child pid: ${grep.pid}`);
grep.stdin.end();
```

#### child.send(message[, sendHandle][, callback])

- `message`，对象
- `sendHandle`，Handle 实例
- `callback`，回调函数
- `Return`， 布尔值

父子进程之间创建 IPC 信道之后，就可以使用 `child.send()` 方法向子进程发送消息了。如果子进程是一个 Node.js 实例，那么可以使用 `process.on('message')` 事件来接收消息。下面代码实例是父进程部分的脚本：

```js
const cp = require('child_process');
const n = cp.fork(`${__dirname}/sub.js`);

n.on('message', (m) => {
  console.log('PARENT got message:', m);
});

n.send({ hello: 'world' });
```

下面代码实例是子进程部分的脚本：

```js
process.on('message', (m) => {
  console.log('CHILD got message:', m);
});

process.send({ foo: 'bar' });
```

子进程同样可以使用自己的 `process.send()` 方法想父进程发送消息。

类似 `{cmd: 'NODE_foo'}` 的消息属于 Node.js 消息中的特例。所有在 `cmd` 字段中以 `NODE_` 为前缀的消息，都会被 Node.js core 储存起来，不会触发子进程中的 `process.on('message')` 事件。更进一步，如果想要捕获此类消息需要使用 `process.on('internalMessage')` 事件。应用程序应该避免传输此类消息，或者使用 `internalMessage` 事件来监听。

`child.sned()` 方法中的可选参数 `sendHandle` 用于向子进程传递 TCP 服务器或者 socket 对象。子进程会将收到的对象作为第二个参数传递给 `process.on('message')` 事件中注册的回调函数。

可选参数 `callback` 是一个回调函数，会在消息发送之后、子进程接收消息之前被调用。该回调函数只有一个参数，当 `child.send()` 执行成功时，该参数的值为 null，反之，则为 Error 实例。

如果没有传入回调函数且消息发送失败，`ChildProcess` 对象就会触发一个 `error` 事件，比如发送消息时子进程已经结束。

如果信道关闭或者积压的消息超过了阈值，则 `child.send()` 就会返回 `false`，反之，则返回 `true`。其中，`callback` 函数可以用来实现流程控制。

**如何发送一个 server 对象**

在下面的代码中，使用 `sendHandle` 参数想子进程传递了一个 TSCP 服务器的处理器：

```js
const child = require('child_process').fork('child.js');

// Open up the server object and send the handle.
const server = require('net').createServer();
server.on('connection', (socket) => {
  socket.end('handled by parent');
});
server.listen(1337, () => {
  child.send('server', server);
});
```

子进程接收 server 对象：

```js
process.on('message', (m, server) => {
  if (m === 'server') {
    server.on('connection', (socket) => {
      socket.end('handled by child');
    });
  }
});
```

现在父子进程之间共享 server，那么两者都可以调用 server 处理任务。

虽然上面使用的 server 使用 `net` 模块创建的，实际上 `dgram` 模块的 server 使用方式也大同小异，差异主要包括：使用 `message` 事件而不是 `connection` 事件进行监听，使用 `server.bind` 而不是 `server.listen` 方法进行绑定。目前，`dgram` 模块的 server 只支持 UNIX 平台。

**如何发送一个 socket 对象**

同样，`sendHandler` 参数也可以用来向子进程发送 socket 对象。下面的代码新建了两个子进程，其中一个的 `priority` 参数为 `normal`，一个为 `special`：

```js
const normal = require('child_process').fork('child.js', ['normal']);
const special = require('child_process').fork('child.js', ['special']);

// Open up the server and send sockets to child
const server = require('net').createServer();
server.on('connection', (socket) => {

  // If this is special priority
  if (socket.remoteAddress === '74.125.127.100') {
    special.send('socket', socket);
    return;
  }
  // This is normal priority
  normal.send('socket', socket);
});
server.listen(1337);
```

在子进程中接收 socket 对象，并将其作为第二个参数传递给回调函数：

```js
process.on('message', (m, socket) => {
  if (m === 'socket') {
    socket.end(`Request handled with ${process.argv[2]} priority`);
  }
});
```

父进程将 socket 对象传递给子进程之后，如果 socket 对象销毁了，则父进程将不再追踪它，且 `.connections` 属性变为 `null`。当出现这种情况时，不建议使用 `.maxConnections` 属性。

#### child.stderr

- Stream 实例

子进程 stderr 的可读 Stream 实例。如果生成子进程的 `stdio[2]` 不是 `pipe`，则该值为 undefined。

`child.stderr` 是 `child.stdio[2]` 的别名，它们指向同一个值。

#### child.stdin

- Stream 实例

子进程 stdin 的可写 Stream 实例。注意，如果一个子进程在等待输入，它会暂停执行，直到 stream 通过 `end()` 被关闭。如果生成子进程的 `stdio[0]` 不是 `pipe`，则该值为 undefined。

`child.stdio` 是 `child.stdio[0]` 的别名，它们指向同一个值。

#### child.stdio

- 数组

传给子进程的管道数组，与 `child_process.spawn()` 方法中可选参数 `stdio` 的顺序相一致，默认值为 ’pipe'。注意，`child.stdio[0]` / `child.stdio[1]` / `child.stdio[2]` 与 `child.stdin` / `child.stdout` / `child.stderr` 对应相等。

在下面的代码中，只有子进程的文件描述符 1 (`stdout`) 的值为 `pipe`，所有只有父进程的 `child.stdio[1]` 是 Stream 实例，其他都为 null：

```js
const assert = require('assert');
const fs = require('fs');
const child_process = require('child_process');

const child = child_process.spawn('ls', {
    stdio: [
      0, // Use parents stdin for child
      'pipe', // Pipe child's stdout to parent
      fs.openSync('err.out', 'w') // Direct child's stderr to a file
    ]
});

assert.equal(child.stdio[0], null);
assert.equal(child.stdio[0], child.stdin);

assert(child.stdout);
assert.equal(child.stdio[1], child.stdout);

assert.equal(child.stdio[2], null);
assert.equal(child.stdio[2], child.stderr);
```

#### child.stdout

子进程 stdout 的可读 Stream 实例。如果生成子进程的 `stdio[1]` 不是 `pipe`，则该值为 undefined。

`child.stdout` 是 `child.stdio[1]` 的别名，它们指向同一个值。




























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
