+++
description = ""
tags = ["node.js"]
categories = ["doc"]
isCJKLanguage = true
date = "2016-11-17T10:29:28+08:00"
title = "clulster"
weight = 0
notoc = false
+++

## 集群

<div class="s s2"></div>

众所周知，Node.js 的实例默认是在单线程中执行的。为了充分利用多核系统的性能，开发者可能会希望创建一个 Node.js 的进程集群处理各类负载。

开发者可以利用 `cluster` 模块快速创建共享服务器端口的子进程：

```js
const cluster = require('cluster');
const http = require('http');
const numCPUs = require('os').cpus().length;

if (cluster.isMaster) {
    // Fork workers.
    for (var i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        console.log(`worker ${worker.process.pid} died`);
    });
} else {
    // Workers can share any TCP connection
    // In this case it is an HTTP server
    http.createServer((req, res) => {
        res.writeHead(200);
        res.end('hello world\n');
    }).listen(8000);
}
```

在 Node.js 中运行上面的代码，创建共享 8000 端口的 workers:

```js
$ NODE_DEBUG=cluster node server.js
23521,Master Worker 23524 online
23521,Master Worker 23526 online
23521,Master Worker 23523 online
23521,Master Worker 23528 online
```

请注意，在 Windows 系统中，尚无法在 worker 中创建一个已命名的管道服务器。

## 工作方式

worker 进程是由 `child_process.fork()` 方法创建的，所以可以通过 IPC 在主进程和子进程之间传递服务器句柄。

`cluster` 模块提供了两种分发连接的方式。

第一种方式，也是默认方式，该方式不适用于 windows 平台，该方式通过轮询（Round-Robin）的方式分发连接，具体过程是：主进程监听端口，接收到新连接之后，通过轮询方式分发给可用的 worker，并通过内建的算法避免某个 worker 进程负载过重。

第二种方式是由主进程创建监听 socket 并将其分发给对合适的 workder，然后当连接进来时，由相应的 worker 直接处理。

理论上来说，第二种方式更加高效，但实际上，由于操作系统调度策略的复杂性，所以往往导致连接分发不平衡的现象，比如 70% 的连接终止于八个进程中的两个。

因为这里用到了 `server.listen()` 方法将大部分的工作移交给主线程，所以常规的 Node.js 进程和集群 worker 之间存在三个区别：

1. `server.listen({fd: 7})`，该消息发往主线程，主线程会监听文件描述 7 并将句柄传递给 worker，而不是监听 worker 对文件描述 7 的处理。
1. `server.listen(handle)`，监听特定的句柄，指定 worker 使用的句柄，而不是通知主线程使用哪一个句柄。如果 worker 中已存在句柄，那么它会认为你对正在进行的处理了如指掌。
1. `server.listen(0)`，通常来说，这会让服务器监听一个随机端口，不过在集群中，当 worker 调用 `listen(0)` 时，所有的 worker 都会收到相同的随机端口。本质上来说，这个端口只有第一次是随机的，随后的端口都是可预测的。如果你想创建一个独一无二的端口，可以根据集群的 worker ID 创建一个端口号。

在 Node.js 中并没有路由组件，workers 之间也米有共享的状态，因此，开发时应注意类似 session 和登录这样的任务不要过度依赖存储于内存的数据对象。

因为所有的 workers 都是独立的进程，所以你可以根据开发需要安全地杀死或重建 worker，某个进程的修改并不会影响其他进程。只要有 worker 还处于活跃状态，那么服务器就会持续接收到连接。当所有 workers 都结束后，既有连接将会被抛弃，新的连接请求也将会被拒绝。Node.js 不会为开发者自动管理 worker 的数量，所以开发者应该根据应用程序的需要自主管理 worker 池。

## Class: Worker

一个 Worker 对象包含了有关 worker 的所有公有信息和方法。在主进程中，可以通过 `cluster.workers` 获取有关 worker 的信息，在 worker 进程中可以通过 `cluster.worker`。

