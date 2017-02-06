+++
description = ''
tags = ['database']
categories = ['post-c']
isCJKLanguage = true
weight = 0
notoc = false
date = "2016-11-25T10:29:28+08:00"
title="mongodb"
+++

Mongodb 提供了 Homebrew 的安装方式，安装过程如下：

```bash
brew update
brew install mongodb
mkdir -p /data/db
chmod u+rw /data/db
mongod
```

<!--more-->

Mongodb 安装完全后，在 bin 文件夹下有以下可执行程序：

- `mongod`，mongodb 的执行和部署程序
- `mongo`，连接 mongodb 服务器的客户端
- `mongoimport / mongoexport`，mongodb 数据导入导出程序
- `mongoreestore / mongodump`，mongodb 二进制数据导入导出程序，常用做数据备份和恢复
- `mongooplog`，操作日志记录程序
- `mongostat`，mongodb 状态监控和查询程序

Mongodb 数据库的简单组成结构及分工职责：

- `data`，存储数据库的数据文件
- `log`，存储数据库的日志文件
- `bin`，存储数据库的可执行文件
- `conf`，存储数据库的配置文件

创建一个轻量的 Mongodb 数据库：

```bash
mkdir mongodb-in-action
cd mongodb-in-action
mkdir data log conf bin
cp /usr/local/Cellar/mongodb/3.2.1/bin/{mongod,mongo} ./bin/
touch conf/mongod.conf
```

`conf/mongod.conf` 是这个数据库的配置文件，内容如下：

```bash
port = 12345

dbpath = data
logpath = log/mongod.log

# 是否启用后台进程
fork = true
```

然后使用指定的配置文件启动 Mongodb 服务器：

```bash
./bin/mongod -f ./conf/mongod.conf
```

接下来我们使用 `mongo` 连接数据库，连接之前查看 `mongo --help` 信息：

- 查看第二行的 `usage` 了解使用方式
- 查看第三行开始的示例了解连接格式
- 查看 options 字段下的内容了解可用参数
- 查看 Authentication Options 字段下的内容了解认证登录的方式

接下来连接 `mongodb-in-action` 的 test 数据库:

```bash
./bin/mongo 127.0.0.1:12345/test
```

在 mongo 客户端中关闭 mongodb 数据库：

```js
use admin
db.shutdownServer()
```

## 基本操作

Mongodb 数据库的常用操作：

- `show dbs`，显示所有数据库
- `use dbname`，切换到 dbname 数据库
- `db.dropDatabase()`，删除当前数据库

```js
use admin

// 显示集合
show collections

// 简单插入数据
db.imooc_collections.insert({ x: 1})

// 简单查询数据
db.imooc_collections.find()

// 使用 Javascript 语法插入多条数据
for ( var i = 0; i < 10; i++) {
    db.imooc_collections.insert({ x: i * 5})
}

// 统计数据量
db.imooc_collections.find().count()

// skip() 跳过数据
// limit() 限制返回的数据长度
// sort() 数据排序
db.imooc_collections.find().skip(3).limit(2).sort({x:1})

// 简单更新数据
db.imooc_collections.update( {x: 1}, {x: 999})

// 使用 $set 操作符进行局部更新
db.imooc_collections.insert( { x: 1, y: 2, z: 3} )
db.imooc_collections.update( { y: 2 }, { $set: { z: 0 } } )

// Mongodb 默认更新找到的第一条数据
// 同时更新多条数据需要是，第二个 JSON 参数必须是 $set
// 第三个参数表示匹配不到数据时自动插入更新数据
// 第四个参数表示是否同时更新多条记录
db.imooc_collections.update( { x: 999 }, { $set: { x: 321 } }, false, true )

// 删除数据使用 remove()，该方法参数不能为空
db.imooc_collections.remove( {x: 0} )

// 删除整个集合或者表
db.imooc_collections.drop()
```

## 索引

索引是对数据库单列或多列进行排序的结构，使用索引可以快速访问数据库中的特定信息。Mongodb 中的索引主要分为以下几种：

