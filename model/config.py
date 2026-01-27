"""
模型配置文件
"""

# 基座模型配置
MODEL_CONFIG = {
    "model_name": "qwen/Qwen2.5-7B-Instruct",  # 默认使用通义千问
    "max_tokens": 2048,
    "temperature": 0.7,
    "top_p": 0.9,
}

# RAG配置
RAG_CONFIG = {
    "embedding_model": "BAAI/bge-small-zh-v1.5",
    "chunk_size": 500,
    "chunk_overlap": 50,
    "top_k": 3,
}

# API配置
API_CONFIG = {
    "dashscope_api_key": "",  # 从环境变量读取
    "timeout": 30,
    "retry_times": 3,
}
