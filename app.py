import gradio as gr
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import uvicorn

# 创建 FastAPI 应用
app = FastAPI()

# 挂载静态文件目录
app.mount("/assets", StaticFiles(directory="build/assets"), name="assets")

# 主页返回 index.html
@app.get("/")
async def root():
    return FileResponse("build/index.html")

# 创建一个空的 Gradio 应用以满足 ModelScope 要求
with gr.Blocks() as demo:
    gr.Markdown("# LifeOS 应用正在加载...")
    gr.Markdown("如果没有自动跳转，请点击 [这里](/) 访问应用")

# 挂载 Gradio 到 /gradio 路径
app = gr.mount_gradio_app(app, demo, path="/gradio")

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=7860)
