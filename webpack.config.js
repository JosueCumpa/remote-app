const Repack = require('@callstack/repack');
const pkg = require('./package.json');

module.exports = Repack.defineWebpackConfig((env) => {
  const {mode, context, platform} = env;

  if (!platform) {
    throw new Error('Missing platform');
  }

  return {
    mode,
    context,
    entry: './index.js',
    resolve: {
      ...Repack.getResolveOptions({enablePackageExports: true}),
    },
    output: {
      path: '[context]/build/[platform]',
      uniqueName: 'RemoteApp',
    },
    module: {
      rules: [
        {
          test: /\.[cm]?[jt]sx?$/,
          use: '@callstack/repack/babel-swc-loader',
          type: 'javascript/auto',
        },
        ...Repack.getAssetTransformRules({inline: true}),
      ],
    },
    plugins: [
      new Repack.RepackPlugin({
        extraChunks: [
          {
            include: /.*/,
            type: 'remote',
            outputPath: `build/${platform}/output-remote`,
          },
        ],
      }),
      new Repack.plugins.ModuleFederationPluginV2({
        name: 'remote',
        filename: 'remote.container.bundle',
        exposes: {
          './RemoteRoot': './src/RemoteRoot.tsx',
        },
        dts: false,
        shared: {
          react: {
            singleton: true,
            eager: false,
            requiredVersion: pkg.dependencies.react,
          },
          'react-native': {
            singleton: true,
            eager: false,
            requiredVersion: pkg.dependencies['react-native'],
          },
        },
      }),
    ],
  };
});
