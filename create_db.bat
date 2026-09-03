@echo off
set PGPASSWORD=1111
"D:\SQL2022\pgsql\bin\psql.exe" -U postgres -h localhost -p 5432 -c "SELECT version();"
if %errorlevel% == 0 (
    echo.
    echo [OK] Ket noi PostgreSQL thanh cong!
    echo Tao database pccomponents...
    "D:\SQL2022\pgsql\bin\psql.exe" -U postgres -h localhost -p 5432 -c "CREATE DATABASE pccomponents ENCODING UTF8 TEMPLATE template0;"
    echo.
    echo [OK] Database da duoc tao!
) else (
    echo [LOI] Khong ket noi duoc PostgreSQL. Kiem tra lai mat khau trong file .env
)
pause
