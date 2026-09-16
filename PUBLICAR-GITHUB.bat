@echo off
REM TechFix Pro - Publicador automatico (Windows)
REM Uso: duplo clique, cole seu token OU seu usuario quando pedir
setlocal
cd /d "%~dp0"
where gh >nul 2>nul
if errorlevel 1 (
  echo [ERRO] GitHub CLI (gh) nao encontrado. Instale em https://cli.github.com/
  pause & exit /b 1
)
set /p REPO=Nome do repositorio [assistencia-tecnica]:
if "%REPO%"=="" set REPO=assistencia-tecnica
echo.
echo Faca login (abra o navegador quando pedir)...
call gh auth login -h github.com -p https -w
echo.
echo Criando repo e subindo arquivos (so o conteudo desta pasta = raiz do site)...
call gh repo create %REPO% --public --source=. --remote=origin --push
if errorlevel 1 (
  echo Tentando apenas push (repo ja existe)...
  git branch -M main
  git add .
  git commit -m "TechFix Pro deploy" 2>nul
  git push -u origin main --force
)
echo.
echo Ativando GitHub Pages via Actions...
for /f "tokens=*" %%u in ('gh api user -q .login') do set OWNER=%%u
call gh api repos/%OWNER%/%REPO%/pages -X POST -f build_type=workflow >nul 2>nul
echo.
echo Aguarde 1-2 min e acesse:
echo   https://%OWNER%.github.io/%REPO%/
echo.
echo Se der 404 nos primeiros segundos e normal: Actions ainda compilando. Veja em: https://github.com/%OWNER%/%REPO%/actions
pause
