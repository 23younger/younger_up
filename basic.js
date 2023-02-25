// 1、防抖节流
// 防抖：触发高频事件n秒后执行一次函数，在n秒内再次被触发则重新计算时间, 英雄联盟英雄回城
function debounce (fn, delay) {
    let timer = null;
    return function () {
        if (timer) clearTimeout(timer);
        timer = setTimeout(() => {
            fn.apply(this, arguments);
        }, delay);
    }
}
// 节流：高频事件触发，但在n秒内只会执行一次，会稀释函数的执行频率，水龙头滴水
function throttle (fn, delay) {
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