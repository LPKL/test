# 重构后目录说明

```c#
|-- CSS-AI-FrontEnd //前端代码根目录
    |-- .babelrc //babel配置
    |-- .editorconfig //IDE编辑样式配置，需插件如EditorConfig for VS Code
    |-- .eslintignore //无需eslint检测的文件
    |-- .eslintrc.js //eslint配置
    |-- .gitignore //git提交忽略文件
    |-- .postcssrc.js //postcss配置，如自动补全前缀，px2rem等
    |-- favicon.ico //HtmlWebpackPlugin使用的浏览器小图标
    |-- index.html //主页模板
    |-- jest.config.js //jest单元测试配置文件
    |-- package-lock.json //npm安装时自动生成的文件，记录了包的依赖关系
    |-- package.json //安装的node_modules记录，重新安装时读取
    |-- README.md //项目说明文档（本文档）
    |-- yarn.lock //yarn安装npm包依赖，类似于npm安装使用的package-lock.json
    |-- build //构建配置文件目录
    |   |-- build.js //node调用的打包入口
    |   |-- check-versions.js //npm包版本验证工具，针对的是package.json
    |   |-- logo.png //vue的官方logo
    |   |-- utils.js //被webpack配置文件引用的独立工具类，包含cssloader配置
    |   |-- vue-loader.conf.js //vue-loader配置项，被webpack.base.conf调用
    |   |-- webpack.base.conf.js //开发，生产等环境的公共webpack配置
    |   |-- webpack.dev.conf.js //开发环境的webpack配置
    |   |-- webpack.prod.conf.js //生产环境的webpack配置
    |-- config
    |   |-- dev.env.js //开发环境配置参数，npm run dev调用
    |   |-- index.js //定义开发环境和生产环境中所需要的参数，端口，打包路径等
    |   |-- package.env.js // 自定义生产环境参数配置（新） npm run build调用
    |   |-- prod.env.js //默认生产环境参数配置
    |   |-- sit.env.js //自定义生产环境参数配置（旧）
    |-- dist
    |   |-- favicon.ico //地址栏图标，中软logo
    |   |-- index.html //发布后，优化压缩过的主页
    |   |-- static //copy-静态资源目录，对应assetsSubDirectory
    |       |-- config //copy-全局配置目录
    |       |   |-- config.js //copy-业务配置
    |       |-- css //MiniCssExtractPlugin生成的chunkfile
    |       |-- font //copy-全局字体，目前存储的是思源体
    |       |-- fonts //url-loader生成的字体文件包括element-icons和思源体
    |       |-- images //copy-静态图片资源
    |       |-- img //未经base64转码的的大于8kb的图片文件（url-loader设置1w）
    |       |-- js // webpack打包生成的 javascript chunk files
    |       |-- tinymce //copy-tinymce编辑器插件
    |-- src
    |   |-- App.vue //入口main.js vue实例绑定的根组件
    |   |-- errorLog.js //
    |   |-- main.js //webpack打包入口文件
    |   |-- permission.js //权限管理
    |   |-- api //后端请求接口目录
    |   |   |-- algorithm //算法模块
    |   |   |   |-- atlas.js //atlas请求api
    |   |   |   |-- index.js //算法管理api
    |   |   |-- datamining //历史、实时与周期数据与流监测
    |   |   |   |-- historydata.js //历史数据api
    |   |   |   |-- model.js //模型管理api
    |   |   |   |-- realtime.js //实时管理api
    |   |   |   |-- period //周期管理
    |   |   |       |-- periodDataUrl.js //周期数据api
    |   |   |       |-- periodListUrl.js //周期流api
    |   |   |       |-- periodMonitor.js //周期监测api
    |   |   |-- device //设备模块
    |   |   |   |-- alarm.js //告警规则api
    |   |   |   |-- fault.js //故障管理api
    |   |   |   |-- index.js //设备管理api
    |   |   |   |-- taskmonitor.js //任务管理api
    |   |   |-- experiment //数据实验模块
    |   |   |   |-- index.js //数据实验api(目前混杂数据源、实时流管理api)
    |   |   |   |-- process.js //流程处理
    |   |   |-- message //消息模块
    |   |   |   |-- index.js //消息管理api
    |   |   |   |-- messageCenter.js //消息中心api
    |   |   |   |-- socket.js //web socket相关
    |   |   |-- report //报告模块
    |   |   |   |-- faultreport.js //故障报告api
    |   |   |   |-- runreport.js //运行报告api
    |   |   |   |-- template.js //报告模板api
    |   |   |-- system //系统管理
    |   |       |-- auth.js //身份验证api
    |   |       |-- login.js //登录api
    |   |       |-- perm.js //权限api
    |   |       |-- role.js //角色api
    |   |       |-- user.js //用户api
    |   |-- assets //资源
    |   |   |-- icons //svg图标
    |   |   |-- images //常规图片
    |   |   |   |-- error //401,404图片
    |   |   |   |-- index //主页用到的图片
    |   |   |-- styles //自定义样式文件（原先在src下）
    |   |   |-- third-party //第三方资源
    |   |       |-- al_font_icon //阿里字体图标
    |   |       |-- iconFolder //其他iconfont字体图标
    |   |-- components //组件
    |   |   |-- Breadcrumb //面包屑
    |   |   |   |-- index.vue
    |   |   |-- Charts //图表
    |   |   |   |-- ArimaChart.vue //时序预测图(line)、自相关和偏自相关图(bar)
    |   |   |   |-- BaseCharts.vue //基础图表组件 基于v-charts
    |   |   |   |-- BoxPlot.vue //箱形图
    |   |   |   |-- EffectScatter.vue //异常散点图
    |   |   |   |-- Heatmap.vue //热力图
    |   |   |   |-- MultipleScatterPlot.vue //多图显示(默认散点图) 轴心轨迹和频谱图
    |   |   |   |-- NetChart.vue //神经网络图
    |   |   |   |-- Scatter3DChart.vue //3D散点图
    |   |   |   |-- TimeSelect.vue //数据探查轴心轨迹和频谱图下方时间轴
    |   |   |   |-- treeChartOne.vue //决策树
    |   |   |   |-- mixins //图表混入方法
    |   |   |       |-- resize.js //resize事件处理
    |   |   |-- CustomTinymce //图表
    |   |   |   |-- langs //语言包
    |   |   |   |   |-- zh_CN.js
    |   |   |   |   |-- en_US.js
    |   |   |   |-- plugins //自定义tinymce插件
    |   |   |   |   |-- chartTools //结合insertSpecialChart使用，图形的配置
    |   |   |   |   |-- insertDatetime //当前时间
    |   |   |   |   |-- insertErrorDatetime //故障发生时间
    |   |   |   |   |-- insertFaultVariable //故障基本信息
    |   |   |   |   |-- insertModelDataVariable //模型参数属性
    |   |   |   |   |-- insertModifiableText //可变文本：发布后可修改区域
    |   |   |   |   |-- insertModifiableTextFaultAnalysis //故障诊断：发布后可修改故障诊断结果区域
    |   |   |   |   |-- insertOriginDataVariable //元数据属性：中文名称/国标/厂标等参数
    |   |   |   |   |-- insertSpecialChart //可视化图形：echart
    |   |   |   |   |-- insertSpecialTable //特定表格：个性化阈值、发电量等
    |   |   |   |   |-- insertTable //普通表格
    |   |   |   |   |-- insertTemplate //模板复用，插入已存在的模板内容
    |   |   |   |   |-- saveEditor //自动保存
    |   |   |   |   |-- uploadImage //上传本地图片
    |   |   |-- JsonEditor //Json编辑器
    |   |   |-- LangSelect //语言选择组件
    |   |   |-- ModelFlow //数据流（实验组件）
    |   |   |   |-- dataexplorer.vue //探查组件
    |   |   |   |-- index.vue //实验主页
    |   |   |   |-- Page.vue //实验页面 index使用
    |   |   |   |-- components //组件
    |   |   |   |-- mixin //混入
    |   |   |   |   |-- chartcommon.js //探查公共方法
    |   |   |   |   |-- flowcommon.js //实验公共方法
    |   |   |   |-- resoult //jsplumb实验工作流组件
    |   |   |-- SvgIcon //svg图标组件
    |   |   |-- Table //通用表格组件
    |   |   |   |-- BaseElTable.vue //el-table组件
    |   |   |   |-- DialogPreviewTable.vue //数据预览弹窗组件
    |   |   |   |-- LogPreviewList.vue //流程节点日志输出组件
    |   |   |   |-- MatrixView.vue //矩阵图表(比如：混淆矩阵,协防差矩阵,皮尔森系数矩阵等使用)
    |   |   |   |-- ObjectView.vue //static_table 统计表
    |   |   |   |-- PreviewKvTable.vue //实验中使用的数据预览组件
    |   |   |   |-- PreviewTable.vue //历史数据预览组件
    |   |   |-- Tinymce //富文本编辑器组件（报告模板使用）
    |   |   |-- Transfer //复合选框（穿梭框）组件
    |   |-- directive //vue指令
    |   |   |-- btnperm //功能按钮权限
    |   |   |-- el-dragDialog //可拖拽缩放对话框
    |   |   |-- waves //水波纹指令（未使用）
    |   |-- filters //vue过滤器
    |   |-- lang //多语言
    |   |   |-- en.js //英文
    |   |   |-- index.js //调用入口
    |   |   |-- zh.js //中文
    |   |-- mock //模拟数据生成器
    |   |-- router //路由
    |   |   |-- index.js //被main.js引用的路由入口js
    |   |   |-- modules //按模块划分的路由配置
    |   |       |-- alarm.js //告警
    |   |       |-- algorithm.js //算法
    |   |       |-- device.js //设备
    |   |       |-- datamining.js //包括历史数据管理流程管理等
    |   |       |-- realTime.js //实时
    |   |       |-- report.js //报告
    |   |       |-- task.js //任务监控
    |   |       |-- system.js //系统管理，包括用户管理
    |   |       |-- experiment.js //数据实验
    |   |       |-- message.js //消息管理    
    |   |-- store //数据状态仓库
    |   |   |-- btndata2.json //目前被store\modules\permission.js使用
    |   |   |-- getters.js //数据状态的getters
    |   |   |-- index.js //被main.js引用的store入口js
    |   |   |-- modules //模块划分
    |   |       |-- app.js //主应用
    |   |       |-- errorLog.js //错误日志
    |   |       |-- etl.js //etl（未使用）
    |   |       |-- mflow.js //实时流、实验
    |   |       |-- permission.js //权限
    |   |       |-- tagsView.js //平台切换
    |   |       |-- user.js //用户
    |   |       |-- ws.js //websocket
    |   |-- utils //工具类
    |   |   |-- actions.js //删除确认提示
    |   |   |-- auth.js //身份验证（token操作）
    |   |   |-- baseUrl.js //请求根URL，包括atlasUrl\baseSwUrl\base_url
    |   |   |-- clipboard.js //剪贴板
    |   |   |-- constants.js //权限类型等下拉项
    |   |   |-- dateformat.js //日期时间工具类
    |   |   |-- htmlToJson.js //报告模板使用的html转换为特定格式json
    |   |   |-- htmlToPdf.js //页面导出pdf
    |   |   |-- i18n.js //转换router标题, 在breadcrumb sidebar tagsview使用
    |   |   |-- index.js //调用入口
    |   |   |-- openWindow.js //打开浏览器新窗口
    |   |   |-- permission.js //权限校验
    |   |   |-- request.js //axios请求封装
    |   |   |-- rules.js //基础验证,特殊验证除外
    |   |   |-- validate.js //校验具体方法，被rules.js调用
    |   |   |-- ws4redis.js //websocket类(计划废弃)
    |   |   |-- vendor //第三方
    |   |       |-- Blob.js //文件流处理
    |   |       |-- Export2Excel.js //导出excel
    |   |       |-- Export2Zip.js //压缩
    |   |-- views //视图
    |       |-- algorithm //算法
    |       |-- datamining //历史数据、实时周期流、模型管理
    |       |   |-- dataflow //数据流程
    |       |   |-- historydata //历史数据
    |       |   |-- modelmanagement //模型管理
    |       |   |-- realtmonitor //实时周期流监测
    |       |-- device //设备管理
    |       |   |-- alarm //告警规则设置
    |       |   |-- devicemanage //设备管理
    |       |   |-- faultmanagement //故障管理
    |       |   |-- taskmonitoring //任务监控
    |       |-- experiment //数据实验
    |       |-- index //主页
    |       |-- layout_m //布局
    |       |   |-- Layout_m.vue //开发、运行公共布局
    |       |   |-- Layout_user.vue //用户信息使用布局
    |       |   |-- components
    |       |   |-- menu //菜单
    |       |       |-- backplatform.vue //后台管理（用户管理）
    |       |       |-- devplatform.vue //开发平台
    |       |       |-- runplatform.vue //运行平台
    |       |-- message //消息
    |       |   |-- index.vue //消息管理页面
    |       |   |-- list.vue //故障列表
    |       |   |-- components //组件
    |       |   |-- messageCenter //消息中心页面
    |       |-- report //报告
    |       |   |-- components
    |       |   |   |-- editorCommonMethod.js //编辑器相关的公共方法
    |       |   |   |-- inlineBlock.vue //json转html，内层
    |       |   |   |-- showChart.vue //json转html, 动态获取数据绘制图形
    |       |   |   |-- showCommonBlock.vue //json转html，外层
    |       |   |   |-- showFixedColumnTable.vue //json转html, 动态获取数据填充特定表格
    |       |   |   |-- showModifiableText.vue //json转html, 可变文本类型的处理
    |       |   |   |-- showTable.vue //json转html,普通表格绘制，多层嵌套实现
    |       |   |-- runreport //运行报告
    |       |   |   |-- index.vue // 运行报告主页
    |       |   |   |-- view.vue //运行报告查看界面
    |       |   |   |-- components 
    |       |   |       |-- Operations.vue //操作栏
    |       |   |-- templateConfig //报告模板
    |       |       |-- editor.vue //编辑器
    |       |       |-- index.vue //报告模板主页
    |       |       |-- view.vue //故障报告查看界面
    |       |       |-- components //组件
    |       |           |-- chartSetupSchema.json //各个特殊图的构造结构
    |       |           |-- chartSetupSchema.json //各个特殊表的构造结构
    |       |           |-- tinymceInit.vue //tinymce初始化的vue组件
    |       |-- _system //系统
    |           |-- errorPage //错误页
    |           |-- login //登录
    |           |-- perm //权限
    |           |-- role //角色
    |           |-- user //用户
    |               |-- index.vue //用户列表
    |               |-- person //个人用户
    |                   |-- changePsd.vue //修改密码
    |                   |-- index.vue //个人用户信息
    |                   |-- register //注册
    |-- static //静态资源
    |   |-- config
    |   |   |-- config.js //包含api、socket、atlas地址配置，及其他业务配置
    |   |-- font //字体
    |   |-- images //图片
    |   |   |-- icon
    |   |   |-- template
    |   |-- tinymce
    |-- tests //测试目录
        |-- unit //单元测试
            |-- .eslintrc.js
            |-- coverage //覆盖率报告
            |-- specs
                |-- utils //被测试模块对应目录
                    |-- auth.spec.js //测试套件，内含执行用例
                    |-- index.spec.js //..
                    |-- validate.spec.js //..

```