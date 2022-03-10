import fs from 'fs';
import path from 'path';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import ejs from 'ejs';
import { transformFromAst } from '@babel/core';
import { jsonLoader } from './jsonLoader.js';

let id = 0;

const webpackConfig = {
  module: {
    rules: [
      {
        test: /\.json$/,
        use: [jsonLoader],
      },
    ],
  },
};

function createAsset(filePath) {
  // 1.获取文件内容
  let source = fs.readFileSync(filePath, {
    encoding: 'utf-8',
  });

  const loaders = webpackConfig.module.rules;
  const loaderContext = {
    addDeps(deps) {
      console.log('addDeps', deps);
    },
  };

  loaders.forEach(({ test, use }) => {
    if (test.test(filePath)) {
      if (Array.isArray(use)) {
        use.reverse().forEach(fn => {
          source = fn.call(loaderContext, source);
        });
      }
    }
  });

  // console.log(source);
  // 2.获取依赖关系 ast-> 抽象语法树
  const ast = parser.parse(source, {
    sourceType: 'module',
  });
  // console.log(ast);

  const deps = [];
  traverse.default(ast, {
    // 基于 import 来获取当前文件需要的依赖
    ImportDeclaration({ node }) {
      deps.push(node.source.value);
      // console.log(node.source.value);
    },
  });

  // esm转换成cjs
  const { code } = transformFromAst(ast, null, {
    presets: ['env'],
  });
  // console.log(code);

  return {
    code,
    deps,
    filePath,
    mapping: {},
    id: id++,
  };
}

// const asset = createAsset();
// console.log(asset);

function createGraph() {
  const mainAsset = createAsset('./example/main.js');

  const queue = [mainAsset];

  for (const asset of queue) {
    asset.deps.forEach(depPath => {
      const childAsset = createAsset(path.resolve('./example', depPath));
      asset.mapping[depPath] = childAsset.id;
      queue.push(childAsset);
      // console.log(childAsset);
    });
  }
  return queue;
}

function build(graph) {
  const bundleTemplate = fs.readFileSync('./bundleTemplate.ejs', {
    encoding: 'utf-8',
  });
  // console.log(bundleTemplate);
  const modules = graph.map(asset => {
    const { id, code, mapping } = asset;
    return {
      id,
      code,
      mapping,
    };
  });
  // console.log('data----------------');
  // console.log(data);

  const code = ejs.render(bundleTemplate, { modules });
  console.log('code----------------');
  console.log(code);
  fs.writeFileSync('./dist/bundle.js', code);
}

const queue = createGraph();
// console.log(queue);
build(queue);
