# 🛠️ SodaSpeedMatch 开发环境搭建指南

本指南详细介绍 **SodaSpeedMatch** 的开发环境安装、数据库配置及运行步骤。

---

## 1️⃣ **安装开发环境**

### 1.1 **安装 Git**（用于代码管理）

- 下载安装：[Git 官网](https://git-scm.com/downloads)
- 检查是否安装成功：
  ```bash
  git --version
  ```

### 1.2 **安装 Node.js 18+**（运行前端 & Electron）

- 下载安装：[Node.js 官网](https://nodejs.org/)
- 检查是否安装成功：
  ```bash
  node -v
  npm -v
  ```

### 1.3 **安装 VS Code**（推荐的开发工具）

- 下载安装：[VS Code 官网]\([https://code.visualstudio.com/）](https://code.visualstudio.com/）)

### 1.4 **安装 Python 3.10+**（Supabase CLI 依赖）

- 下载安装：[Python 官网](https://www.python.org/downloads/)
- 检查是否安装成功：
  ```bash
  python --version
  ```

### 1.5 **安装 Supabase CLI**（数据库管理工具）

- 运行命令安装：
  ```bash
  npm install -g supabase
  ```
- 检查是否安装成功：
  ```bash
  supabase --version
  ```

---

## 2️⃣ **配置 Supabase 远程数据库**

本项目使用 **Supabase 托管的 PostgreSQL**，无需本地运行数据库。

### 2.1 **创建 Supabase 项目**

1. 访问 [Supabase 官网](https://supabase.com/)，注册并创建一个新项目。
2. 进入项目 **Dashboard**，点击 `Database` 选项卡。
3. 复制 `Connection String`（格式如下）：
   ```
   postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres
   ```

### 2.2 **配置环境变量**（❗不要将数据库密码上传到 GitHub）

1. 在 `backend/.env` 文件中添加数据库连接信息：

```ini
DATABASE_URL=postgresql://postgres:[YOUR_PASSWORD]@db.[YOUR_PROJECT_ID].supabase.co:5432/postgres
```

2. **在 GitHub 上共享数据库信息的方法**（避免直接暴露密码）：
   - **方法 1**：让团队成员手动创建 `.env` 文件，并私下分享 `DATABASE_URL`。

### 2.3 **初始化数据库**

使用 Flask-Migrate 自动创建数据表：
运行以下命令：

```bash
cd /backend
flask db init
```

这将创建一个 `migrations` 文件夹

```bash
flask db migrate -m "Initial migration"
flask db upgrade
```

后续更新数据表时运行以下指令：

```bash
flask db migrate -m "Add something"
flask db upgrade
```


如果选择手动创建：
运行以下命令，将 `schema.sql` 结构导入 Supabase 数据库：

```bash
psql -h db.[YOUR_PROJECT_ID].supabase.co -p 5432 -U postgres -d postgres -f db/schema.sql
```

---

## 3️⃣ **安装 & 运行前端（React + Electron）**

### 3.1 **安装前端依赖**

```bash
cd frontend
npm install
```

### 3.2 **运行前端**

```bash
npm run dev
```

### 3.3 **运行桌面端（Electron）**

```bash
npm run electron
```

---

## 4️⃣ **GitHub 相关配置**

### 4.1 **初始化 Git 仓库**

```bash
git init
git add .
git commit -m "Initial commit"
```

### 4.2 **添加远程仓库**

```bash
git remote add origin https://github.com/你的GitHub用户名/SodaSpeedMatch.git
git branch -M main
git push -u origin main
```

### 4.3 **创建 ****`.gitignore`****（忽略不必要的文件）**

在 `SodaSpeedMatch/.gitignore` 添加：

```
node_modules/
dist/
.env
supabase/
```

---

## 5️⃣ **常见问题 & 解决方案**

### ❓ `npm install` 失败？

✅ 解决方案：

```bash
rm -rf node_modules package-lock.json
npm install
```

### ❓ Supabase 连接失败？

✅ 解决方案：

```bash
确保 `DATABASE_URL` 正确，并检查网络是否可访问 Supabase。
```

---

✅ **现在，你的环境已准备就绪！开始开发吧 🚀！**

