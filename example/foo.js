import moduleBar, { bar } from './bar.js';

export function foo() {
  console.log('foo');
  moduleBar.fn1();
  moduleBar.fn2();
  bar();
}
