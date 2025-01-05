# Node.jsのベースイメージを使います
FROM node:16

# Chromiumをインストール
RUN apt-get update && apt-get install -y chromium

# 作業ディレクトリを指定
WORKDIR /usr/src/app

# package.jsonとpackage-lock.jsonをコピーしてnpm installを実行
COPY package*.json ./
RUN npm install

# アプリケーションのソースコードをコピー
COPY . .

# アプリケーションを起動するコマンド
CMD ["npm", "start"]