#### 事件：'disconnect'

该事件与 `cluster.on('disconnect')` 事件类似，但针对于特定的 worker:

```js
cluster.fork().on('disconnect', () => {
    // Worker has disconnected
});
```

#### 事件：'error'

该事件与 `child_process.fork()` 所提供的同名事件相同。

在 worker 中开发者也可以使用 `process.on('error')`。

#### 事件：'exit'

- `code`，数值，进程正常结束的退出码
- `signal`，字符串，进程中断时的信号（比如 `'SIGHUP'`）

该事件类似于 `cluster.on('exit')` 事件，但针对于特定的 worker:

```js
const worker = cluster.fork();
worker.on('exit', (code, signal) => {
  if( signal ) {
    console.log(`worker was killed by signal: ${signal}`);
  } else if( code !== 0 ) {
    console.log(`worker exited with error code: ${code}`);
  } else {
    console.log('worker success!');
  }
});
```

#### 事件：'listening'

- `address`，对象

该事件类似于 `cluster.on('listening')` 事件，但针对特定的 worker:

```js
cluster.fork().on('listening', (address) => {
  // Worker is listening
});
```

worker 进程无法触发该事件。

#### 事件：'message'

- `message`，对象

该事件类似于 `cluster.on('message')` 事件，但针对特定的 worker。

该事件与 `child_process.fork()` 提供的同名事件相同。

在 worker 中开发者也可以使用 `process.on('worker')`。

在下面的代码中，演示了如何使用消息系统在集群的主进程中记录请求量：

```js
const cluster = require('cluster');
const http = require('http');

if (cluster.isMaster) {

  // Keep track of http requests
  var numReqs = 0;
  setInterval(() => {
    console.log('numReqs =', numReqs);
  }, 1000);

  // Count requests
  function messageHandler(msg) {
    if (msg.cmd && msg.cmd == 'notifyRequest') {
      numReqs += 1;
    }
  }

  // Start workers and listen for messages containing notifyRequest
  const numCPUs = require('os').cpus().length;
  for (var i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  Object.keys(cluster.workers).forEach((id) => {
    cluster.workers[id].on('message', messageHandler);
  });

} else {

  // Worker processes have a http server.
  http.Server((req, res) => {
    res.writeHead(200);
    res.end('hello world\n');

    // notify master about the request
    process.send({ cmd: 'notifyRequest' });
  }).listen(8000);
}
```

#### 事件：'online'

该事件类似于 `cluster.on('online')` 事件，但针对于特定的 worker:

```js
cluster.fork().on('online', () => {
  // Worker is online
});
```

worker 进程无法触发该事件。

#### worker.disconnect()

在一个 worker 中，调用该函数会结束所有的服务器，然后等待这些服务器的 `close` 事件，最后切断所有的 IPC 信道。

在主进程中，会发送给调用该方法的 worker 进程一条内部消息，用于调用自身的 `disconnect()` 方法。

调用该方法，会设置 `.suicide`。

注意，服务器被关闭之后，将不会再接收新的连接，但可以使用其他监听 worker 接收这些连接，现有连接可以通过正常的方式关闭。如果没有连接，参考 `server.close()`，相应的 IPC 信道会被关闭。

以上所述只适用于服务器连接，客户端连接不能被 workers 关闭，而且切断连接时不需要等待客户端结束进程。

注意在一个 worker 中存在 `process.disconnect`，它不是一个函数，更多信息请参考 `child.disconnect()`。

服务器的长连接有可能阻塞 workers 进程，一种解决方式是给相关的应用发送消息，这样应用可以主动关闭这些连接。另一种有效的方式是创建一个 timeout 延时方法，如果 worker 在指定时间内没有触发 `disconnect` 事件，则主动关闭它：

