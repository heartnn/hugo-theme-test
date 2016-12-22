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

Hugo 项目的配置文件位于项目根目录下的 `config.toml` 文件中，
































