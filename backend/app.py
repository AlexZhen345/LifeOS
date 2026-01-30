from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import ai, tasks

# 创建 FastAPI 应用
app = FastAPI(title="LifeOS API", version="1.0.0")

# 配置CORS（允许前端跨域访问）
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册API路由
app.include_router(ai.router, prefix="/api/v1", tags=["AI"])
app.include_router(tasks.router, prefix="/api/v1", tags=["Tasks"])

@app.get("/")
async def root():
    """API根路径"""
    return {
        "message": "LifeOS API Server",
        "version": "1.0.0",
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
