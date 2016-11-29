var path = require('path');
var utils = require('./utils');
var fse = require('fs-extra');

module.exports = function (dir, options) {
    console.log('build begin');

    dir = dir || '.';
    var outputDir = path.resolve(options.output || dir);
    console.log('outputDir', outputDir);
    // 写入文件
    function outputFile(file, content) {
        console.log('生成页面：%s', file.slice(outputDir.length + 1));

        fse.outputFileSync(file, content);

    }

    // 生成文章页面内容
    var sourceDir = path.resolve(dir, '_posts');
    utils.eachSourceFile(sourceDir, function (f, s) {
        var html = utils.renderPost(dir, f);
        var relativeFile = utils.stripExtname(f.slice(sourceDir.length + 1)) + '.html';
        var file = path.resolve(outputDir, 'posts', relativeFile);
        outputFile(file, html);

    });

    // 生成首页
    var htmlIndex = utils.renderIndex(dir);
    var fileIndex = path.resolve(outputDir, 'index.html');
    outputFile(fileIndex, htmlIndex);
};
