# CSS 选择器优先级可视化工具

一个帮助理解和可视化 CSS 选择器优先级的工具。

## 项目背景
我在面试中遇到过几次关于CSS选择器优先级的问题，感觉自己答得不是很熟练，所以想做一个这样的工具，帮助自己更好地理解CSS选择器优先级。

同时我也想用这个项目来练习一下网格布局，所以就做了这个项目。

## 功能特性

### 1. 选择器解析
- ✅ 支持基本选择器（元素、类、ID）
- ✅ 支持组合选择器
- ✅ 支持伪类选择器
- ✅ 支持属性选择器
- [] 实时优先级计算

### 2. 可视化展示
- ✅ 堆叠柱状图展示不同类型选择器的权重
- ✅ 交互式tooltip显示具体权重值
- ✅ 支持多选择器对比
- ✅ 高DPI屏幕适配
- [] 响应式布局

### 3. 布局演示
- ✅ Grid布局
- ✅ Flex布局
- ✅ Float布局
- ✅ 动态添加选择器

### 4. 性能优化
- ✅ 事件节流优化
- ✅ Canvas性能优化
- ✅ 响应式重绘

## 最近更新
### 2025-02-19
- 优化了tooltip的实现，使用HTML覆盖层替代Canvas绘制
- 添加了事件节流机制，提升性能和用户体验
- 改进了柱状图的间距计算
- 优化了高DPI屏幕下的显示效果

### 2025-02-18
- 初始化项目，确定项目结构

## 待办事项

- [ ] 添加更多选择器类型支持
- [ ] 优化移动端体验
- [ ] 添加动画效果
- [ ] 支持主题切换
- [ ] 添加更多可视化方式

## 使用方法

1. 克隆仓库
```bash
git clone [repository-url]
```

2. 安装依赖
```bash
npm install
```

3. 运行项目
```bash
npm start
```

## 技术栈

- HTML5 Canvas
- CSS Grid/Flex
- JavaScript
- 正则表达式

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可

MIT
