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

// 3、异步笔试题
// async function async1() {
//     console.log('async1 start')
//     await async2()
//     console.log('async1 end')
// }
// async function async2() {
//     console.log('async2')
// }
// console.log('script start')
// setTimeout(function() {
//     console.log('setTimeout')
// }, 0)
// async1()
// new Promise(function(resolve) {
//     console.log('promise1')
//     resolve()
// }).then(function() {
//     console.log('promise2')
// })
// console.log('script end')
// script start
// async1 start
// async2
// promise1
// script end
// async1 end
// promise2
// setTimeout

// 4、继承
/**
 * 4-1、原型链继承：父类的实例用作子类的原型
 * 优：父类的方法可以被子类调用
 * 缺：不同的子类实例间修改继承下来的引用类型的属性会相互影响，改这必改那
 *     子类实例不能给父类构造函数传参
 */
// function Person(name, age) {
//     this.name = name;
//     this.age = age;
//     this.sex = ['male', 'female'];
// }
// Person.prototype.show = function () {
//     console.log(this.name+':'+this.age);
// }
// function Tong() {};
// Tong.prototype = new Person();
// let tong1 = new Tong();
// let tong2 = new Tong();
// tong2.name = 'ttyy';
// tong1.sex[0] = 'man';
// console.log(tong1.sex[0], tong2.sex[0]); // 'male male'
// tong1.show(); // undefined:undefined

/**
 * 4-2、借用构造函数继承(对象伪装):盗用构造函数‘constructor stealing’
 *      在子类构造函数中通过call或apply方法调用父类构造函数
 * 优：可以在子类构造函数向父类构造函数传参，父类的实例的引用类型属性不会被共享
 */
// function Parent(name, age) {
//     this.name = name;
//     this.age = age;
//     this.names = ['jack', 'rose'];
// }
// Parent.prototype.show = function () {
//     console.log(this.name+':'+this.age);
// }
// function Child(name, age) {
//     Parent.call(this, name, age);
// }
// Child.prototype.showName = function () {
//     console.log('showName:'+this.name);
// }
// let child1 = new Child('tong', 26);
// let child2 = new Child('yang', 27);
// child1.names[0] = 'james';
// console.log(child1.names[0]); // james
// // child1.show(); // 会报错
// console.log(child2.names[0]); // jack
// child1.showName();
// child2.showName();

/**
 * 4-3、组合继承：结合原型链继承和借用构造函数继承的核心（常见继承方式）
 * 优：既能传递参数，引用类型属性互不影响，还可以调用父类的方法
 * 缺：父类构造函数被调用了两次，Child原型上和实例上有了两份相同的属性，有一些性能浪费
 */
// function Parent(age, name) {
//     this.age = age;
//     this.name = name;
//     this.interests = ['play', 'study'];
// }
// Parent.prototype.show = function() {
//     console.log(this.name+':'+this.age+':'+this.interests[0]);
// }
// function Child(age, name) {
//     Parent.call(this, age, name); // 调用第一次
// }
// Child.prototype = new Parent(); // 调用第二次
// // 为了Child的constructor重新指向Child,不然会指向Parent
// Child.prototype.constructor = Child;
// let child1 = new Child('tong', 26);
// let child2 = new Child('yang', 27);
// child1.interests[0] = 'eat';
// console.log(child1.name, child1.age, child1.interests[0]);
// console.log(child2.name, child2.age, child2.interests[0]);

/**
 * 4-4、寄生组合继承：子类原型赋值为父类原型，没必要new一个父类实例，直接创造一个新对象，值为父类的原型
 *      Object.create(proto，[propertiesObject])
 * 优：解决组合继承实例和原型产生两份相通属性的缺点
 */
// function Parent(name, age) {
//     this.age = age;
//     this.name = name;
//     this.interests = ['play', 'study'];
// }
// Parent.prototype.show = function() {
//     console.log(this.name+':'+this.age+':'+this.interests[0]);
// }
// function Child(name, age) {
//     Parent.call(this, name, age);
// }
// if (!Object.create) {
//     Object.create = function (o) {
//         function f () {};
//         f.prototype = o;
//         return new f();
//     }
// }
// Child.prototype = Object.create(Parent.prototype);
// // 为了Child的constructor重新指向Child,不然会指向Parent
// Child.prototype.constructor = Child;
// let child1 = new Child('tong', 26);
// let child2 = new Child('yang', 27);
// child1.interests[0] = 'eat';
// console.log(Child.prototype.__proto__ === Parent.prototype); // true
// console.log(child1.name, child1.age, child1.interests[0]); // tong 26 eat
// console.log(child2.name, child2.age, child2.interests[0]); // yang 27 play

/**
 * 4-5、class继承
 * 缺点：低版本ie浏览器不支持es6
 */
class Animal {
    constructor(name) {
        this.name = name;
    }
    likeEat() {
        console.log(this.name+' like '+this.food);
    }
}

class Dog extends Animal {
    constructor(name, food) {
        super(name);
        this.food = food;
    }
    likeEat() {
        super.likeEat();
    }
}
let jinmao = new Dog('jinmao', 'bone');
console.log(jinmao.name);
jinmao.likeEat();