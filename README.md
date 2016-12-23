## Hugo 基础知识

Hugo 是一个静态网站生成器，特点是编译速度极快。如果你使用的 Mac 系统，可以使用 brew 进行安装：

```bash
brew update && brew install hugo
```

其他系统的安装方式可以参考 [官方文档](https://gohugo.io/overview/installing/)。安装完成之后，可以使用以下方式创建和初始化博客：

```bash
# hugo new site [site-name]
hugo new site blog
```

初始化后的静态网站主要有以下文件和目录：

- archetypes: 文章模版
- config.toml: 博客的配置文件 
- content: 存放博客文章的目录
- data: 
- layouts: 网站模版
- static: 静态资源
- i8n: 国际化方案
- theme: 主题资源

新建文章使用 `hugo new [post-name]` 命令，默认生成的草稿文章，比如：

```bash
hugo new post/post-name.md
```

上面的命令在 content 目录下的 post 目录中创建了一个 `post-name.md` 文件。新建文件后，添加一些内容，然后就可以使用以下命令启动服务器：

```bash
hugo server --buildDrafts --theme="theme-name"

# 在 1313 端口预览网页
open http://localhost:1313
```

上面的 `--buildDrafts` 参数表示允许编译草稿文章，默认不生成草稿文章——这些参数最好在配置文件中配置。预览文章时可能会发现看不到任何内容，这是因为没有安装任何主题，你可以前往 [主题列表](http://themes.gohugo.io/) 查找自己喜欢的主题，比如安装 [Learn](http://themes.gohugo.io/hugo-theme-learn/) 这个主题：

```bash
cd themes
git clone https://github.com/matcornic/hugo-theme-learn.git
```

通过指定主题名称，即可使用该主题：

```bash
hugo server --buildDrafts --theme="hugo-theme-learn"
```

当文章完成之后，可以使用 `hugo undraft [file-name]` 将文章从草稿状态修改为可发布状态：

```bash
hugo undraft post/post-name.md
```

在发布文章前，最好删除之前编译过的资源，然后再生成新的资源：

```bash
rm -rf ./public && hugo
```

资源编译完成之后，假设我们将其推送到 GitHub 上，操作方法和推送项目一致：

```bash
git add . && git commit -m "xxxx" && git push origin master
```

如果现有的主题不满足你的需求，则可以创建我们自己的主题，Hugo 也提供了创建主题的脚手架工具：

```bash
hugo new theme
```

上面的命令可以帮你搭建一个主题的起始项目结构和资源。在编译过程中，如果你想查看详细的编译信息，可以追加 `verbose` 参数，这对于开发主题非常重要：

```bash
hugo --verbose
hugo server --verbose
```

## 配置

Hugo 项目的配置文件位于项目根目录下的 `config.toml` 文件中，允许配置的参数及其默认值包括：

```toml
# 归档目录
archetypeDir:               "archetypes"
# 域名，比如 http://spf13.com/
baseURL:                    ""
# 是否编译草稿
buildDrafts:                false
# 是否编译尚未达到发布日期的文章
buildFuture:                false
# 是否编译过期的文章
buildExpired:               false
# 是否使用相对路径，该选项不影响使用绝对路径的链接
relativeURLs:               false
canonifyURLs:               false
# 配置文件，默认值查找项目根目录下的 config.yaml、config.json 和 config.toml
config:                     "config.toml"
# 内容目录
contentDir:                 "content"
# 数据目录
dataDir:                    "data"
# 默认的扩展名
defaultExtension:           "html"
# 默认的布局模版
defaultLayout:              "post"
# 默认的内容语言
defaultContentLanguage:     "en"
# 是否将生成的默认语言文件存放在子目录中，比如对默认的 /en/，根目录会自动从 / 重定向到 /en/
defaultContentLanguageInSubdir: false
# 是否禁用实时重载功能
disableLiveReload:          false
# 是否禁用 RSS
disableRSS:                 false
# 是否禁用 Sitemap
disableSitemap:             false
# 是否使用 GitInfo
enableGitInfo:              false
# 是否生成 Robots
enableRobotsTXT:            false
# 是否禁用 404
disable404:                 false
# 是否不向主页注入生成器信息
disableHugoGeneratorInject: false
# 使用指定编辑器编辑新文章
editor:                     ""
# 是否允许使用 Emoji
# See www.emoji-cheat-sheet.com
enableEmoji:                false
# Show a placeholder instead of the default value or an empty string if a translation is missing
enableMissingTranslationPlaceholders: false
footnoteAnchorPrefix:       ""
footnoteReturnLinkContents: ""
# google analytics tracking id
googleAnalytics:            ""
languageCode:               ""
layoutDir:                  "layouts"
# 是否启用日志功能
log:                        false
# 日志文件位置
logFile:                    ""
# 元数据的扩展名："yaml", "toml", "json"
metaDataFormat:             "toml"
newContentEditor:           ""
# 是否禁用同步文件的权限信息 
noChmod:                    false
# 是否禁用同步文件的修改事件
noTimes:                    false
# 每页的文章数量
paginate:                   10
# 分页页面的路径
paginatePath:               "page"
permalinks:
# Pluralize titles in lists using inflect
pluralizeListTitles:        true
# 是否允许在术语名称中使用特殊字符，比如 "Gérard Depardieu"
preserveTaxonomyNames:      false
# 部署目录
publishDir:                 "public"
# 是否允许对未指定语言的代码进行代码类型预测
pygmentsCodeFencesGuessSyntax: false
# 语法高亮主题名称
pygmentsStyle:              "monokai"
# true: use pygments-css or false: color-codes directly
pygmentsUseClasses:         false
# default sitemap configuration map
sitemap:
# 资源目录
source:                     ""
staticDir:                  "static"
# 是否追踪编译过程中的内存和时间使用信息
stepAnalysis:               false
# 主题目录
themesDir:                  "themes"
# 主题名称
theme:                      ""
title:                      ""
# 是否将 filename.html 替换为 /filename/
uglyURLs:                   false
# 是否禁用自动将 url/path 转换为小写字符
disablePathToLower:         false
# if true, auto-detect Chinese/Japanese/Korean Languages in the content. (.Summary and .WordCount can work properly in CJKLanguage)
hasCJKLanguage:             false
# 是否输出编译详情
verbose:                    false
# 是否启用日志记录编译详情
verboseLog:                 false
# 是否监视文件变动并重新编译资源
watch:                      true

# 指定编译时忽略的文件
ignoreFiles = ["\\.foo$", "\\.boo$"]
```

Hugo 使用 [Blackfriday](https://github.com/russross/blackfriday) 作为 Markdown 语法的渲染引擎，与之相关的配置信息也可以写入 config.toml 文件中，比如：

```toml
[blackfriday]
    angledQuotes = true
    fractions = false
    plainIDAnchors = true
    extensions = ["hardLineBreak"]
```

Blackfriday 的详细配置信息可以参考 [https://gohugo.io/overview/configuration#configure-blackfriday-rendering](https://gohugo.io/overview/configuration#configure-blackfriday-rendering)。

## Content

一个典型的 Content 目录结构如下所示：

```bash
.
└── content
    └── about
    |   └── index.md                # <- http://pinggod.com/about/
    ├── post
    |   ├── firstpost.md            # <- http://pinggod.com/post/firstpost/
    |   ├── happy
    |   |   └── ness.md             # <- http://pinggod.com/post/happy/ness/
    |   └── secondpost.md           # <- http://pinggod.com/post/secondpost/
    └── quote
        ├── first.md                # <- http://pinggod.com/quote/first/
        └── second.md               # <- http://pinggod.com/quote/second/
```

Hugo 相信开发者会根据自己的需要合理安排目录结构，所以 Hugo 会根据 Content 目录结构编译出结构类似的 Public 目录。注意，About 页面需要置于一级目录且内部包含一个 index.md 文件，编译之后使用 `http://pinggod.com/about` 访问。在头信息（Front Matter）中，通过指定不同的参数，可以更好地控制文章内容的展现，下面列出的可用参数是按特定顺序排列的，后者可以覆盖前者：

- filename：该字段不会出现在头信息中，而是体现在文件名中
- slug：filename.extension 或 filename/
- filepath
- section：根据文件在 Content 中的结构决定
- type
- path：section + path/to/slug
- url: 相对路径

```bash
           permalink
⊢--------------^-------------⊣
http://spf13.com/projects/hugo


   baseURL       section  slug
⊢-----^--------⊣ ⊢--^---⊣ ⊢-^⊣
http://spf13.com/projects/hugo


   baseURL       section          slug
⊢-----^--------⊣ ⊢--^--⊣        ⊢--^--⊣
http://spf13.com/extras/indexes/example


   baseURL            path       slug
⊢-----^--------⊣ ⊢------^-----⊣ ⊢--^--⊣
http://spf13.com/extras/indexes/example


   baseURL            url
⊢-----^--------⊣ ⊢-----^-----⊣
http://spf13.com/projects/hugo


   baseURL               url
⊢-----^-- ------⊣ ⊢--------^-----------⊣
http://spf13.com/extras/indexes/example
```

Hugo 对于每篇文章的头信息，预定义了一些变来那个，这些变量可以通过 `.Params` 变量获取：

- title，内容标题
- description，内容描述
- data，内容创建时间
- tags / categories（taxonomies），分类信息
- aliases，地址别名
- draft，是否是草稿
- publishdata，发布时间
- expirydata，过期时间
- type，内容类型
- isCJKLanguage，是否是中日韩语言，中日韩语言的字符将会被特殊处理，以保证字数计算的准确性
- weight，内容的权重
- markup，内容类型，默认是 markdown
- slug，地址尾部地址，可用于修改文章地址
- url，文章的完整路径

默认情况下，type 等同于 section，section 就是 content 目录下直接子目录的名称，直接在头信息中定义 type 可以覆盖已有信息。如果要创建一个 type 的模版，需要在主题的 layout 目录下创建一个 type 目录，比如创建一个 post type，则需要在主题目录下创建一个 `layout/post/single.html`；如果想为同一个 type 的所有文章创建一个页面，则需要在主题目录下创建 `layout/section/post.html`。通过在 `/archetypes` 目录下创建 `type.md`，可以为 type 或 section 文章创建脚手架文章。

通过 page 下的 `.Summary` 变量，我们可以获取页面的摘要信息，默认摘要信息是文章的前七十个字符，你也可以使用 `<!--more-->` 来显式声明摘要。此外，Hugo 还提供了一个 `.Truncated` 变量，用于表示除摘要外，页面是否还有其他功能。

如果你想做一个多语言静态网站，可以使用 Hugo 提供的国际化功能，该功能主要分为两个部分，一个是将多语言信息存放在 config.toml 文件中，比如一些网站的标题等：

```bash
[Languages]
[Languages.en]
title = "My blog"
weight = 1
[Languages.en.params]
linkedin = "english-link"

[Languages.fr]
copyright = "Tout est à moi"
title = "Mon blog"
weight = 2
[Languages.fr.params]
linkedin = "lien-francais"
```

此外，还可以将国际化信息存放在 i18n 目录下，比如将英文信息存放在 `i18n/en.yaml`：

```yaml
- id: home
  translation: "Home"
```

使用方式是：

```go
{{ i18n "home" }}
```

为了便于 Hugo 识别不同语言的文章，需要通过文件名体现当前内容的语言：

- 英文文章：`/content/about.en.md`
- 法文文章：`/content/about.fr.md`

## Templates

Hugo 默认使用 Go html/template 库作为模版引擎。变量、函数和参数需要置于双大括号之间并以空格分割：

```go
{{ add 1 2 }}

{{ .Params.bar }}

{{ if or (isset .Params "alt") (isset .Params "caption") }} Caption {{ end }}

{{ $address := "123abc" }}
```

如果想引用某个模版并传递参数，可以使用如下方式，切记不要遗漏最后的 `.`：

```go
{{ partial "header.html" . }}
```

使用 range 函数进行迭代和遍历：

```go
{{range $index, $element := array}}
    {{ $index }}
    {{ $element }}
{{ end }}
```

if/else/with/or/and 是 Go 中的条件语句关键字，和 range 类似，需要使用 end 显式声明结束：

```go
{{ if isset .Params "alt" }}
    {{ index .Params "alt" }}
{{ else if isset .Params "caption" }}
    {{ index .Params "caption" }}
{{ end }}

{{ if and (or (isset .Params "title") (isset .Params "caption")) (isset .Params "attr")}}
```

在 Go 语言中，以下数据属于假值：

- false
- 0
- 空数组、分片、字符串等

Go 模板引擎的一个强大功能就是实现了类似 Unix 的管道符，比如：

```go
{{ shuffle (seq 1 5) }}

// 可以改写成
{{ (seq 1 5) | shuffle }}

{{ if or (or (isset .Params "title") (isset .Params "caption")) (isset .Params "attr") }}
Stuff Here
{{ end }}

// 可以改写成
{{ if isset .Params "caption" | or isset .Params "title" | or isset .Params "attr" }}
Stuff Here
{{ end }}
```

如果你想获取上下文对象，可以直接使用 `{{ . }}`，这里的点会一直引用当前上下文。如果是在模版的顶层，那么它是一组可用的数据；如果是在一个遍历过程中，那么它是当前遍历到的数据。那么如果要在遍历中引用顶层对象，就需要为顶层对象设置一个变量：

```go
{{ $title := .Site.Title }}
{{ range .Params.tags }}
  <li>
    <a href="{{ $baseURL }}/tags/{{ . | urlize }}">{{ . }}</a>
    - {{ $title }}
  </li>
{{ end }}
```

或者使用 `$.`，该变量总是可以引用全局上下文：

```go
{{ range .Params.tags }}
  <li>
    <a href="{{ $baseURL }}/tags/{{ . | urlize }}">{{ . }}</a>
    - {{ $.Site.Title }}
  </li>
{{ end }}
```

默认情况下，Go 模版引擎会保留换行和空格，比如：

```go
<div>
  {{ .Title }}
</div>

// 生成结果
<div>
  Hello, World!
</div>
```

如果想去除空白字符，使用如下方式：

```go
<div>
  {{- .Title -}}
</div>
```




































