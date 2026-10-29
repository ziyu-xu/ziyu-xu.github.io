# Build the Hexo blog

Use Node.js 24.22.1 as specified in `.nvmrc`. Hexo 8 requires Node.js 20.19.0 or newer.

```sh
nvm install
nvm use
npm ci --engine-strict
npm run clean
npm run build
```

Pull requests targeting `source` and pushes to `source` run the same build checks in GitHub Actions.
