
hdfront-vue是vue-cli构建的前端系统，具体项目目录结构及说明如下： 

```c++
hdfront-vue 
├── README.md
├── README.zh-CN.md
├── build //构建信息相关
    ├── build.js
    ├── check-versions.js
    ├── logo.png
    ├── utils.js
    ├── vue-loader.conf.js
    ├── webpack.base.conf.js //开发，生产等环境的公共webpack配置(在entry入口代码中有app: './src/main.js’,即为界面的入口处)
    ├── webpack.dev.conf.js
    ├── webpack.prod.conf.js
├── config //配置相关目录
    ├── dev.env.js //vue-cli自带开发环境配置参数（可配置开发时使用的base-api）
    ├── index.js //定义开发环境和生产环境中所需要的参数，端口，打包路径等
    ├── prod.env.js //vue-cli自带生产环境参数配置
    ├── sit.env.js //自定义生产环境参数配置
├── favicon.ico //favicon图标
├── index.html //入口界面
├── package-lock.json //package.json变化时自动生成
├── package.json //项目描述文件，是npm操作的入口文件，每个使用npm管理的项目都有这个文件, 定义了项目所需要的各种模块，以及项目的配置信息(如名称，版本，许可证等元数据)
├── src //项目源码目录，项目所有功能实现代码都在此文件夹内
    ├── App.vue //入口页面，是模板组件，项目的所有其他组件都是在这个组件上运行
    ├── api //*与服务器端交互的所有请求
    ├── assets //资源文件夹，放图片，主题，字体之类的静态资源
    ├── components //放的都是全局公用组件，除了一些封装好的第三方，也可以将一些可以复用的功能自定义成组件。（页面级别下定制程度高的组件，需要放在各自views文件下，如在views/process模块下新建components文件夹，将该功能模块需要的组件放置在其下。）
    ├── directive //全局指令
    ├── errorLog.js
    ├── filters //全局filter
    ├── icons //项目所有svg icons
    ├── lang //国际化，中英文
    ├── main.js //webpack入口文件，加载组件，初始化
    ├── mock //模拟数据
    ├── permission.js //权限管理
    ├── router //*路由文件夹，决定页面跳转规则
    ├── store //状态管理目录(vuex)，对于登录token，用户信息，权限信息，一些全局个人偏好设置等可以用vuex进行统一管理
    ├── styles //全局样式
    ├── utils //全局公共方法
    ├── vendor //第三方库
    ├── views //*实现系统功能界面，采用组件方式，包括功能目录组件，各个主功能及其子功能组件
├── static //静态文件目录，存储的静态资源为第三方不打包资源
    ├── tinymce4.7.5
├── node_modules //依赖的node工具包 ，按照package.json文件中依赖的模块安装(初始git下载项目后，是没有node_modules文件夹的，因该文件夹内容较多，一般放在gitignore里，不跟踪。进入项目根目录，执行npm install（安装所有模块，若安装具体模块在install后面输入模块名）, 自动将package.json中的模块安装到node_modules文件夹下)
    ├──。。。
├── .babelrc //babel配置文件，用来将es6代码转换成浏览器能够识别的代码
├── .eslintrc.js // 代码规范管理，eslint语法检查配置
├── .eslintignore.js // eslint语法忽略检查配置
├── .gitignore // git不追踪配置，一般node_modules在其中
├── .postcssrc.js // PostCSS配置
```
