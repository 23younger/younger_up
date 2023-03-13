const asap = require('./asap')
// 1、常量 三种状态
const RESOLVED = 'fullfilled'
const PENDING = 'pending'
const REJECTED = 'rejected'

const isPromise = (val) => {
    if (typeof val === "object" && val !== null || typeof val === 'function') {
        return typeof val.then === 'function'
    }
    return false;
}

// 7、处理链式调用
const resolvePromise = (result, newPromise, resolve, reject) => {
    // 获得return的结果不能是当前promise
    if (result === newPromise) {
        throw new Error('can not return oneself')
    }

    if ((typeof result === 'object' && result !== null) || typeof result === 'function') {
        // 可能后面的执行也会报异常
        try {
            const then = result.then
            if (typeof then === 'function') { // 有then方法，有可能是ajax的then，或者第三方promise库的then
                let lock = false // 因为是我们自己定义的promise，有可能这个第三方的then方法两个回调函数都要执行，我们这里给它加个限制
                then.call(
                    result, // 此时then调用的作用域是result
                    (r) => {
                        if (lock) return
                        // 一直递归调用直到最后返回的是普通数值为止
                        resolvePromise(r, newPromise, resolve, reject)
                        lock = true
                    },
                    (e) => {
                        if (lock) return
                        reject(e)
                    }
                )
            } else {
                resolve(result)
            }
        } catch (error) {
            reject(error)
        }
    }
}

class TYPromise {
    constructor(fn) {
        // 2、定义 三种变量
        this.status = PENDING // 保存状态值
        this.message = undefined // 保存resolve(xxx)的数据
        this.error = undefined // 保存reject(yyy)的错误信息

        // 6、定义两个数组，收集pending状态时传入then的回调方法
        this.resolveFnArr = []
        this.rejectFnArr = []

        // 3、定义 resolve、reject 两种方法
        const resolve = (msg) => {
            this.status = RESOLVED
            this.message = msg
            this.resolveFnArr.map(v => v()) // 6、发布
        }

        const reject = (err) => {
            this.status = REJECTED
            this.error = err
            this.rejectFnArr.map(v => v()) // 6、发布
        }

        // 4、直接执行传入的fn
        try {
            fn(resolve,reject);
        } catch (error) {
            reject(error)
        }
    }

    //5、 then方法 三种状态不同做不同处理
    // then 方法里走的是异步微任务，实际需要引入asap/raw库专门做微任务
    // 在这里用异步宏任务setTimeout写例子的较多
    then(doResolve, doReject) {
        doResolve = typeof doResolve === 'function' ? doResolve : (data) => data
        doReject = typeof doReject === 'function' ? doReject : (err) => {
            throw new Error(err)
        }
        const newPromise = new TYPromise((resolve, reject) => {
            // 下面仍是直接执行
            if (this.status === RESOLVED) {
                asap(() => {
                    try {
                        const result = doResolve(this.message)
                        resolvePromise(result, newPromise, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            }
            if (this.status === REJECTED) {
                asap(() => {
                    try {
                        const result = doReject(this.error)
                        resolvePromise(result, newPromise, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            }
            if (this.status === PENDING) {
                // 6、当new TYPromise传入的fn中resolve(xxx)处于异步任务中时
                // status 为 pending，所以需要用发布订阅模式将传入then中的方法存储起来
                // 等走到resolve的时候遍历执行
                doResolve && this.resolveFnArr.push(() => {
                    try {
                        const result = doResolve(this.message) // 订阅
                        resolvePromise(result, newPromise, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
    
                doReject && this.rejectFnArr.push(() => {
                    try {
                        const result = doReject(this.error) // 订阅
                        resolvePromise(result, newPromise, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            }
        })
        return newPromise
    }
    catch(doReject) {
        return this.then(undefined, doReject)
    }
    all(promises) {
        return new TYPromise((resolve, reject) => {
            const res = [];
            let count = 0;

            const resolveRes = (index, data) => {
                res[index] = data;
                if (++count === promises.length) {
                    resolve(res);
                }
            }

            for (let i = 0; i < promises.length; i++) {
                const cur = promises[i];
                if (isPromise(cur)) {
                    cur.then((data) => {
                        resolveRes(i, data)
                    }, (err) => {
                        reject(err)
                    })
                } else {
                    resolveRes(i, cur)
                }
            }
        })
    }
    race(promises) {
        return new TYPromise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                const cur = promises[i];
                if (isPromise(cur)) {
                    cur.then(resolve, reject)
                } else {
                    resolve(cur)
                    break;
                }
            }
        })
    }
}

setTimeout(() => {
    console.log('kkkkkk')
}, 0);

const ttyy = new TYPromise((resolve, reject) => {
    // setTimeout(() => {
        resolve('ssssss')
    // }, 0);
})
ttyy.then(
    (res) => console.log(res),
    (err) => console.log(err)
).then(
    // 7、promise支持链式调用，故then方法中应该返回一个new Promise
    (res) => console.log(res),
    (err) => console.log(err)
)

