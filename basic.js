// 1、防抖节流
// 防抖：触发高频事件n秒后执行一次函数，在n秒内再次被触发则重新计算时间, 英雄联盟英雄回城
function debounce(fn, delay) {
    let timer = null;
    return function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, delay);
    }
}
// 节流：高频事件触发，但在n秒内只会执行一次，会稀释函数的执行频率，水龙头滴水
function throttle(fn, delay) {
    let canRun = true;
    return function () {
        if (!canRun) return;
        canRun = false;
        setTimeout(() => {
            fn.apply(this, arguments);
            canRun = true;
        }, delay);
    }
}

// 2、深度优先、广度优先？how to achieve?
// 深度优先：指从某个顶点出发，首先访问这个顶点，再访问这个顶点的第一个相邻节点，
// 再以这个相邻节点作为顶点，找出他的第一个相邻节点，以此类推，直到访问完所有节点
function deepTraversal(node, nodeList = []) { // 递归写法
    if (node != null) {
        nodeList.push(node);
        let childrens = node.children;
        for (let i = 0; i < childrens.length; i++) {
            const child = childrens[i];
            deepTraversal(child, nodeList);
        }
    }
    return nodeList;
}
function deepTraversalStack(node) { // 非递归写法 栈
    // 思想: 先进后出，从右往左入栈，出栈顺序符合深度优先
    let nodeList = []; // 存放访问的节点列表
    if (node != null) {
        let stack = [];
        stack.push(node);
        while (stack.length != 0) {
            const item = stack.pop();
            nodeList.push(item);
            const childrens = item.children;
            for (let i = childrens.length - 1; i >= 0; i--) {
                const child = childrens[i];
                stack.push(child);
            }
        }
    }
    return nodeList;
}
// 广度优先：从某个顶点出发，首先访问该顶点，再访问该顶点的所有子节点，顺序从左往右，
// 再依次访问这些子节点的所有子节点，以此类推，知道访问完所有节点
function wideTraversal(node) { // 队列
    let nodeList = [];
    if (node != null) {
        let queue = [];
        queue.unshift(node);
        while (queue.length != 0) {
            const item = queue.shift();
            nodeList.push(item);
            const childrens = item.children;
            for (let i = 0; i < childrens.length; i++) {
                const child = childrens[i];
                queue.push(child);
            }
        }
    }
    return nodeList;
}
