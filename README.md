安装：brew update && brew install hugo

创建博客：hugo new site blog

博客结构：

- archetypes: 文章模版
- config.toml: 博客的配置文件 
- content: 存放博客文章的目录
- data: 
- layouts: 网站模版
- static: 静态资源

新建文章（默认为草稿）：hugo new post/good-to-great.md

启动服务器：hugo server --buildDrafts --theme="theme-name"
服务器默认端口：http://localhost:1313
(最好在配置文件中指定)

发布文章：hugo undraft '<file-name>'

生成站点：rm -rf ./pulic && hugo
（生成之前应该先删除之前编译的资源）

发布站点：git add . && git commit -m "xxxx" && git push origin master

创建主题：hugo new theme 

展示编译的详细信息：hugo --verbose / hugo server --verbose



