// 1、定义三种状态
const PENDING = 'pending';
const RESOLVED = 'fullfilled';
const REJECTED = 'rejected';

const isPromise = (val) => {
  if ((typeof val === 'object' && val !== null) || typeof val === 'function') {
    return typeof val.then === 'function';
  }
  return false;
}

// 处理链式调用
const resolvePromise = (result, newPromise, resolve, reject) => {
  if (result === newPromise) {
    throw new Error('can not return oneself');
  }

  if ((typeof result === 'object' && result !== null) || typeof result === 'function') {
    // 后续执行可能也会报异常
    try {
      const then = result.then;
      if (typeof then === 'function') {
        // 有then方法，可能是ajax的then，或第三方promise库的then
        // 因为是我们自己定义的promise，有可能这个第三方的then方法两个回调函数都要执行，我们这里给它加个限制
        let lock = false;
        then.call(
          result, // 此时then调用的作用域是result
          (r) => {
            if (lock) return;
            // 一直递归调用直到最后返回的是普通数值为止
            resolvePromise(r, newPromise, resolve, reject);
            lock = true;
          },
          (e) => {
            if (lock) return;
            reject(e);
          }
        )
      } else {
        resolve(result);
      }
    } catch (error) {
      reject(error)
    }
  }
}

class PromiseTy {
  constructor(fn) {
    // 2、定义三种变量
    this.state = PENDING; // 保存状态值
    this.resMessage = undefined; // 保存resolve(xxx)的数据
    this.rejError = undefined; // 保存reject(xxx)的错误信息

    // 6、储存pending时收集到的回调方法
    this.resolveFnArr = [];
    this.rejectFnArr = [];

    // 3、定义resolve,reject两种方法
    const resolve = (msg) => {
      if (this.state === PENDING) {
        this.state = RESOLVED;
        this.resMessage = msg;
        this.resolveFnArr.map(v => v()); // 6、发布
      }
    }
    const reject = (err) => {
      if (this.state === PENDING) {
        this.state = REJECTED;
        this.rejError = err;
        this.rejectFnArr.map(v => v()); // 6、发布
      }
    }

    // 4、直接执行传入的fn
    try {
      fn(resolve, reject);
    } catch (error) {
      reject(error)
    }
  }
  // 5、then,三种状态不同做不同处理
  then(doResolve, doReject) {
    doResolve = typeof doResolve === 'function' ? doResolve : (data) => data;
    doReject = typeof doReject === 'function' ? doReject : (err) => {
      throw new Error(err);
    }
    // 链式调用，return promise
    const newPromise =  new PromiseTy((resolve, reject) => {
      if (this.state === PENDING) {
        // 6、采用发布订阅模式将传入then中的方法储存起来，
        // 等状态走到resolved或rejected时遍历执行
        doResolve && this.resolveFnArr.push(() => {
          try {
            const result = doResolve(this.resMessage); // 订阅
            // 可能result是一个promise或者其他promise库的结果
            // 需要对它进行处理，递归处理到结果result是普通数值为止resolve(xxx) || reject(xxx)
            resolvePromise(result, newPromise, resolve, reject);
          } catch (error) {
            reject(error)
          }
        })
        doReject && this.rejectFnArr.push(() => {
          try {
            const result = doReject(this.rejError); // 订阅
            resolvePromise(result, newPromise, resolve, reject);
          } catch (error) {
            reject(error)
          }
        })
      } else if (this.state === RESOLVED) {
        // 转为微任务
        asap(() => {
          try {
            const result = doResolve(this.resMessage);
            resolvePromise(result, newPromise, resolve, reject);
          } catch (error) {
            reject(error)
          }
        })
      } else if (this.state === REJECTED) {
        // 转为微任务
        asap(() => {
          try {
            const result = doReject(this.rejError);
            resolvePromise(result, newPromise, resolve, reject);
          } catch (error) {
            reject(error)
          }
        })
      }
    })
    return newPromise;
  }
  catch(doReject) {
    return this.then(undefined, doReject);
  }
  all(promises) {
    return new PromiseTy((resolve, reject) => {
      let resArr = [];
      let index = 0;

      const resolveRes = (i, res) => {
        resArr[i].push(res);
        if (++index === promises.length) {
          resolve(resArr);
        }
      }

      for (let i = 0; i < promises.length; i++) {
        const cur = promises[i];
        if (isPromise(cur)) {
          cur.then(res => {
            resolveRes(i, res);
          }, err => {
            reject(err)
          })
        } else {
          resolveRes(i, cur)
        }
      }
    })
  }
  race(promises) {
    return new PromiseTy((resolve, reject) => {
      for (let i = 0; i < promises.length; i++) {
        const cur = promises[i];
        if (isPromise(cur)) {
          cur.then(res => {
            resolve(res);
          }, err => {
            reject(err);
          })
        } else {
          resolve(cur);
          break;
        }
      }
    })
  }
}

/**
 * async/await 原理
 * https://juejin.cn/post/7136424542238408718
 */
