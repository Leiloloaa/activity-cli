@echo off
:: 脚本标题
echo ==========================================
echo      活动文案上传环境初始化和启动脚本     
echo ==========================================

:: 设置颜色
setlocal EnableDelayedExpansion
set "GREEN=[92m"
set "YELLOW=[93m"
set "RED=[91m"
set "NC=[0m"

:: 检查 Python 是否已安装
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo !RED!错误: Python 未安装，请先安装 Python!NC!
    exit /b 1
)

:: 获取脚本所在目录
cd /d "%~dp0"

:: 检查虚拟环境是否存在
if not exist "myenv\" (
    echo !YELLOW!虚拟环境不存在，正在创建...!NC!
    python -m venv myenv
    if %ERRORLEVEL% NEQ 0 (
        echo !RED!创建虚拟环境失败!NC!
        exit /b 1
    )
    echo !GREEN!虚拟环境创建成功!NC!
    
    :: 激活虚拟环境
    echo 激活虚拟环境 (Windows)
    call myenv\Scripts\activate
    
    :: 检查是否成功激活虚拟环境
    if %ERRORLEVEL% NEQ 0 (
        echo !RED!激活虚拟环境失败!NC!
        exit /b 1
    )
    
    :: 更新pip和setuptools
    echo !YELLOW!正在更新pip和setuptools...!NC!
    pip install --upgrade pip setuptools wheel
    if %ERRORLEVEL% NEQ 0 (
        echo !RED!更新pip和setuptools失败!NC!
        exit /b 1
    )
    
    :: 单独安装grpcio（处理编译问题）
    echo !YELLOW!正在安装grpcio（可能需要一些时间）...!NC!
    pip install grpcio==1.54.0
    if %ERRORLEVEL% NEQ 0 (
        echo !YELLOW!警告: grpcio安装失败，尝试使用预编译的二进制包...!NC!
        pip install --no-build-isolation grpcio==1.54.0
        if %ERRORLEVEL% NEQ 0 (
            echo !RED!无法安装grpcio，跳过此依赖，部分功能可能不可用!NC!
            :: 继续执行，不中断脚本
        )
    )
    
    :: 安装ddddocr依赖
    echo !YELLOW!正在安装ddddocr及其依赖...!NC!
    pip install numpy onnxruntime Pillow opencv-python-headless
    pip install ddddocr==1.5.6
    if %ERRORLEVEL% NEQ 0 (
        echo !YELLOW!警告: ddddocr安装失败，尝试使用--no-deps选项...!NC!
        pip install --no-deps ddddocr==1.5.6
        if %ERRORLEVEL% NEQ 0 (
            echo !RED!无法安装ddddocr，部分功能可能不可用!NC!
            :: 继续执行，不中断脚本
        )
    )
    
    :: 安装依赖
    echo !YELLOW!正在安装/更新其他依赖...!NC!
    pip install -e . || pip install -e . --no-deps
    if %ERRORLEVEL% NEQ 0 (
        echo !RED!安装依赖失败，尝试逐个安装依赖!NC!
        
        :: 从requirements.txt中逐行读取并安装依赖
        for /F "tokens=*" %%a in (requirements.txt) do (
            echo !YELLOW!正在安装: %%a!NC!
            :: 跳过空行和注释
            echo %%a | findstr /r "^#" >nul 2>&1
            if !ERRORLEVEL! NEQ 0 (
                echo %%a | findstr /r "^grpcio" >nul 2>&1
                if !ERRORLEVEL! NEQ 0 (
                    echo %%a | findstr /r "^ddddocr" >nul 2>&1
                    if !ERRORLEVEL! NEQ 0 (
                        pip install "%%a"
                    )
                )
            )
        )
    )
    
    echo !GREEN!依赖安装成功!NC!
    echo !GREEN!环境初始化完成！!NC!
    echo.
) else (
    echo !GREEN!使用已有的虚拟环境!NC!
    
    :: 激活虚拟环境
    echo 激活虚拟环境 (Windows)
    call myenv\Scripts\activate
    
    :: 检查是否成功激活虚拟环境
    if %ERRORLEVEL% NEQ 0 (
        echo !RED!激活虚拟环境失败!NC!
        exit /b 1
    )
    
    echo !GREEN!环境已激活，开始运行上传脚本!NC!
)

:: 运行上传脚本
echo !YELLOW!启动活动文案上传工具...!NC!
python run_upload.py

:: 如果脚本结束，确保退出虚拟环境
call myenv\Scripts\deactivate 