```js
if (cluster.isMaster) {
  var worker = cluster.fork();
  var timeout;

  worker.on('listening', (address) => {
    worker.send('shutdown');
    worker.disconnect();
    timeout = setTimeout(() => {
      worker.kill();
    }, 2000);
  });

  worker.on('disconnect', () => {
    clearTimeout(timeout);
  });

} else if (cluster.isWorker) {
  const net = require('net');
  var server = net.createServer((socket) => {
    // connections never end
  });

  server.listen(8000);

  process.on('message', (msg) => {
    if(msg === 'shutdown') {
      // initiate graceful close of any connections to server
    }
  });
}
```

#### worker.id

- 数值

每一个新建的 worker 都会获得一个独一无二的 id，这个 id 就存储在 `worker.id` 属性之中。

当 worker 正常运行时，该属性也是 `cluster.workers` 的键名之一。

#### worker.isConnected()

如果 worker 和主进程通过 IPC 正常连接，则该方法返回 true，否则返回 false。worker 创建后会自动与主线程通过 IPC 信道连接，当 `disconnect` 事件触发后，则与主线程断开连接。

#### worker.isDead()

如果 worker 进程结束了，则该方法返回 true，否则返回 false。

#### worker.kill([signal='SIGTERM'])

- `signal`，字符串，发送给 worker 进程的扼杀信号

该方法用于结束 worker 进程。在主线程中，它通过关闭 `worker.process` 杀死 worker 进程，进程关闭之后，发送扼杀信号。在 worker 进程中，它通过关闭信道杀死 worker，然后通过退出码 0 退出。

调用该方法，会设置 `.suicide`。

为了向后保持兼容性，该方法是 `worker.destroy()` 的同名函数。

注意，在 worker 进程中存在 `process.kill()`，它不是一个函数，跟多信息请参考 `process.kill(pid[, signal])`。

#### worker.process

- ChildProcess 实例

所有 worker 进程都是由 `child_process.fork()` 方法创建的，该方法返回的对象被存储为 `.process`。In a worker, the global `process` is stored.

注意，如果 `process` 触发了 `disconnect` 事件且 `.suicide` 的值不为 `true`，则所有的 worker 进程都会调用 `process.exit(0)`，这有助于避免连接的意外性失连。

#### worker.send(message[, sendHandle][, callback])

- `message`，对象
- `sendHandle`，Handle 实例
- `callback`，函数
- 返回值类型：Boolean

该方法用于向主进程或 worker 进程发送消息，发送时可携带一个句柄。

在主进程中使用该方法向指定 worker 发送消息的作用与 `ChildProcess.send()` 方法相同。

在 worker 进程中使用该方法向主进程发送消息的作用与 `process.send()` 方法相同。

下面的示例会从 worker 进程向主进程回传消息：

```js
if (cluster.isMaster) {
  var worker = cluster.fork();
  worker.send('hi there');

} else if (cluster.isWorker) {
  process.on('message', (msg) => {
    process.send(msg);
  });
}
```

#### worker.suicide

- 布尔值

初始值为 undefined，调用 `.kill()` 和 `.disconnect()` 时会将该值重置为布尔类型。

布尔值 `worker.suicide` 用于帮助开发者辨析进程是主动结束还是意外结束，便于在主线程中根据该值决定是否重建 worker 线程。

```js
cluster.on('exit', (worker, code, signal) => {
  if (worker.suicide === true) {
    console.log('Oh, it was just suicide\' – no need to worry').
  }
});

// kill worker
worker.kill();
```

## 事件：'disconnect'

- `worker`，cluster.Worker 实例

当 worker 的 IPC 信道关闭之后会触发该事件。worker 进程正常退出、被杀死或被手动中断的情况下都会触发该事件。

在 `disconnect` 事件和 `exit` 事件之间可能存在时间延迟。这些事件可以用于检测一个进程是否处于清理状态或者进程是否存在长连接。

