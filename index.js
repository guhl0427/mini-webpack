import fs from "fs"
import path from "path"
import parser from '@babel/parser'
import traverse from "@babel/traverse"

// console.log(traverse);
function createAsset(filePath) {
  // 1.获取文件内容
  let source = fs.readFileSync(filePath, {
    encoding: "utf-8"
  });

  // console.log(source);
  // 2.获取依赖关系 ast-> 抽象语法树
  const ast = parser.parse(source, {
    sourceType: 'module'
  });
  // console.log(ast);

  const deps = [];
  traverse.default(ast, {
    ImportDeclaration({ node }) {
      deps.push(node.source.value)
      // console.log(node.source.value);
    }
  })

  return {
    source,
    deps,
    filePath
  }
}

// const asset = createAsset();
// console.log(asset);

function createGraph() {
  const mainAsset = createAsset("./example/main.js");

  const queue = [mainAsset]

  for (const asset of queue) {
    asset.deps.forEach(depPath => {
      const childAsset = createAsset(path.resolve("./example", depPath));
      queue.push(childAsset)
      // console.log(childAsset);
    })
  }
  return queue;
}

const queue = createGraph();
console.log(queue)