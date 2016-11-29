var path = require('path');
var fs = require('fs');
var MarkdownIt = require('markdown-it');
var md = new MarkdownIt({
    html: true,
    langPrefix: 'code-'
});
var rd = require('rd');

var swig = require('swig');
swig.setDefaults({ cache: false });



// 去掉文件名中的扩展名
function stripExtname(name) {
    console.log('original name', name);
    console.log('path.extname(name)', path.extname(name));
    var i = 0 - path.extname(name).length;
    if (i === 0) { i = name.length; };
    return name.slice(0, i);
}

function markdownToHTML(content) {
    return md.render(content || '');
}

// 解析文章内容
function parseSourceContent(data) {
    var split = '---\n';
    console.log('length of \n', '\n'.length);
    var i = data.indexOf(split);
    console.log('i', i);
    var info = {};

    if (i !== -1) {
        console.log('i + split.length', i + split.length);
        var j = data.indexOf(split, i + split.length);
        console.log('j', j);
        if (j !== -1) {
            var str = data.slice(i + split.length, j).trim();
            console.log('str', str, 'endofstr');
            console.log('data', data);
            data = data.slice(j + split.length);
            console.log('dataafter', data);
            str.split('\n').forEach(function (line) {
                var i = line.indexOf(':');
                if (i !== -1) {
                    var name = line.slice(0, i).trim();
                    var value = line.slice(i + 1).trim();
                    info[name] = value;
                }

            });
        }
    }
    info.source = data;
    return info;
}


function renderFile(file, data) {
    return swig.render(fs.readFileSync(file).toString(), {
        filename: file,
        autoescape: false,
        locals: data
    });
}

function eachSourceFile(sourceDir, callback) {
    rd.eachFileFilterSync(sourceDir, /\.md$/, callback);

}

function renderPost(dir, file) {
    var content = fs.readFileSync(file).toString();
    var post = parseSourceContent(content.toString());
    post.content = markdownToHTML(post.source);
    post.layout = post.layout || 'post';
    var config = loadConfig(dir);
    var layout = path.resolve(dir, '_layout', post.layout + '.html');


    var html = renderFile(layout, { post: post, config: config });
    return html;
}

function renderIndex(dir) {
    var list = [];
    var sourceDir = path.resolve(dir, '_posts');
    eachSourceFile(sourceDir, function (f, s) {
        var source = fs.readFileSync(f).toString();
        var post = parseSourceContent(source);
        post.timeStamp = new Date(post.date);
        post.url = '/posts/' + stripExtname(f.slice(sourceDir.length + 1)) + '.html';
        list.push(post);
    });

    list.sort(function (a, b) {
        return b.timeStamp - a.timeStamp;
    });

    var config = loadConfig(dir);
    var layout = path.resolve(dir, '_layout', 'index.html');

    var html = renderFile(layout, {
        posts: list,
        config: config
    });
    return html;
}

// 读取配置文件
function loadConfig(dir) {
    var content = fs.readFileSync(path.resolve(dir, 'config.json')).toString();
    var data = JSON.parse(content);
    return data;
}

exports.renderPost = renderPost;
exports.renderIndex = renderIndex;
exports.stripExtname = stripExtname;
exports.eachSourceFile = eachSourceFile;
exports.loadConfig = loadConfig;
