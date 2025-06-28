# 启动文件，创建并启动应用
from app import create_app
app = create_app()
if __name__ == '__main__':
    app.run(debug=True)