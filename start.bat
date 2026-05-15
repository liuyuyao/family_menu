@echo off
chcp 65001 >nul
cd /d "%~dp0"
echo ========================================
echo    帆帆菜单 - 本地服务器
echo ========================================
echo.
echo 正在查找本机IP...

for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /i "IPv4" ^| findstr /v "127.0.0.1"') do (
    set "raw=%%a"
    goto :found
)

:found
if defined raw (
    set "IP=%raw:~1%"
    echo 本机IP: %IP%
    echo.
    echo 电脑访问: http://localhost:8080
    echo 手机访问: http://%IP%:8080
    echo.
    echo 请确保手机和电脑连接同一个WiFi
    echo ========================================
    echo.
) else (
    echo 未找到IP，请手动查看
    echo 电脑访问: http://localhost:8080
)

python -m http.server 8080
pause
