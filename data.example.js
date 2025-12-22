/* 
  Bonfire - data.example.js
  このファイルを data.js としてコピーすると、内容が反映されます。
*/

var bonfireData = `
# Bonfire 🔥

あなただけのミニマルなポータルサイトへようこそ。
(Ctrl + B でこのテキストを自由に書き換えられます)

::: center
image@:bonfire.png
## 灯を絶やさない
日々のタスク、アイデア、よく使うリンクをここに集約しましょう。
:::

::: grid
::: card 🎨 デザイン & インスピレーション
- [Dribbble](https://dribbble.com) icon:globe
- [Pinterest](https://pinterest.com) icon:star
- [Coolors](https://coolors.co) icon:pen
:::

::: card 🛠️ 開発ツール
- [GitHub](https://github.com) icon:house
- [Stack Overflow](https://stackoverflow.com) icon:circle-question
- [Linear](https://linear.app) icon:check-double
:::

::: card 📚 学習 & ドキュメント
- [MDN Web Docs](https://developer.mozilla.org) icon:book
- [Web.dev](https://web.dev) icon:lightbulb
- [Zenn](https://zenn.dev) icon:pencil
:::
:::

---

## 🚀 プロジェクト
::: link [Bonfire Repository](https://github.com/craftpaperbag/bonfire)
### Bonfire Project icon:fire
ミニマルでカスタマイズ性の高い自分専用のダッシュボード。
Markdown だけで直感的に構成を変更できます。
:::

## 📋 クイックアクション
::: button https://github.com/new
新しいリポジトリを作成
:::

::: grid
button [ChatGPT を開く](https://chatgpt.com)
|
button [Google 検索](https://google.com)
:::

---

## 📖 記法ガイド
Bonfire では通常の Markdown に加え、専用の拡張記法が使用可能です。

### 1. レイアウトブロック
- **カード**: \`::: card タイトル\` ... \`:::\` で内容を囲みます。
- **グリッド**: \`::: grid\` ... \`:::\` で要素を囲むと、中のアイテムが横に並びます。 \`|\` で明示的に列を区切ることもできます。
- **センター**: \`::: center\` ... \`:::\` で中央寄せにします。

### 2. インライン要素
- **アイコン**: \`icon:アイコン名\` で FontAwesome のアイコンを表示します。 (例: icon:fire icon:star icon:gear)
- **画像**:
  - \`image:filename.png\` で丸角画像を表示
  - \`image@:filename.png\` で円形のプロフィール画像を表示
- **補足テキスト**: \`( )\` で囲むと (このように) 控えめな色になります。

### 3. 特殊なリンク
- **リンクカード**:
  \`\`\`markdown
  ::: link [ラベル](URL)
  ### タイトル
  説明文など
  :::
  \`\`\`
- **ボタン**:
  - ブロック型: \`::: button URL\` ボタンテキスト \`:::\`
  - インライン型: \`button [テキスト](URL)\`
- **ローカルパス**: \`[My Documents](file:///C:/Users/User/Documents)\`
  クリックするとパスをクリップボードにコピーします。 (ローカル、共有フォルダ、ファイルに対応)

> **Pro Tip**: エディタの「顔マーク」ボタンからアイコン一覧を表示し、クリックするだけで記法をコピーできます。
(自動保存機能により、編集内容はブラウザに一時保存されます)
`;
