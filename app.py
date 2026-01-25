import gradio as gr
import os

# 读取构建好的 HTML 文件内容
def get_html_content():
    # 读取 CSS 文件
    css_path = os.path.join(os.path.dirname(__file__), 'build', 'assets')
    css_file = [f for f in os.listdir(css_path) if f.endswith('.css')][0]
    with open(os.path.join(css_path, css_file), 'r', encoding='utf-8') as f:
        css_content = f.read()
    
    # 读取 JS 文件
    js_file = [f for f in os.listdir(css_path) if f.endswith('.js')][0]
    with open(os.path.join(css_path, js_file), 'r', encoding='utf-8') as f:
        js_content = f.read()
    
    # 内联 CSS 和 JS 到 HTML 中
    inline_html = f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>LifeOS</title>
    <style>{css_content}</style>
</head>
<body>
    <div id="root"></div>
    <script type="module">{js_content}</script>
</body>
</html>'''
    return inline_html

with gr.Blocks(title="LifeOS") as demo:
    gr.HTML(get_html_content())

if __name__ == "__main__":
    demo.launch(
        server_name="0.0.0.0",
        server_port=7860
    )
