# 叶佳辉的个人博客

这是一个纯 HTML、CSS、JavaScript 个人博客，发布地址为：

<https://yejiahui.github.io/>

## 本地预览

直接打开 `index.html` 即可预览。也可以在项目目录运行：

```bash
python3 -m http.server 8000
```

然后访问 <http://localhost:8000>。

## 更新网站

修改 `index.html`、`styles.css`、`script.js` 或 `assets/` 中的素材后，提交并推送到 `main` 分支，GitHub Pages 会自动更新：

```bash
git add .
git commit -m "更新博客内容"
git push origin main
```

项目体验入口和图片路径使用相对路径，新增素材时请放在 `assets/` 目录并同步更新 HTML 引用。