```js
cluster.on('disconnect', (worker) => {
  console.log(`The worker #${worker.id} has disconnected`);
});
```

## 事件：'exit'

- `worker`，cluster.Worker 实例
- `code`，数值，进程正常结束时的退出码
- `signal`，字符串，进程中断时的信号（比如 `'SIGHUP'`）

任意 worker 进程结束时，cluster 模块就会触发 `exit` 事件。

该事件可用于重启 worker 进程：

```js
cluster.on('exit', (worker, code, signal) => {
  console.log('worker %d died (%s). restarting...',
    worker.process.pid, signal || code);
  cluster.fork();
});
```

更多信息请参考 `child_process event: 'exit'`。

## 事件：'fork'

- `worker`，cluster.Worker 实例

当一个新的 worker 进程被分立出来时，cluster 模块就会触发 `fork` 事件。该事件可以用记录 worker 的活动日志，创建自定义的 timeout 延时处理函数：

```js
var timeouts = [];
function errorMsg() {
  console.error('Something must be wrong with the connection ...');
}

cluster.on('fork', (worker) => {
  timeouts[worker.id] = setTimeout(errorMsg, 2000);
});
cluster.on('listening', (worker, address) => {
  clearTimeout(timeouts[worker.id]);
});
cluster.on('exit', (worker, code, signal) => {
  clearTimeout(timeouts[worker.id]);
  errorMsg();
});
```

## 事件：'listening'

- `worker`，cluster.Worker 实例
- `address`，对象

worker 进程调用 `listen()` 方法后，`listening` 事件会同时在服务器和主进程的 `cluster` 触发。

该事件处理器接收两个参数，`worker` 参数是一个 worker 对象，`address` 对象包含多个连接属性：`address`、`port` 和 `addressType`。当 worker 监听多个地址时，该事件非常有用：

```js
cluster.on('listening', (worker, address) => {
  console.log(
    `A worker is now connected to ${address.address}:${address.port}`);
});
```

`addressType` 的值为以下之一：

- `4` (TCPv4)
- `6` (TCPv6)
- `-1` (unix domain socket)
- `"udp4"` 或 `"udp6"` (UDP v4 or v6)

## 事件：'message'

- `worker`，cluster.Worker 实例
- `message`，对象

当 worker 进程接收到消息触发该事件。

更多信息请参考 `child_process event:'message'`。

## 事件：'online'

- `worker`，cluster.Worker 实例

分立新 worker 进程之后，该 worker 进程应该回应一个 online 消息。当主线程接收到 online 消息之后，就会触发该事件。`fork` 事件和 `online` 事件的差异在于，主分支分立 worker 进程时触发 fork 事件，worker 进程首次运行时触发 `online` 事件。

```js
cluster.on('online', (worker) => {
  console.log('Yay, the worker responded after it was forked');
});
```

## 事件：'setup'

- `settings`，对象

每次调用 `.setupMaster()` 方法时都会触发该事件。

当 `.setupMaster()` 方法被调用时，这里的 `settings` 对象就是 `cluster.settings` 对象，因为对 `.setupMaster()` 的调用都发生在同一个周期内。

如果对精确度要求较高，请使用 `cluster.settings`。

## cluster.disconnect([callback])

- `callback`，函数，当所有 workers 都结束和句柄关闭后，调用该回调函数

`cluster.workers` 中的每个 worker 进程都可以调用 `.disconnect()` 方法。

当 worker 继承被中断时，所有的内部句柄都会关闭，如果所有事件都处理完了，那么主进程就会安全退出。

该方法结束后，最终会调用可选的回调函数 `callback`。

该方法只能从主进程调用。

## cluster.fork([env])

- `env`，对象，用于添加到 worker 进程环境的键值对
- 返回值类型：cluster.Worker 实例

该方法用于分立一个新的 worker 进程。

该方法只能从主进程调用。

## cluster.isMaster

- 布尔值

如果当前进程是主进程，则该值为 true。该值由 `process.env.NODE_UNIQUE_ID` 决定。如果 `process.env.NODE_UNIQUE_ID` 的值为 undefined，则 `isMaster` 的值为 true。

## cluster.isWorker

- 布尔值

如果当前进程不是主进程，则值为 true，反之异然。

## cluster.schedulingPolicy

调度策略有两种，其中 `cluster.SCHED_RR` 表示的轮询策略，`cluster.SCHED_NONE` 表示由操作系统处理。这是一个全局配置项，一旦创建第一个分支或调用 `cluster.setupMaster()` 之后，该配置项就会生效且被冻结无法修改。

`SCHED_RR` 是除 Windows 以外其他操作系统的默认调度策略。只要 libuv 能够高效地分配 IOCP 句柄且不造成严重的性能损耗，则 Windows 平台也使用该调度策略。

也可以通过环境变量 `NODE_CLUSTER_SCHED_POLICY` 来设置 `cluster.sckedulingPolicy`，有效值为 `rr` 或 `none`。

## cluster.settings

- 对象
    - `execArgv`，数组，传递给 Node.js 的可执行字符串数组，默认值为 `process.execArgv`
    - `exec`，字符串，file path to work file，默认值为 `process.argv[1]`
    - `args`，数组，传递给 worker 进程的字符串参数，默认值为 `process.argv.slice(2)`
    - `silent`，布尔值，是否向父进程的 stdio 发送输出信息，默认值为 `false`
    - `uid`，数值，设置进程的用户 ID
    - `gid`，数值，设置进程的组 ID

当调用 `.setupMaster()` 或 `.fork()` 之后，settings 对象就会包含上述配置信息。

因为 `.setupMaster()` 方法只能被调用一次，所以 settings 对象初始化之后就会被冻结。

## cluster.setupMaster([settings])

- settings, 对象
    - `exec`，字符串，file path to worker file，默认值为 `process.argv[1]`
    - `args`，数组，传递给 worker 进程的字符串参数，默认值为 `process.argv.slice(2)`
    - `silent`，布尔值，是否向父进程的 stdio 发送输出信息，默认值为 `false`

`setupMaster()` 方法常用于修改猫人的 `fork` 行为。一旦调用该方法，配置信息就会传递给 `cluster.settings`。

注意事项：
    - 任何配置项的修改都不会影响运行中的 worker 进程，只会影响未来通过 `.fork()` 新建的 worker 进程
    - 唯一无法由 `.setupMaster()` 配置的 worker 属性是传递给 `.fork()` 的 `env` 属性
    - 默认值只在第一次调用时有效，以后每次调用都使用上一次传递给 `cluster.setupMaster()` 的参数和配置信息

```js
const cluster = require('cluster');
cluster.setupMaster({
  exec: 'worker.js',
  args: ['--use', 'https'],
  silent: true
});
cluster.fork(); // https worker
cluster.setupMaster({
  exec: 'worker.js',
  args: ['--use', 'http']
});
cluster.fork(); // http worker
```

该方法只能从主进程调用。

## cluster.worker

- 对象

对当前 worker 对象的引用，无法再主进程中使用该属性：

```js
const cluster = require('cluster');

if (cluster.isMaster) {
  console.log('I am master');
  cluster.fork();
  cluster.fork();
} else if (cluster.isWorker) {
  console.log(`I am worker #${cluster.worker.id}`);
}
```

## cluster.workers

- 对象

用于存储当前活跃进程的哈希表，键为 `id`。使用该属性便于遍历所有的 worker 进程。该属性只能在主进程中使用。

当 worker 进程退出或与主进程失去连接后，就会从 `cluster.workers` 中删除，这里面的 disconnect 和 exit 是两个独立的事件，无法预测两者的先后顺序。不过，可以明确的是，删除行为肯定发生在 disconnect 和 exit 都发生之后。

```js
// Go through all workers
function eachWorker(callback) {
  for (var id in cluster.workers) {
    callback(cluster.workers[id]);
  }
}
eachWorker((worker) => {
  worker.send('big announcement to all workers');
});
```

有时候开发者希望通过信道获取对某个 worker 进程的引用，此时最简单的方法就是使用 worker 进程独一无二的 ID：

```js
socket.on('data', (id) => {
  var worker = cluster.workers[id];
});
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
