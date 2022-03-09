export function bar() {
  console.log('bar');
  console.log(num++);
}
var num = 1;

export default {
  fn1: () => {
    console.log('fn1');
  },
  fn2: () => {
    console.log('fn2');
  },
};