- \_id 索引。\_id 索引是大多数集合默认创建的索引类型，对于每一个插入的数据，Mongodb 都会自动生成一条唯一的 \_id 字段
- 单键索引，单键索引是最普通的索引，值为单一的值，比如字符串、数值或日期，不会自动创建
- 多键索引，与单键索引不同的地方就在于它的值可以是复合类型数据
- 复合索引，用于有多个查询条件的情景中
- 过期索引，指在特定时间后会过期的索引，索引过期后，相应的数据也会被删除，常用于存储登录信息、存储日志等数据。存储在过期索引字段的值必须是指定的事件类型（ISODate 或者 ISODate 数组)
- 全文索引，对字符串和字符串数组创建全文可搜索的索引
- 地理位置索引，

```js
// 查看字段是否存在
db.imooc_collections.find({ x: { $exists: true } } )

// 查看当前集合的所有索引
db.imooc_collections.getIndexes()

// 创建单键索引
db.imooc_collections.ensureIndex({ x: 1 })

// 创建多键索引
// 如果插入的是数组，默认添加多键索引
db.imooc_collections.insert({ x: [1,2,3,4,5] })

// 创建复合索引
db.imooc_collections.ensureIndex({ x: 1, y: 2 })

// 创建过期数据
db.imooc_collections.insert({ x: new Date() })

// 创建过期索引
db.imooc_collections.ensureIndex({ x: 1 }, { expireAfterSeconds: 10 } )

// 创建全文索引
db.articles.ensureIndex({ key: "text" })
db.articles.ensureIndex({ k_1: "text", k_2: "text" })
db.articles.ensureIndex({ "$**": "text" })

// 全文索引示例
db.article.insert({ "article": "aa bb cc" })
db.article.insert({ "article": "aa bb cc dd" })
db.article.insert({ "article": "aa bb cc dd ee" })
db.article.find({ $text: { $search: "cc" } } )

// 全文索引相似度查询
db.article.find({
        $text: { $search: "aa bb" }
    }, {
        score: { $meta: "textScore" }
})
.sort({
    score: { $meta: "textScore" }
})
```

全文索引支持相似度查询，相似度查询的格式是在查询条件后添加字段：` { score: { $meta: "textScore" } }`，配合 sort 方法可以根据相似度对搜索结果进行排序。全文查找的注意点：

- `$search: "aa bb cc"`，查询匹配 aa/bb/cc 其中之一的项
- `$search: "aa bb -cc"`，查询匹配 aa/bb 其中之一但不包含 cc 的项
- `$search: "\"aa\" \"bb\""`，查询同时包含 aa/bb 的项

索引的四个重要特性，这四个特性也是 ensureIndex() 的四个可选参数：

- 名字
- 唯一性
- 稀疏性
- 是否定时删除

```js
db.imooc.ensureIndex(
    { x: 1 },
    { name: "xIndex" },
    { unique: true },
    { sparse: true },
    { expireAfterSconds: 10 }
)
```

## 地理位置索引

地址位置索引用于在 mongodb 中存储位置信息，创建后，各个位置之间可以相互检索。地理位置索引分为两类：2d 索引，用于存储和查找平面上的点；2dsphere 索引，用于存储和查找球面上的点。查找方式主要有两种：查找距离某个点一定距离内的点；查找包含在某个区域中的点。

在 2d 索引中指定区域有以下三种格式：

1. `$box: [ [lx, ly], [rx, ry] ]`，指定矩形
2. `$center: [ [x, y], r ]`，指定圆形
3. `$polygon: [ [x1, y1], [x2, y2], [x3, y3] ]`，指定多边形

```js
// 创建地理位置数据
db.localindex.insert({ w: [1,1] })
db.localindex.insert({ w: [1,2] })
db.localindex.insert({ w: [2,2] })

// 创建 2d 索引
db.localindex.ensureIndex({ w: "2d" })

// 根据 [1, 1] 查询附近的点
// 匹配的点和 [1, 1] 的最大距离为 10
db.localindex.find({ w: { $near: [1, 1], $maxDistance: 10 } })

// 在矩形区域内查找某个点
db.localindex.find({ w: { $geoWithin: { $box: [ [0, 0], [1.5, 2.5] ] } } })

// 在圆形区域内查找某个点
db.localindex.find({ w: { $geoWithin: { $center: [ [1,1], 1 ] } } })

// 在多边形区域内查找某个点
db.localindex.find({w: {$geoWithin: {$polygon: [[0, 0],[1, 0],[1, 3]]}}})

// 创建 2dsphere 索引
db.localindex.ensureIndex({ w: "2dsphere })
```

## 索引构建分析

评判索引构建情况的四种工具：

1. mongostat
1. profile 集合
1. 日志
1. explain
