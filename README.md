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

很多时候，你可以使用 with 替代 if：

```go
{{if .Site.Params.CopyrightHTML}}
<footer>
    <div class="text-center">{{.Site.Params.CopyrightHTML | safeHTML}}</div>
</footer>
{{end}}

// 等同于
{{with .Site.Params.CopyrightHTML}}
<footer>
    <div class="text-center">{{.Site.Params.CopyrightHTML | safeHTML}}</div>
</footer>
{{end}}
```

## 辅助函数

**default**，判断是否有值，没有则提供一个默认值：

```go
{{ index .Params "font" | default "Roboto" }} 

{{ default "Roboto" (index .Params "font") }} 
```

**delimit**，遍历数组并返回一个字符串，字符串的内容就是数组元素，数组元素之间以指定分隔符相连：

```go
// +++
// tags: [ "tag1", "tag2", "tag3" ]
// +++ 

{{ delimit .Params.tags "," }}
// => "tag1, tag2, tag3"

{{ delimit .Params.tags ", " " and " }}
// => "tag1, tag2 and tag3"
```

**dict**，创建一个字典：

```go
{{$important := .Site.Params.SomethingImportant }}
{{range .Site.Params.Bar}}
    {{partial "foo" (dict "content" . "important" $important)}}
{{end}}

// foo.html
Important {{.important}}
{{.content}}
```

**slice**，创建一个数组：

```go
{{ delimit (slice "foo" "bar" "buzz") ", " }}
// returns the string "foo, bar, buzz" 
```

**shuffle**，返回一个随机序列的数组：

```go
{{ shuffle (seq 1 5) }}
// returns [2 5 3 1 4]

{{ shuffle (slice "foo" "bar" "buzz") }}
// returns [buzz foo bar]
```

**echoParam**，如果变量存在，则将其打印出来：

```go
{{ echoParam .Params "project_url" }}
```

**eq**，判断是否相等，比如 `{{ if eq .Section "blog" }}current{{ end }}`

**first**，切分数组的第一个元素到第 N 个元素，生成新数组：

```go
{{ range first 10 .Data.Pages }}
    {{ .Render "summary" }}
{{ end }}
```

**jsonify**，将一个对象转换为 JSON：

```go
{{ dict "title" .Title "content" .Plain | jsonify }}
```

**last**，切分数组的最后一个元素到倒数第 N 个元素，生成新数组：

```go
{{ range last 10 .Data.Pages }}
    {{ .Render "summary" }}
{{ end }}
```

**after**，切分数组的第 N 个元素到最后一个元素，生成心数组：

```go
{{ range after 10 .Data.Pages }}
    {{ .Render "title" }}
{{ end }}
```

**getenv**，返回环境变量：

```go
{{ getenv "HOME" }}
```

**in**，判断数组中是否包含某个元素，然后布尔值。即可检查字符串、整数和浮点数是否在数组中，也可以检查某个字符串是不是另一个字符串的子串：

```go
{{ if in .Params.tags "Git" }}
Follow me on GitHub!
{{ end }}
```

**intersect**，求数组合集，常用于查找具有相同标签的文章：

```go
<ul>
{{ $page_link := .Permalink }}
{{ $tags := .Params.tags }}
{{ range .Site.Pages }}
    {{ $page := . }}
    {{ $has_common_tags := intersect $tags .Params.tags | len | lt 0 }}
    {{ if and $has_common_tags (ne $page_link $page.Permalink) }}
        <li><a href="{{ $page.Permalink }}">{{ $page.Title }}</a></li>
    {{ end }}
{{ end }}
</ul>
```

**isset**，检查是否设置了某个参数：

```go
{{ if isset .Params "project_url" }} 
    {{ index .Params "project_url" }}
{{ end }}
```

**seq**，创建一个整数数列，创建规则：

- 3 => 1, 2, 3
- 1 2 4 => 1, 3
- -3 => -1, -2, -3
- 1 4 => 1, 2, 3, 4
- 1 -2 => 1, 0, -1, -2

**sort**，对 map、数组等进行排序：

