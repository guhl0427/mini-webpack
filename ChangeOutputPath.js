export class ChangeOutputPath {
  // 注册事件
  on(hooks) {
    hooks.emitFile.tap('changeOutputPath', (context) => {
      console.log('changeOutputPath');
      context.changePath('./dist/bundle2.js')
    });
  }
}
