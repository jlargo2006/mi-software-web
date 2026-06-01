@echo off

echo.
echo ===== DEPLOY TO GITHUB + VERCEL =====
echo.

git status

echo.
set /p msg=Commit message: 

git add .
git commit -m "%msg%"
git push

echo.
echo Deployment sent to GitHub.
echo Vercel will update automatically.
echo.

pause