```go
// Front matter
+++
tags: [ "tag3", "tag1", "tag2" ]
+++

// Site config
+++
[params.authors]
  [params.authors.Derek]
    "firstName"  = "Derek"
    "lastName"   = "Perkins"
  [params.authors.Joe]
    "firstName"  = "Joe"
    "lastName"   = "Bergevin"
  [params.authors.Tanner]
    "firstName"  = "Tanner"
    "lastName"   = "Linsley"
+++

// Use default sort options - sort by key / ascending
Tags: {{ range sort .Params.tags }}{{ . }} {{ end }}

// Outputs Tags: tag1 tag2 tag3

// Sort by value / descending
Tags: {{ range sort .Params.tags "value" "desc" }}{{ . }} {{ end }}

// Outputs Tags: tag3 tag2 tag1

// Use default sort options - sort by value / descending
Authors: {{ range sort .Site.Params.authors }}{{ .firstName }} {{ end }}

// Outputs Authors: Derek Joe Tanner

// Use default sort options - sort by value / descending
Authors: {{ range sort .Site.Params.authors "lastName" "desc" }}{{ .lastName }} {{ end }}

// Outputs Authors: Perkins Linsley Bergevin
```

**where**，过滤数组，筛选符合条件的元素生成新数组：

```go
{{ range where .Data.Pages "Section" "post" }}
   {{ .Content }}
{{ end }}

// 第二个参数可以使用 . 引用嵌套元素
+++
series: golang
+++

{{ range where .Site.Pages "Params.series" "golang" }}
   {{ .Content }}
{{ end }}

// 还可以使用比较元素符
{{ range where .Data.Pages "Section" "!=" "post" }}
   {{ .Content }}
{{ end }}
```

可用的比较运算符包括：= / == / eq, != / <> / ne, >= / ge， > / gt, < / lt, in, not in, intersect。

```go
{{ range where .Site.Pages ".Params.tags" "intersect" .Params.tags }}
  {{ if ne .Permalink $.Permalink }}
    {{ .Render "summary" }}
  {{ end }}
{{ end }}

{{ range first 5 (where .Data.Pages "Section" "post") }}
   {{ .Content }}
{{ end }}
```

此外，你还可以使用 `nil` 表示空：

```go
{{ range where .Data.Pages ".Params.specialpost" "!=" nil }}
   {{ .Content }}
{{ end }}
```

**readDir**，根据相对路径获取当前目录数据：

```go
{{ range (readDir ".") }}
    {{ .Name }}
{{ end }}
```

**readFile**，读取文件并将其内容转换为字符串：

```go
{{readFile "README.txt"}}
```

和数学运算有关的函数：

- add, 求和
- div，求商
- mod，取余
- modBol，如果余数为 0，则返回 true，否则返回 false
- mul，求积
- sub，求差

**int**，将字符串转换为整数：`{{ int "123" }}`。

**printf**，格式化输出：`{{ i18n ( printf "combined_%s" $var ) }}`。

**chomp**，去除尾部多余的空行：`{{chomp "<p>Blockhead</p>\n"}}` => `<p>Blockhead</p>`。

**dateFormat**，格式化日期：

```go
{{ dateFormat "Monday, Jan 2, 2006" "2015-01-21" }}
// => Wednesday, Jan 21, 2015
```

**emojify**，处理 Emoji 表情，避免被 Go 模版引擎过滤掉：

```go
{{ "I :heart: Hugo" | emojify }}
```

**highlight**，对一段代码进行语法高亮处理。

**htmlEscape**，对特殊字符进行转义，除非内容经过 `safeHTML` 函数处理，否则都会被模版引擎转义：

```go
{{ htmlEscape "Hugo & Caddy > Wordpress & Apache" }} 
// => "Hugo &amp; Caddy &gt; Wordpress &amp; Apache"
```

**htmlUnescape**，与 `htmlEscape` 功能相反。

**humanize**，返回人类可读的格式：

```go
{{humanize "my-first-post"}} 
// => "My first post"
{{humanize "myCamelPost"}} 
// => "My camel post"
{{humanize "52"}} 
// => "52nd"
{{humanize 103}} 
// => "103rd"
```

**lower**，转换为小写形式的字符串。

**markdownify**，使用 Markdown 处理器解析字符串，结果会被认为是安全的，不会被模版引擎过滤掉：

```go
{{ .Title | markdownify }}
```

**pluralize**，去除 HTML 标签：

```go
{{ "<b>BatMan</b>" | plainify }}
// =>  “BatMan”
```

