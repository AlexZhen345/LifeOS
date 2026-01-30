# 🤖 模型模块 (Model)

> **负责人**: 模型组（学长 + CS本科同学）  
> **方向**: 模型效果优化、Prompt设计、RAG、微调

## 目录结构

```
model/
├── prompts/             # Prompt模板
│   ├── task_generation.py
│   └── encouragement.py
├── rag/                 # RAG检索（可选）
├── fine_tuning/         # 模型微调（可选）
├── config.py            # 模型配置
└── requirements.txt
```

## 核心任务

### 1. Prompt工程
编辑 `prompts/task_generation.py`，优化任务生成效果。

### 2. RAG系统（可选）
在 `rag/` 下构建知识库，提升回答准确性。

### 3. 模型微调（可选）
在 `fine_tuning/` 下准备数据集和训练脚本。

## 快速开始

```bash
# 安装依赖
pip install -r requirements.txt

# 编辑Prompt模板
# vim prompts/task_generation.py

# 测试效果（需要后端运行）
# 后端会自动调用最新的Prompt
```

## 与后端对接

后端在 `backend/core/llm_client.py` 中调用Prompt模板：
- 编辑 `prompts/` 下的文件
- 后端会自动使用最新版本
- 无需手动通知（代码层面自动同步）

输出格式变更时需告知后端组。
