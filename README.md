# Soda-速搭

## 项目简介
Soda-速搭是一个跨平台的搭子匹配应用，支持 **Windows / macOS / Linux**，结合 **Electron + React + Supabase** 实现 **创建、申请、参加活动** 等功能。

## 🌟 功能亮点
✅ **智能匹配**：基于兴趣、时间、课程等自动推荐最佳搭子  
✅ **私聊/群聊**：支持匿名或实名聊天，自动建群  
✅ **信誉系统**：根据用户历史违约情况评估可靠性  
✅ **时间协调**：提供日历功能，便于安排活动  

## 技术栈
- 后端: Python (FastAPI), PostgreSQL
- 前端: React.js, Electron
- 数据库托管: Supabase

## 如何运行
1. 克隆仓库
2. 执行以下脚本
   ```bash
   cd backend
   pip install -r requirements.txt
   cd ../frontend
   npm install
   tsc
   cd..
   npm run dev