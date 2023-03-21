/**
 * 1、手写Object.create(proto, propertiesObject?)
 * tip:将传入的对象作为原型
 */
function create(obj) {
  function F() {};
  F.prototype = obj;
  return F();
}

/**
 * 2、手写instanceof：用于判断构造函数的prototype属性是否在对象的原型链中的任何位置
 * 1) 首先获取类型的原型
 * 2）然后获得对象的原型
 * 3）然后一直循环对象的原型是否等于类型的原型，直到对象原型为null，因为原型链最终为null
 */
function myInstanceof(left, right) {
  let proto = Object.getPrototypeOf(left),
      prototype = right.prototype;

      // 判断构造函数的prototype对象是否在对象的原型链上
      while(true) {
        if (!proto) return false;
        if (proto === prototype) return true;
        proto = Object.getPrototypeOf(proto);
      }
}

/**
 * 3、手写new
 * 1) 首先创建了一个空对象
 * 2) 设置原型，将创建的对象的原型设置为函数的prototype对象
 * 3) 让函数的this指向这个对象，执行构造函数的代码（为这个空对象添加属性）
 * 4) 判断函数的返回值类型，如果是值类型，返回创建的对象。如果是引用类型，就返回这个引用类型的对象
 */
function myNew(fn, ...args) {
  // 判断参数是不是函数
  if (typeof fn !== 'function') {
    return console.error('type error!');
  }
  // 创建一个对象，将该对象的原型设置为构造函数的prototype对象
  let obj = Object.create(fn.prototype);
  // 调用构造函数，并将this绑定到对象上
  const value = fn.apply(obj, args);
  // 如果构造函数有返回值，且返回的是对象，则返回value，否则返回obj
  return value instanceof Object ? value : obj;
}

/**
 * 4、防抖和节流
 * 防抖：指事件被触发n秒后再执行回调，如果在n秒内再次被触发，则重新计算时间。
 *      可用于点击请求的事件上，避免用户多次点击向后端多次请求。
 * 节流：指规定一个单位时间，在这个单位时间内，只能有一次触发事件执行回调，如果在同一个单位时间内某事件被多次触发，只有一次生效。
 *      可用于scroll函数的事件监听上，通过节流降低事件调用的频率
 */
function debounce(fn, delay) {
  let timer = null
  return function(...args) {
    if (timer) {
      clearTimeout(timer)
    }
    timer = setTimeout(() => {
      fn.apply(this, args)
    }, delay);
  }
}

function throttle(fn, delay) {
  // +new Date() === new Date().getTime(), +是为了将该数据类型转换为Number类型
  // 转换失败的话返回NaN，+new Date() 会调用Date.prototype上面的valueOf方法，隐式转换
  // new Date().getTime() === new Date().valueOf() === +new Date() === new Date()*1 === Date.now()/H5新增
  let time = +new Date();
  return function(...args) {
    const now = +new Date();
    if (now - time >= delay) {
      setTimeout(() => {
        fn.apply(this, args);
      }, delay);
      time = now;
    }
  }
}

/**
 * 5、手写call/apply/bind
 * 1）判断调用对象是否为函数，即使我们是定义在函数的原型上，但是可能出现使用call/apply等方式调用的情况
 * 2）处理传入的参数，截取第一个参数后的所有参数
 * 3）判断传入的上下文是否存在，若不存在，则将上下文设置为window
 * 4）将函数作为上下文对象的一个属性
 * 5）使用上下文对象来调用这个方法，并保存返回结果
 * 6）删除刚才新增的属性
 * 7）返回结果
 */
Function.prototype.myCall = function (context) {
  // 判断调用对象
  if (typeof this !== 'function') {
    throw new Error('type error');
  }
  // 处理参数
  let params = [...arguments].slice(1),
      result = null;
  // 判断context是否传入，如果没有，则赋值window
  context = context || window;
  // 将调用函数作为context的方法
  context.fn = this;
  // 调用函数
  result = context.fn(...params);
  // 将属性删除
  delete context.fn;
  return result;
}
Function.prototype.myApply = function (context) {
  if (typeof this !== 'function') {
    throw new Error('type error');
  }
  let result = null;
  context = context || window;
  context.fn = this;
  if (arguments[1]) {
    result = context.fn(...arguments[1]);
  } else {
    result = context.fn();
  }
  delete context.fn;
  return result;
}
Function.prototype.myBind = function (context) {
  if (typeof this !== 'function') {
    throw new Error('type error')
  }
  // 处理参数
  let params = [...arguments].slice(1),
      fn = this;
  context = context || window;
  return function Fn() {
    // 根据调用方式，传入不同绑定值
    return fn.apply(
      // ty_important
      // 因为bind返回值是一个函数，所以后面可能有调用者，如果没有则更改的this还是前面的context
      // 举例：如果将Fn作为了构造函数，那么构造函数Fn的this得指向它new出来的实例对象，而不是用户自定义的context
      // 因为优先级 new绑定 > 显示绑定
      this instanceof Fn ? this : context,
      params.concat(...arguments)
    )
  }
}

