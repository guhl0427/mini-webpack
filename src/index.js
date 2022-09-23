import { transformFromAstSync } from '@babel/core';
import parser from '@babel/parser';
import traverse from '@babel/traverse';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import { SyncHook } from 'tapable';
import { jsonLoader } from './loaders/jsonLoader.js';
import { ChangeOutputPath } from './plugins/ChangeOutputPath.js';

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
  plugins: [new ChangeOutputPath({
    outputPath: './dist/bundle2.js'
  })],
};

const hooks = {
  emitFile: new SyncHook(['context']),
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

  // loader
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
  const { code } = transformFromAstSync(ast, null, {
    presets: ['@babel/preset-env'],
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

function createGraph(entry) {
  const mainAsset = createAsset(entry);

  const queue = [mainAsset];

  for (const asset of queue) {
    const dirname = path.dirname(asset.filePath);
    asset.deps.forEach(depPath => {
      const childAsset = createAsset(path.join(dirname, depPath));
      asset.mapping[depPath] = childAsset.id;
      queue.push(childAsset);
      // console.log(childAsset);
    });
  }
  return queue;
}

function build(graph) {
  const bundleTemplate = fs.readFileSync('./src/bundleTemplate.ejs', {
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

  const code = ejs.render(bundleTemplate, { modules });

  let outputPath = './dist/bundle.js';
  let context = {
    changePath(path) {
      outputPath = path;
    },
  };
  hooks.emitFile.call(context);
  fs.writeFileSync(outputPath, code);
}

function initPlugins() {
  const plugins = webpackConfig.plugins;

  plugins.forEach(plugin => {
    plugin.on(hooks);
  });
}
initPlugins();

const queue = createGraph('./src/example/main.js');
// console.log(queue);
build(queue);
