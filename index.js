// 定义正则表达式的常量部分
const REG_PARTS = {
    LETTER: '[a-zA-Z]',
    WORD: '[a-zA-Z0-9]',
    WORD_WITH_DASH: '[a-zA-Z0-9-]',
    WORD_WITH_DASH_UNDERSCORE: '[a-zA-Z0-9-_]',
    PSEUDO_CLASS: ':[a-zA-Z-]+(\\([^)]+\\))?',
    ATTRIBUTE: '\\[[^\\]]+\\]'
};

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

function drawComparison(selectors) {
    const canvas = document.getElementById('priority-canvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  
    selectors.forEach(({ selector, specificity }, index) => {
      const x = index * 120 + 30;
      // 绘制三维柱状图
      draw3DBar(ctx, x, 100, {
        height: specificity.a * 30,
        color: '#FF6B6B',
        label: `ID (${specificity.a})`
      });
      
      draw3DBar(ctx, x + 30, 100, {
        height: specificity.b * 30,
        color: '#4ECDC4',
        label: `Class (${specificity.b})`
      });
  
      draw3DBar(ctx, x + 60, 100, {
        height: specificity.c * 30,
        color: '#45B7D1',
        label: `Element (${specificity.c})`
      });
  
      // 绘制选择器文本
      ctx.fillStyle = '#2d3436';
      ctx.textAlign = 'center';
      ctx.fillText(selector, x + 45, 250);
    });
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
        // 设置一个默认值
        document.getElementById('css-input').value = '.box';
        parseSpecificity();
    };
}

// 添加模块导出
module.exports = {
    parseCSSSpecificity
};

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