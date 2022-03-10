import moduleBar, { bar, num, setNum } from './bar.js';

export function foo() {
  console.log(num);
  setNum(10)
  // console.log('foo num', num);
  // console.log('foo');
  // moduleBar.fn1();
  // moduleBar.fn2();
  // bar();
}
