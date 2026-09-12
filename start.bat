@echo off
chcp 65001 > nul
echo ============================================
echo   PCHub - Next.js Rebuilt Web Server
echo   Khoi dong web server Next.js...
echo ============================================
echo.

SET NODE_PATH=C:\Program Files\Microsoft Visual Studio\18\Insiders\MSBuild\Microsoft\VisualStudio\NodeJs
SET PATH=%NODE_PATH%;%PATH%

echo [1] Kiem tra Node.js...
node -v
if errorlevel 1 (
    echo [LOI] Khong tim thay Node.js!
    pause
    exit /b 1
)

echo [2] Di chuyen vao thu muc Next.js...
cd pchub-next

echo [3] Cai dat dependencies (neu chua co)...
if not exist "node_modules" (
    npm install
)

echo.
echo [4] Khoi dong server Next.js tren cong 3000...
echo.
echo   Truy cap web tai: http://localhost:3000
echo   API endpoint: http://localhost:3000/api
echo.
echo   De ket noi PostgreSQL, chinh sua file pchub-next\.env
echo.
echo ============================================
npm run dev
