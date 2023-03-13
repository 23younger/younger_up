const RESOLVE = 'resolved'
const REJECT = 'rejected'
const PENDING = 'pending'

const handlePromise = (result, newPromise, resolve, reject) => {
    // return的结果不能是当前promise
    if (result === newPromise) {
        throw new Error('can not return oneself')
    }

    if ((typeof result === 'object' && result !== null) || typeof result === 'function') {
        try { // 可能后面then方法的执行也会异常出错
            const then = result.then;
            if (typeof then === 'function') { // 认为return的是一个promise，有可能是第三方的promise
                // 如果是第三方的then方法，可能会(r)、(e)都执行，就不符合我们的规范，所以给他加一把锁
                let lock = false
                then.call(
                    result,
                    (r) => {
                        if (lock) return
                        // 递归，直到返回的不是promise，是普通值为止
                        handlePromise(r, newPromise, resolve, reject)
                        lock = true
                    },
                    (e) => {
                        if (lock) return
                        reject(e)
                    }
                )
            } else { // 普通值
                resolve(result);
            }
        } catch (error) {
            reject(error)
        }
    } else { // 普通值
        resolve(result);
    }
}

class TYPromise {
    constructor(fn) {
        this.status = PENDING
        this.result = undefined
        this.reason = undefined
        this.onResolvedArr = []
        this.onRejectedArr = []
        const resolve = (result) => {
            if (this.status === PENDING) { // resolve、reject只能执行一次，状态发生变化则不能重复执行
                this.result = result
                this.status = RESOLVE
                this.onResolvedArr.map(v => v())
            }
        }
        const reject = (reason) => {
            if (this.status === PENDING) {
                this.reason = reason
                this.status = REJECT
                this.onRejectedArr.map(v => v())
            }
        }
        // 异常捕获
        try {
            fn(resolve, reject);
        } catch (error) {
            reject(error)
        }
    }
    then(onResolved, onRejected) {
        onResolved = typeof onResolved === 'function' ? onResolved : (data) => data
        onRejected = typeof onRejected === 'function' ? onRejected : (err) => {
            throw new Error(err)
        }
        const newPromise = new TYPromise((resolve, reject) => {
            if (this.status === RESOLVE) {
                setTimeout(() => {
                    try {
                        const result = onResolved(this.result)
                        handlePromise(result, newPromise, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                }, 0);
            }
            if (this.status === REJECT) {
                setTimeout(() => {
                    try {
                        const result = onRejected(this.reason)
                        handlePromise(result, newPromise, resolve, reject)
                        // throw的error会被下面catch到并reject出去
                    } catch (error) {
                        reject(error)
                    }
                }, 0)
            }
            if (this.status === PENDING) {
                onResolved && this.onResolvedArr.push(() => {
                    try {
                        const result = onResolved(this.result)
                        handlePromise(result, newPromise, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
                onRejected && this.onRejectedArr.push(() => {
                    try {
                        const result = onRejected(this.reason)
                        handlePromise(result, newPromise, resolve, reject)
                    } catch (error) {
                        reject(error)
                    }
                })
            }
        })
        return newPromise
    }
    catch(onRejected) {
        return this.then(undefined, onRejected)
    }
}
setTimeout(() => {
    console.log('sdsdsdsd')
}, 0);

// new Promise((res, rej) => {
//     // setTimeout(() => {
//         res('bbbbb')
//     // }, 0);
// }).then(res => {
//     console.log(res)
// })
// const ttyyPromise = new TYPromise((resolve, reject) => {
//     setTimeout(() => {
//         resolve('kkkkkk')
//     }, 0);
// })
// ttyyPromise.then((res) => {
//     console.log(res)
//     return 'nnnnnn'
// },
// (error) => console.log(error)
// ).then(
// (res) => console.log(res),
// (error) => console.log(error)
// )

// const ttyy1 = new Promise((resolve, reject) => {
//     resolve('mmmmmmm')
// })

// ttyy1.then(
//     (res) => {
//         console.log(res)
//         return 'nnnnnn'
//     },
//     (error) => console.log(error)
// ).then(
//     (res) => console.log(res),
//     (error) => console.log(error)
// )
console.log('sssss')