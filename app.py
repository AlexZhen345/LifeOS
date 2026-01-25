import gradio as gr
import subprocess
import os

# 构建前端项目
def build_frontend():
    if not os.path.exists('build'):
        print("Building frontend...")
        subprocess.run(['npm', 'install'], check=True)
        subprocess.run(['npm', 'run', 'build'], check=True)
    else:
        print("Build directory already exists, skipping build...")

# 尝试构建项目
try:
    build_frontend()
except Exception as e:
    print(f"Build failed: {e}")

# 使用 Gradio 的静态文件服务
app = gr.Blocks()

with app:
    gr.HTML("""
    <style>
        .gradio-container {
            max-width: 100% !important;
            padding: 0 !important;
        }
        #app-frame {
            width: 100%;
            height: 100vh;
            border: none;
        }
    </style>
    <iframe id="app-frame" src="/file=build/index.html"></iframe>
    """)

if __name__ == "__main__":
    app.launch(
        server_name="0.0.0.0",
        server_port=7860,
        allowed_paths=["build"]
    )