**pluralize**，复数化：

```go
{{ "cat" | pluralize }} 
// => “cats”
```

**findRE**，返回匹配正则的数组，可以用来创建 TOC：

```go
{{ $headers := findRE "<h2.*?>(.|\n)*?</h2>" .Content }}

{{ if ge (len $headers) 1 }}
    <ul>
    {{ range $headers }}
        <li>
            <a href="#{{ . | plainify | urlize }}">
                {{ . | plainify }}
            </a>
        </li>
    {{ end }}
    </ul>
{{ end }}
```

**replace**，替换：

```go
{{ replace "Batman and Robin" "Robin" "Catwoman" }}
// => “Batman and Catwoman”
```

**replaceRE**，正则替换：

```go
{{ replaceRE "^https?://([^/]+).*" "$1" "http://gohugo.io/docs" }}
// => gohugo.io

{{ "http://gohugo.io/docs" | replaceRE "^https?://([^/]+).*" "$1" }}
// => gohugo.io
```

**safeHTML**，保证字符串为安全的 HTML 片段，避免被模版引擎过滤掉：

```go
{{ $copyright := "© 2015 Jane Doe" }}
{{ .Site.Copyright | safeHTML }}
```

**saftHTMLAttr**，保证属性是安全的字符串，不会被模版引擎过滤掉：

```go
[[menu.main]]
    name = "IRC: #golang at freenode"
    url = "irc://irc.freenode.net/#golang"

<a href="{{ .URL }}">
// => <a href="#ZgotmplZ">

<a {{ printf "href=%q" .URL | safeHTMLAttr }}>
// => <a href="irc://irc.freenode.net/#golang">
```

**safeCSS**，保证 CSS 代码是安全的，不会被模版引擎过滤掉：

```go
<p style="{{ .Params.style | safeCSS }}">…</p>
// => <p style="color: red;">…</p>

<p style="{{ .Params.style }}">…</p>
// => <p style="ZgotmplZ">…</p>
```

**safeJS**，保证 JS 代码是安全的，避免被模版引擎过滤掉：

```go
<script>var form_{{ .Params.hash | safeJS }};…</script>
// => <script>var form_619c16f;…</script>

<script>var form_{{ .Params.hash }};…</script>
// => <script>var form_"619c16f";…</script>
```

**singularize**，单数化：

```go
{{ "cats" | singularize }}
// => "cat"
```

**slicestr**，第一个参数指定起始位置，第二个参数指定结束位置，切分字符串：

```go
{{slicestr "BatMan" 3}} 
// => “Man”
{{slicestr "BatMan" 0 3}} 
// => “Bat”
```

**split**，讲数组转换为字符串：

```go
{{split "tag1,tag2,tag3" "," }}
// =>  [“tag1” “tag2” “tag3”]
```

**string**，字符串化：

```go
{{ string "BatMan" }}
// => "BatMan"
```

**substr**，第一个参数是起始位置，第二个参数是切分长度，用于切分字符串：

```go
{{substr "BatMan" 3 3}}
// => "Man"
```

**hasPrefix**，判断是否有前缀：

```go
{{ hasPrefix "Hugo" "Hu" }} 
// => true
```

**title**，将字符串标题化：

```go
{{title "BatMan"}} 
// => “Batman”
```

**trim**，去除字符串头部或尾部的某些字符：

```go
{{ trim "++Batman--" "+-" }}
// =>  “Batman”
```

**upper**，转换为大写：

```go
{{upper "BatMan"}}
// => “BATMAN”
```

**countwords**，计算字符数量：

```go
{{ "Hugo is a static site generator." | countwords }}
// outputs a content length of 6 words. 
```

**countrunes**，计算字符数量，对中日韩语言友好：

```go
{{ "Hello, 世界" | countrunes }}
// => outputs a content length of 8 runes.
```

**md5 / sha1 / sha256**，加密：

```go
{{ md5 "Hello world, gophers!" }}
// => "b3029f756f98f79e7f1b7f1d1f0dd53b"

{{ sha1 "Hello world, gophers!" }}
// => "c8b5b0e33d408246e30f53e32b8f7627a7a649d4"

{{ sha256 "Hello world, gophers!" }}
// => "6ec43b78da9669f50e4e422575c54bf87536954ccd58280219c393f2ce352b46"
```