/**
 * 6、函数柯里化
 * https://blog.csdn.net/weixin_47450807/article/details/123152265
 * fn(a)(b)(c).... || fn = a => b => c
 * 好处：在函数式编程中，我们往往希望一个函数处理的问题尽可能的单一，而不是将一大堆的过程交给一个函数来处理
 */
function myCurry(fn) {
  return function curry(...args1) {
    if (args1.length >= fn.length) {
      fn.call(null, ...args1);
    } else {
      return function (...args2) {
        return curry.apply(null, [...args1, ...args2])
      }
    }
  }
}
function curry(fn, ...args) {
  return args.length >= fn.length ? fn(...args) : fn.bind(null, fn, ...args);
}

/**
 * 7、手写ajax请求
 * 1）创建一个XMLHttpRequest对象
 * 2）在这个对象上使用open方法创建一个http请求，open方法所需要的参数是请求方法、地址、是否异步、用户的认证信息
 * 3）在发起请求前，可以为这个对象添加一些信息和监听函数。setRequestHeader添加请求头信息。
 *    还可以为这个对象添加状态监听函数：总共5个状态，状态变化会触发onreadystatechange事件，可设置监听函数，处理请求成功后的结果。
 *    当readyState变为4，代表服务器返回的数据接收完成，这时可通过判断请求的状态，如果是2xx或304代表返回正常，可通过response中的数据对页面进行更新了
 * 4）当对象的属性和监听函数设置完成后，最后通过调用sent方法来向服务器发送请求，可以传入参数作为发送的数据体
 */
function myAjax() {
  const url = '/server';
  let xhr = new XMLHttpRequest();
  xhr.open("GET", url, true);
  xhr.onreadystatechange = function () {
    if (this.readyState !== 4) return;
    if (this.status === 200 || this.status === 304) {
      // request success callback
      console.log(this.response);
    } else {
      console.error(this.statusText);
    }
  }
  xhr.onerror = function () {
    console.error(this.statusText);
  }
  xhr.responseType = 'json';
  xhr.setRequestHeader('Accept', 'application/json');
  xhr.send(null);
}

/**
 * 8、使用Promise封装ajax
 */
function getJson() {
  return new Promise((resolve, reject) => {
    const url = '/server';
    let xhr = new XMLHttpRequest();
    xhr.open("GET", url, true);
    xhr.onreadystatechange = function () {
      if (this.readyState !== 4) return;
      if (this.status === 200 || this.status === 304) {
        // request success callback
        console.log(this.response);
        resolve(this.response)
      } else {
        console.error(this.statusText);
        reject(new Error(this.statusText))
      }
    }
    xhr.onerror = function () {
      console.error(this.statusText);
      reject(new Error(this.statusText))
    }
    xhr.responseType = 'json';
    xhr.setRequestHeader('Accept', 'application/json');
    xhr.send(null);
  })
}

/**
 * 9、手写深拷贝
 */
function deepClone(obj) {
  const type = Object.prototype.toString.call(obj).slice(8, -1);
  if (type === 'Object') {
    let result = {};
    for (const key in obj) {
      result[key] = deepClone(obj[key])
    }
    return result
  } else if (type === 'Array') {
    let result = [];
    for (let i = 0; i < obj.length; i++) {
      result.push(deepClone(obj[i]));
      return result;
    }
  }
  return obj;
}

/**
 * 10、手写打乱数组顺序的方法
 * 1）遍历元素，将当前元素的当前索引以及之后的索引随机生成一个索引值，两两交换，以此类推直至结束
 */
function randomIndexFn() {
  let arr = [1,2,3,4,5,6,7,8,9,10];
  for (let i = 0; i < arr.length; i++) {
    const randomIndex = Math.round(Math.random() * (arr.length - 1 - i)) + i;
    [arr[i], arr[randomIndex]] = [arr[randomIndex], arr[i]];
  }
  console.log(arr);
}

/**
 * 11、实现数组扁平化
 * 1）通过循环递归方法
 * 2）reduce迭代
 * 3）array.flat ES6新特性
 */
