# 体育场馆预约记录 PWA 1.0.0

这是为 iPhone 15 / iOS 26.1 适配的免费离线网页 App。

在线安装地址：<https://tom-cc-dance.github.io/venue-record-pwa/>

## 已包含

- 管理首页、新增预约、管理历史预约和展示页面
- 三条默认预约记录
- 本地保存预约和聊天消息
- JSON 导出备份与导入恢复
- 主屏幕图标、独立 App 显示模式和 iPhone 安全区适配
- Service Worker 离线缓存
- “详情”跳转至中山大学官网

## GitHub Pages 部署

1. 在 GitHub 新建一个 **Public** 仓库，例如 `venue-record-pwa`。
2. 将本目录中的全部文件和 `icons` 文件夹上传至仓库根目录；不要只上传 ZIP 文件。
3. 打开仓库的 `Settings` → `Pages`。
4. 在 `Build and deployment` 中选择 `Deploy from a branch`。
5. Branch 选择 `main`，目录选择 `/ (root)`，然后保存。
6. 等待 GitHub 显示网站地址，通常形如 `https://你的用户名.github.io/venue-record-pwa/`。

## 安装到 iPhone

1. 使用 iPhone 的 Safari 打开 GitHub Pages 地址。
2. 等待页面完整打开一次。
3. 点击 Safari 的“共享”按钮，选择“添加到主屏幕”。
4. 打开“作为网页 App 打开”，点击“添加”。
5. 回到主屏幕，点击蓝色“馆”图标启动。
6. 第一次安装完成后，关闭网络再次启动，可验证离线运行。

## 数据安全

记录仅保存在当前网页 App 的本地存储中。清除 Safari 网站数据或移除网页 App 可能删除数据；请定期在管理首页点击“导出备份”，并将 JSON 文件保存到“文件”App 或 iCloud Drive。恢复时点击“导入恢复”。

更新网页文件不会主动清除既有记录，但正式更新前仍建议先导出备份。
