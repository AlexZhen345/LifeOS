import gradio as gr
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# 创建 FastAPI 应用
app = FastAPI()

# 挂载静态文件目录到 /app 路径
app.mount("/app/assets", StaticFiles(directory="build/assets"), name="assets")

# React 应用入口
@app.get("/app")
@app.get("/app/")
async def react_app():
    return FileResponse("build/index.html")

# 创建 Gradio 应用 - 会自动在 / 处提供 /config 端点
with gr.Blocks(title="LifeOS") as demo:
    gr.HTML("""
    <div style="text-align: center; padding: 50px;">
        <h1>🌟 LifeOS - 人生成长伴侣</h1>
        <p style="font-size: 18px; margin: 20px 0;">您的个人任务规划与成长助手</p>
        <a href="/app" style="display: inline-block; padding: 15px 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; border-radius: 30px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
            🚀 进入应用
        </a>
    </div>
    """)

# 将 Gradio 挂载到根路径
app = gr.mount_gradio_app(app, demo, path="/")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=7860)