**i18n**，国际化。

**time**，格式化时间：

- {{ time "2016-05-28" }} → “2016-05-28T00:00:00Z”
- {{ (time "2016-05-28").YearDay }} → 149
- {{ mul 1000 (time "2016-05-28T10:30:00.00+10:00").Unix }} → 1464395400000 (Unix time in milliseconds)

**absLangURL, relLangRUL**，获取绝对路径和相对路径，该方法和 `absURL, relURL` 相似，但是能够正确添加语言链接：

```go
{{ "blog/" | absLangURL }}
// => “http://mysite.com/hugo/en/blog/"

{{ "blog/" | relLangURL }}
// => “/hugo/en/blog/”
```

**ref, relref**，获取绝对路径或相对路径：

```go
{{ ref . “about.md” }}
```

**safeURL**，保证地址是安全：

```go
[[menu.main]]
    name = "IRC: #golang at freenode"
    url = "irc://irc.freenode.net/#golang"

<ul class="sidebar-menu">
  {{ range .Site.Menus.main }}
  <li><a href="{{ .URL }}">{{ .Name }}</a></li>
  {{ end }}
</ul>
// => <li><a href="#ZgotmplZ">IRC: #golang at freenode</a></li>

// fix it
<li><a href="{{ .URL | safeURL }}">{{ .Name }}</a></li>
```

**urlize**，讲字符串转换为链接，字符串中的空格会被转换为 `-`：

```go
<a href="/tags/{{ . | urlize }}">{{ . }}</a>
```

**querify**，创建查询字符串：

```go
<a href="https://www.google.com?{{ (querify "q" "test" "page" 3) | safeURL }}">Search</a>
// => <a href="https://www.google.com?page=3&q=test">Search</a>
```

**render**，引用模版渲染模块。

**apply**，第一个参数待操作的数据，第二个参数是操作数据的函数，第三个参数是遍历元素：

```go
+++
names: [ "Derek Perkins", "Joe Bergevin", "Tanner Linsley" ]
+++

{{ apply .Params.names "urlize" "." }} 
// => [ "derek-perkins", "joe-bergevin", "tanner-linsley" ]

// 等同于
{{ range .Params.names }}
    {{ . | urlize }}
{{ end }}
```

**base64Encode, base64Decode**：

```go
{{ "Hello world" | base64Encode }}
// => "SGVsbG8gd29ybGQ="

{{ "SGVsbG8gd29ybGQ=" | base64Decode }}
// => "Hello world"
```

**.Site.GetPage**，获取 index 页面：

```go
{{ with .Site.GetPage "section" "blog" }}
    {{ .Title }}
{{ end }}
```

## 变量

**Page 变量**

- `.Content`，页面内容
- `.Data`，
- `.Date`，
- `.Description`，

**Site 变量**

通过 `.Site` 获取以下变量：

- `.Site.BaseURL`，
- `.Site.RSSLink`，
- `.Site.Taxonomies`，
- `.Site.Pages`，
- `.Site.AllPages`，
- `.Site.Params`，
- `.Site.Sections`，
- `.Site.Files`，
- `.Site.Menus`，
- `.Site.Tile`，
- `.Site.Author`，
- `.Site.LanguageCode`，
- `.Site.DisqusShortname`，
- `.Site.GoogleAnalytics`，
- `.Site.Copyright`，
- `.Site.Permalinks`，
- `.Site.BuildDrafts`，
- `.Site.Data`，
- `.Site.IsMultiLingual`，
- `.Site.Language`，
- `.Site.Language.Lang`，
- `.Site.Language.Weight`，
- `.Site.LanguagePrefix`，
- `.Site.Languages`，
- `.Site.RegularPages`，

**File 变量**

`.File` 变量为你提供了有关页面的额外信息：

- `.File.Path`，文章的原始路径，比如 `content/posts/foo.en.md`
- `.File.LogicalName`，文章名称，比如 `foo.en.md`
- `.File.TranslationBaseName`，不包括扩展名和语言名称的文件名，比如 `foo`
- `.File.Ext, .File.Extension`，文章的扩展名，比如 `md`
- `.File.Lang`，文章的语言类型，比如 `en`
- `.File.Dir`，文章所处的目录，比如 `content/posts/dir1/dir2/`











































































































































