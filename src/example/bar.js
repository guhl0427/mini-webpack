// 暂不支持循环引用
// import { foo } from "./foo.js";
// foo()
export function bar() {
  console.log('bar');
}

export function setNum(val) {
  num = val;
  console.log('setNum', num);
}
export var num = 1;

export default {
  fn1: () => {
    console.log('fn1');
  },
  fn2: () => {
    console.log('fn2');
  },
};