// let arr = [1, [2, [3, 4, 5]]];
function flatArray1(arr) {
  let result = [];
  for (let i = 0; i < arr.length; i++) {
    if (Array.isArray(arr[i])) {
      result = result.concat(flatArray1(arr[i]))
    } else {
      result.push(arr[i])
    }
  }
  return result;
}
function flatArray2(arr) {
  return arr.reduce((prev, next) => {
    return prev.concat(
      Array.isArray(next) ? flatArray2(next) : next
    )
  }, [])
}
function flatArray3(arr) {
  return arr.flat(Infinity);
}

/**
 * 12、实现数组的flat方法
 */
function _flat(arr, depth) {
  if (!Array.isArray(arr) || depth <= 0) {
    return arr;
  }
  return arr.reduce((prev, next) => {
    return prev.concat(
      Array.isArray(next) ? _flat(next, depth - 1) : next
    )
  }, [])
}
// const arrNum = [1, [2, 3], [4, [5, 6, 7]]]
// console.log(_flat(arrNum, 1))

/**
 * 13、实现数组的push方法
 */
// Array.prototype.push = function () {
//   for (let i = 0; i < arguments.length; i++) {
//     this[this.length] = arguments[i]
//   }
//   return this.length;
// }

/**
 * 14、实现数组的filter方法
 */
// Array.prototype.filter = function (fn) {
//   if (typeof fn !== 'function') {
//     throw Error('must be function type')
//   }
//   const res = [];
//   for (let i = 0; i < this.length; i++) {
//     fn(this[i], i) && res.push(this[i])
//   }
//   return res;
// }

/**
 * 15、实现数组的map方法
 */
// Array.prototype.map = function (fn) {
//   if (typeof fn !== 'function') {
//     throw Error('must be function type')
//   }
//   const res = []
//   for (let i = 0; i < this.length; i++) {
//     res.push(fn(this[i], i))
//   }
// }

/**
 * 16、实现add(1)(2)(3)(4)
 * 1）可以实现任意数量数字相加，但需要用+隐式转换
 * 2）参数固定的情况下，不需要用+号，可根据参数长度判断返回值，柯里化思路
 */
function addFn() {
  let result = [];
  function add(...args) {
    // 剩余参数，可以获取到传进来的参数
    result = result.concat(args);
    return add;
  }
  // 创建一个取代valueOf方法的函数，覆盖自定义对象的valueOf方法，用于隐式转换
  add.toString = () => result.reduce((prev, next) => prev + next, 0)
  return add;
}
// let add = addFn();
// console.log(+add(1)(2)(3)(4))
// console.log(+add(1,2,3)(2)(3)(4))

function addCurrying(fn, length) {
  // 第一次调用，给length赋值fn的长度，后面每次重复调用，length的长度都会减去参数的长度
  length = length || fn.length;
  return function(...args) {
    return args.length >= length ? fn.apply(this, args) : currying(fn.bind(this, ...args), length - args.length)
  }
}
function fn(a, b, c, d) {
  return a + b + c + d
}
// let add1 = addCurrying(fn);
// console.log(add1(1)(2)(3)(4))

/**
 * 17、用Promise实现图片的异步加载
 */
let imageAsync = (url) => {
  return new Promise((resolve, reject) => {
    let img = new Image();
    img.src = url;
    img.onload = () => {
      console.log('图片加载成功');
      resolve(img);
    }
    img.onerror = (err) => {
      console.error('图片加载失败');
      reject(err);
    }
  })
}
imageAsync('').then(
  res => console.log('res', res),
  err => console.log('err', err),
).catch((error) => console.error(error))

/**
 * 18、手写发布订阅模式
 */
class EventCenter {
  constructor() {
    this.handlers = {}
  }
  addEventListener(type, handler) {
    if (!this.handlers[type]) {
      this.handlers[type] = [];
    }
    this.handlers[type].push(handler)
  }
  dispatchEvent(type, params) {
    if (!this.handlers[type]) {
      return new Error('该事件未注册')
    }
    this.handlers[type].forEach(handler => {
      handler(...params)
    });
  }
  removeEventListener(type, handler) {
    if (!this.handlers[type]) {
      return new Error('事件无效')
    }
    const index = this.handlers[type].findIndex(e => e === handler);
    if (index < 0) {
      return new Error('无该绑定事件')
    }
    this.handlers[type].splice(index, 1);
    if (this.handlers[type].length === 0) {
      delete this.handlers[type]
    }
  }
}