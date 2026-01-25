import gradio as gr

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
