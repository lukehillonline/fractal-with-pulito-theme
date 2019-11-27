const CopyWebpackPlugin = require('copy-webpack-plugin');
const FixStyleOnlyEntriesPlugin = require('webpack-fix-style-only-entries');
const FractalWebpackPlugin = require('fractal-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const path = require('path');
const StyleLintPlugin = require('stylelint-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = (env, argv) => {
    /**
     * Determine if is production mode from the command executed
     */
    const isProduction = argv.mode === 'production';

    /**
     * Common paths
     */
    const paths = {
        src: 'src',
        dev: 'public',
        prod: 'public'
    };

    /**
     * Generate the settings for webpack depending on if it is
     * development or production mode.
     */
    const settings = {
        mode: isProduction ? 'production' : 'development',
        outputDir: isProduction ? paths.prod : paths.dev,
        fractal: {
            mode: isProduction ? 'build' : 'server',
            sync: isProduction ? false : true
        }
    };

    return {
        // Mode is set by --mode property in command
        mode: settings.mode,

        /**
         * 3 entries:
         *      design-system: This is Design System UI specific CSS
         *      website: This is website & component specific CSS
         *      app: This is the website & component specific JS
         */
        entry: {
            /**
             * Main website and Design System CSS files
             */
            'style/website': path.resolve(__dirname, `./${paths.src}/scss/styles.scss`)
        },

        /**
         * JS output goes into the scripts folder and depending on mode will
         * either go into the public or the dist folder with it's chunks
         */
        output: {
            path: path.resolve(__dirname, `./${settings.outputDir}`),
            filename: 'scripts/[name].js',
            chunkFilename: 'scripts/[name].chunk.js'
        },

        module: {
            rules: [
                {
                    parser: {
                        amd: false
                    }
                },
                {
                    /**
                     * Load JS files with Babel Loader and set to transpile code to work
                     * in IE10 and above.
                     */
                    test: /\.(js)$/,
                    exclude: /node_modules/,
                    use: [
                        {
                            loader: 'babel-loader',
                            options: {
                                configFile: './babel.config.js',
                                presets: [
                                    [
                                        '@babel/preset-env',
                                        {
                                            useBuiltIns: 'entry',
                                            corejs: '^3.1.4',
                                            targets: {
                                                browsers: ['defaults, ie >= 10']
                                            }
                                        }
                                    ]
                                ]
                            }
                        },
                        {
                            loader: 'eslint-loader',
                            options: {
                                configFile: '.eslintrc.json'
                            }
                        }
                    ]
                },
                {
                    /**
                     * Load SASS files with 2 loaders
                     *      PostCSS: This converts the SCSS to CSS, adds in polyfills for flexbox,
                     *               auto prefixes and adds in normalise CSS.
                     *      SASS Loader: This generates source maps for CSS.
                     */
                    test: /\.(scss|sass)$/,
                    use: [
                        {
                            loader: MiniCssExtractPlugin.loader,
                            options: {
                                publicPath: (resourcePath, context) => {
                                    // publicPath is the relative path of the resource to the context
                                    // e.g. for ./css/admin/main.css the publicPath will be ../../
                                    // while for ./css/main.css the publicPath will be ../
                                    return path.relative(path.dirname(resourcePath), context) + '/../';
                                }
                            }
                        },
                        {
                            loader: 'css-loader',
                            options: {
                                sourceMap: true
                            }
                        },
                        {
                            loader: 'postcss-loader',
                            options: {
                                plugins: () => [
                                    require('postcss-flexbugs-fixes'),
                                    require('postcss-preset-env')({
                                        autoprefixer: {
                                            flexbox: 'no-2009'
                                        },
                                        stage: 3
                                    }),
                                    require('autoprefixer')(),
                                    require('cssnano')({
                                        preset: [
                                            'default',
                                            {
                                                normalizeWhitespace: false,
                                                discardComments: {
                                                    removeAll: true
                                                }
                                            }
                                        ]
                                    })
                                ],
                                sourceMap: true,
                                minimize: false
                            }
                        },
                        {
                            loader: 'sass-loader',
                            options: {
                                sourceMap: true,
                                sassOptions: {
                                    sourceComments: false
                                }
                            }
                        }
                    ]
                },
                {
                    /**
                     * This looks for all images and uses the File Loader to move them to
                     * the output directory. It excludes the fonts directory so there is no
                     * duplication of SVG files
                     */
                    test: /\.(png|jpg|jpeg|gif|svg)$/,
                    exclude: /fonts/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[folder]/[name].[ext]',
                                outputPath: '/images'
                            }
                        }
                    ]
                },
                {
                    /**
                     * This looks for all font files and uses the File Loader to
                     * move hem to the output directory. It excludes the images directory
                     * so there is no duplication of SVG files
                     */
                    test: /\.(woff|woff2|eot|ttf|otf|svg)$/,
                    exclude: /images/,
                    use: [
                        {
                            loader: 'file-loader',
                            options: {
                                name: '[folder]/[name].[ext]',
                                outputPath: '/fonts'
                            }
                        }
                    ]
                }
            ]
        },

        plugins: [
            /**
             * This prevents webpack from generating a JS file for SCSS entries
             */
            new FixStyleOnlyEntriesPlugin(),
            /**
             * Runs SASS linting
             */
            new StyleLintPlugin({
                configFile: '.stylelintrc.json',
                context: 'src',
                files: '**/*.scss',
                failOnError: false,
                quiet: false,
                emitErrors: true
            }),
            /**
             * This outputs SCSS entires into CSS files and thier chunks
             */
            new MiniCssExtractPlugin({
                filename: '[name].css'
            }),
            /**
             * Runs Fractal in either server mode for dev and build mode for
             * production.
             */
            new FractalWebpackPlugin({
                mode: settings.fractal.mode,
                sync: settings.fractal.sync
            }),
            /**
             * Copies images over to the output directory
             */
            new CopyWebpackPlugin([
                {
                    from: path.resolve(__dirname, `./${paths.src}/images`),
                    to: 'images'
                }
            ])
        ],

        /**
         * This only runs when in production mode and will minify JS and CSS
         */
        optimization: {
            minimize: true,
            minimizer: [
                new OptimizeCSSAssetsPlugin({
                    assetNameRegExp: /style\/(website|design-system).css/,
                    cssProcessor: require('cssnano')
                }),
                new TerserPlugin({
                    include: /.*app.js/,
                    exclude: /\/scss/
                })
            ]
        },

        /**
         * Generates source maps
         */
        devtool: 'source-maps'
    };
};
