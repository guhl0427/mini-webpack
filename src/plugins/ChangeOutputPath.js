export class ChangeOutputPath {
  constructor({ outputPath }) {
    this.outputPath = outputPath
  }
  // 注册事件
  on(hooks) {
    hooks.emitFile.tap('changeOutputPath', (context) => {
      console.log('changeOutputPath')
      context.changePath(this.outputPath)
    })
  }
}
