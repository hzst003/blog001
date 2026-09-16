# 最简酒水店（单页展示）

Next.js 16 + PocketBase 商品展示页与简易后台。无购物车、订单。

## 启动

**终端 1 — PocketBase**

```powershell
cd ..\pocketbase
.\pocketbase.exe serve
```

首次使用可建表并写入示例商品：

```powershell
cd ..\store0916
npm run setup:pb
```

已有库若需收紧规则 / 对齐分类 / 缩略图规格 / 清理未用集合：

```powershell
npm run harden:pb
```

商品图会按场景使用 PocketBase 缩略图（`100x100` 后台、`400x400` 列表、`800x0` 灯箱），首页与灯箱不直接拉原图。改 thumbs 后请再跑一次 `harden:pb`。

**终端 2 — Next.js**

```powershell
cd store0916
npm run dev
```

打开 http://localhost:3000

`.env.local` 中配置 `POCKETBASE_URL`、`PB_ADMIN_*`、`PB_SUPER_*`（勿使用弱默认密码上线）。

## 功能

- 首页展示店名、在售商品网格（图 / 名称 / 分类 / 价格 / 简介）与联系方式
- 商品数据来自 PocketBase `products` 集合（公开 API 仅 `active = true`）
- `/admin` 需登录；登录一次后 Cookie 保存约 7 天
- 管理页可改店铺信息、账号、商品（含上下架）、图片

初始化后的默认 App admin 见 `setup:pb` 输出（与 `.env.local` 中 `PB_ADMIN_*` 一致）。
