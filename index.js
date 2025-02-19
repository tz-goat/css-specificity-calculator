// 定义正则表达式的常量部分
const REG_PARTS = {
    LETTER: '[a-zA-Z]',
    WORD: '[a-zA-Z0-9]',
    WORD_WITH_DASH: '[a-zA-Z0-9-]',
    WORD_WITH_DASH_UNDERSCORE: '[a-zA-Z0-9-_]',
    PSEUDO_CLASS: ':[a-zA-Z-]+(\\([^)]+\\))?',
    ATTRIBUTE: '\\[[^\\]]+\\]'
};

/**
 * 动画帧率相关常量
 * FRAME_TIME: 基于60fps计算的每帧时间（1000ms / 60fps ≈ 16.67ms）
 * 用于限制鼠标移动事件的触发频率，确保平滑的动画效果
 */
const FRAME_TIME = 16;

function parseCSSSpecificity(cssText) {
    const specificity = {
        a: 0, // ID选择器
        b: 0, // 类选择器
        c: 0  // 元素选择器
    };
    
    // 使用常量构建选择器正则表达式
    const selectorRegex = new RegExp(
        '^(' +
            // 纯元素选择器
            `${REG_PARTS.LETTER}${REG_PARTS.WORD_WITH_DASH}*|` +
            // 元素选择器加类/ID选择器
            `${REG_PARTS.LETTER}${REG_PARTS.WORD_WITH_DASH}*(?:[.#]${REG_PARTS.LETTER}${REG_PARTS.WORD_WITH_DASH_UNDERSCORE}*)+|` +
            // 纯类/ID选择器
            `[.#]${REG_PARTS.LETTER}${REG_PARTS.WORD_WITH_DASH_UNDERSCORE}*` +
        ')' +
        // 组合选择器部分
        `(?:\\s*[>+~]?\\s*(?:${REG_PARTS.LETTER}${REG_PARTS.WORD_WITH_DASH}*|[.#]${REG_PARTS.LETTER}${REG_PARTS.WORD_WITH_DASH_UNDERSCORE}*)+)*$`
    );

    console.log('check', selectorRegex.test(cssText));
    if (!selectorRegex.test(cssText)) {
        if(typeof alert === 'function') {
            alert('选择器格式不合法');
        }
        return;
    }
    // 2.解析选择器,根据其类别分析它的权重
    // 分割所有组合方式，根据组合符号[>+~]进行分割
    const selectorParts = cssText.split(/\s*[>+~]\s*|\s+/); 
    console.log({selectorParts});
    for(const part of selectorParts) {
        // 计算ID选择器 (#)
        const idCount = (part.match(/#[a-zA-Z][a-zA-Z0-9-_]*/g) || []).length;
        specificity.a += idCount;
        
        // 计算类选择器 (.)
        const classCount = (part.match(/\.[a-zA-Z][a-zA-Z0-9-_]*/g) || []).length;
        specificity.b += classCount;
        
        // 计算元素选择器
        if (/^[a-zA-Z][a-zA-Z0-9-]*/.test(part)) {
            specificity.c += 1;
        }

        // 添加伪类选择器的权重计算
        const pseudoCount = (part.match(new RegExp(REG_PARTS.PSEUDO_CLASS, 'g')) || []).length;
        specificity.b += pseudoCount;

        // 添加属性选择器的权重计算
        const attrCount = (part.match(new RegExp(REG_PARTS.ATTRIBUTE, 'g')) || []).length;
        specificity.b += attrCount;
    }
    
    return specificity;
}

// 添加可视化展示结果的函数
function displaySpecificity(specificityList) {
    const canvas = document.getElementById('priority-canvas');
    const ctx = canvas.getContext('2d');
    
    // 获取设备像素比
    const dpr = window.devicePixelRatio || 1;
    
    // 获取父容器的宽度，而不是canvas当前的宽度
    const parentWidth = canvas.parentElement.getBoundingClientRect().width;
    
    // 首先计算需要的高度
    const lineHeight = 30;
    const totalHeight = Math.max(300, lineHeight * (specificityList.length + 1));
    
    // 设置canvas的显示尺寸（CSS像素）
    canvas.style.width = parentWidth + 'px';
    canvas.style.height = totalHeight + 'px';
    
    // 设置canvas的实际尺寸（物理像素）
    canvas.width = parentWidth * dpr;
    canvas.height = totalHeight * dpr;
    
    // 缩放绘图上下文以匹配设备像素比
    ctx.scale(dpr, dpr);
    
    // 清空画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 设置文本样式
    ctx.font = '20px Arial';
    ctx.fillStyle = 'black';
    ctx.textBaseline = 'middle';
    
    let currentY = lineHeight;
    
    // 遍历所有选择器及其权重
    for(const cssText of specificityList) {
        ctx.fillText(
            `${cssText}`, 
            10, 
            currentY
        );
        currentY += lineHeight;
    }
}

// 在drawComparison函数外部添加全局变量存储柱状图位置信息
let barPositions = [];

function drawComparison(selectors) {
    /**
     * 1. 画布初始化设置
     * 设置画布尺寸和设备像素比，确保在高DPI设备上清晰显示
     */
    const canvas = document.getElementById('priority-canvas');
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    const parentWidth = canvas.parentElement.getBoundingClientRect().width;
    canvas.style.width = parentWidth + 'px';
    canvas.style.height = '400px';
    canvas.width = parentWidth * dpr;
    canvas.height = 400 * dpr;
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    /**
     * 2. 图表布局定义
     * 设置图表的边距和实际绘图区域
     */
    const margin = { top: 40, right: 20, bottom: 40, left: 40 };
    const width = canvas.width / dpr - margin.left - margin.right;
    console.log({width});
    const height = canvas.height / dpr - margin.top - margin.bottom;
    
    /**
     * 3. 坐标轴绘制
     * 创建基本的L形坐标系
     */
    ctx.beginPath();
    ctx.moveTo(margin.left, margin.top);
    ctx.lineTo(margin.left, height + margin.top);
    ctx.lineTo(width + margin.left, height + margin.top);
    ctx.strokeStyle = '#333';
    ctx.stroke();
    
    /**
     * 4. 数据比例计算
     * 计算权重的最大值和缩放比例
     */
    const maxWeight = Math.max(...selectors.map(
        s => s.specificity.a * 100 + s.specificity.b * 10 + s.specificity.c
    ));

    const gap = 20; 
    // 根据总个数计算单个柱子的最大可用宽度
    const remainingWidth = width - margin.right - (selectors.length - 1) * gap;
    const barWidth = Math.min(80, remainingWidth / selectors.length);

    const scale = height / (maxWeight || 1);
    
    /**
     * 5. 柱状图绘制
     * 为每个选择器绘制堆叠的权重条形图
     */
    selectors.forEach((item, index) => {
        const offset = 5;
        const x = margin.left + (barWidth + gap) * index + offset;
        let y = height + margin.top;
        
        // 存储每个柱状图的位置信息
        barPositions.push({
            x,
            y,
            width: barWidth,
            height: height,
            specificity: item.specificity,
            selector: item.selector
        });
        
        // 5.1 绘制元素选择器部分 (c)
        if (item.specificity.c > 0) {
            const h = item.specificity.c * scale;
            ctx.fillStyle = '#45B7D1';
            ctx.fillRect(x, y - h, barWidth, h);
            y -= h;
        }
        
        // 5.2 绘制类选择器部分 (b)
        if (item.specificity.b > 0) {
            const h = item.specificity.b * 10 * scale;
            ctx.fillStyle = '#4ECDC4';
            ctx.fillRect(x, y - h, barWidth, h);
            y -= h;
        }
        
        // 5.3 绘制ID选择器部分 (a)
        if (item.specificity.a > 0) {
            const h = item.specificity.a * 100 * scale;
            ctx.fillStyle = '#FF6B6B';
            ctx.fillRect(x, y - h, barWidth, h);
        }
        
        /**
         * 6. 文本标签绘制
         * 添加选择器名称
         */
        // 6.1 选择器名称（倾斜显示）
        ctx.save();
        ctx.translate(x + barWidth/2, height + margin.top + 20);
        ctx.rotate(-Math.PI/4);
        ctx.textAlign = 'right';
        ctx.fillStyle = '#2d3436';
        ctx.fillText(item.selector, 0, 0);
        ctx.restore();
    });
    
    /**
     * 7. 图例绘制
     * 添加颜色说明图例
     */
    const legendX = margin.left;
    const legendY = margin.top - 30;
    const legendSpacing = 120;
    
    // 7.1 ID选择器图例
    ctx.fillStyle = '#FF6B6B';
    ctx.fillRect(legendX, legendY, 15, 15);
    ctx.fillStyle = '#2d3436';
    ctx.textAlign = 'left';
    ctx.fillText('ID (×100)', legendX + 20, legendY + 12);
    
    // 7.2 类选择器图例
    ctx.fillStyle = '#4ECDC4';
    ctx.fillRect(legendX + legendSpacing, legendY, 15, 15);
    ctx.fillStyle = '#2d3436';
    ctx.fillText('Class (×10)', legendX + legendSpacing + 20, legendY + 12);
    
    // 7.3 元素选择器图例
    ctx.fillStyle = '#45B7D1';
    ctx.fillRect(legendX + legendSpacing * 2, legendY, 15, 15);
    ctx.fillStyle = '#2d3436';
    ctx.fillText('Element (×1)', legendX + legendSpacing * 2 + 20, legendY + 12);
}

let currentBar = null;

function handleMouseMove(event) {
    const canvas = document.getElementById('priority-canvas');
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    
    // 只在必要时更新
    const bar = barPositions.find(bar => 
        x >= bar.x && 
        x <= bar.x + bar.width && 
        y >= bar.y - bar.height && 
        y <= bar.y
    );
    
    if (bar !== currentBar) {  // 只在状态改变时更新
        currentBar = bar;
        updateTooltip(event, bar);
    } else if (bar) {  // 如果在同一个bar内移动，只更新位置
        updateTooltipPosition(event);
    }
}

function updateTooltip(event, bar) {
    const tooltip = document.getElementById('tooltip');
    if (bar) {
        tooltip.style.display = 'block';
        tooltip.textContent = `${bar.specificity.a},${bar.specificity.b},${bar.specificity.c}`;
        updateTooltipPosition(event);
    } else {
        tooltip.style.display = 'none';
    }
}

function updateTooltipPosition(event) {
    const tooltip = document.getElementById('tooltip');
    const canvas = document.getElementById('priority-canvas');
    const visualizationRect = canvas.parentElement.getBoundingClientRect();
    const relativeX = event.clientX - visualizationRect.left;
    const relativeY = event.clientY - visualizationRect.top;
    
    tooltip.style.left = `${relativeX}px`;
    tooltip.style.top = `${relativeY}px`;
}

function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

function parseSpecificity() {
    const inputList = document.querySelectorAll('.css-input');
    const specificityList = [];
    const selectors = [];
    for(const input of inputList) {
        const cssText = input.value;
        if(!cssText) {
            alert('请输入CSS选择器');
            return;
        }
        const specificity = parseCSSSpecificity(cssText);
        const specificityText = `${cssText} - 优先级: ${specificity.a},${specificity.b},${specificity.c}`;
        specificityList.push(specificityText);
        selectors.push({selector: cssText, specificity});
        drawComparison(selectors);
        console.log(specificity);
        // displaySpecificity(specificityList); // 显示结果
    }
}

function addNewInput() {
    const newInput = document.createElement('input');
    newInput.id = 'css-input' + new Date().getTime();
    newInput.classList.add('css-input');
    newInput.value = '.box';
    const container = document.querySelector('.layout-container');
    container.appendChild(newInput);
}

// 页面加载完成后自动运行一次
if(typeof window !== 'undefined') {
    window.onload = function() {
        document.getElementById('css-input').value = '.box';
        parseSpecificity();
        
        const canvas = document.getElementById('priority-canvas');
        // 使用常量控制节流时间
        canvas.addEventListener('mousemove', throttle(handleMouseMove, FRAME_TIME));
    };
}



function visualizeSelectorTree(selector) {
    const parts = selector.split(/\s+/);
    const tree = {
        type: 'root',
        children: []
    };
    
    let currentNode = tree;
    for (const part of parts) {
        const node = {
            type: 'selector',
            value: part,
            children: []
        };
        currentNode.children.push(node);
        currentNode = node;
    }
    
    return tree;
}

function renderSelectorTree(tree, container) {
    const treeContainer = document.createElement('div');
    treeContainer.className = 'selector-tree';
    
    function renderNode(node, element) {
        const nodeElement = document.createElement('div');
        nodeElement.className = 'tree-node';
        nodeElement.textContent = node.value || '';
        
        if (node.children.length > 0) {
            const childrenContainer = document.createElement('div');
            childrenContainer.className = 'tree-children';
            node.children.forEach(child => renderNode(child, childrenContainer));
            nodeElement.appendChild(childrenContainer);
        }
        
        element.appendChild(nodeElement);
    }
    
    renderNode(tree, treeContainer);
    container.appendChild(treeContainer);
}

function switchLayout(layout) {
    const layoutContainer = document.querySelector('.layout-container');
    layoutContainer.classList.remove('grid', 'flex', 'float');
    layoutContainer.classList.add(layout);
}

function draw3DBar(ctx, x, y, options) {
    const { height = 100, color = '#4CAF50', label = '' } = options;
    const width = 25;  // 柱子宽度
    const depth = 15;  // 3D效果的深度
    
    // 绘制正面
    ctx.fillStyle = color;
    ctx.fillRect(x, y - height, width, height);
    
    // 绘制顶面（使用更亮的颜色）
    ctx.fillStyle = lightenColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(x, y - height);
    ctx.lineTo(x + width, y - height);
    ctx.lineTo(x + width + depth, y - height - depth);
    ctx.lineTo(x + depth, y - height - depth);
    ctx.closePath();
    ctx.fill();
    
    // 绘制侧面（使用更暗的颜色）
    ctx.fillStyle = darkenColor(color, 20);
    ctx.beginPath();
    ctx.moveTo(x + width, y - height);
    ctx.lineTo(x + width, y);
    ctx.lineTo(x + width + depth, y - depth);
    ctx.lineTo(x + width + depth, y - height - depth);
    ctx.closePath();
    ctx.fill();
    
    // 绘制标签
    ctx.fillStyle = '#2d3436';
    ctx.textAlign = 'center';
    ctx.font = '12px Arial';
    // ctx.fillText(label, x + width/2, y + 20);
}

// 辅助函数：使颜色变亮
function lightenColor(color, percent) {
    const num = parseInt(color.replace('#',''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = (num >> 8 & 0x00FF) + amt;
    const B = (num & 0x0000FF) + amt;
    return '#' + (
        0x1000000 +
        (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)
    ).toString(16).slice(1);
}

// 辅助函数：使颜色变暗
function darkenColor(color, percent) {
    const num = parseInt(color.replace('#',''), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (
        0x1000000 +
        (R > 0 ? R : 0) * 0x10000 +
        (G > 0 ? G : 0) * 0x100 +
        (B > 0 ? B : 0)
    ).toString(16).slice(1);
}

// 添加模块导出
module.exports = {
    parseCSSSpecificity
};