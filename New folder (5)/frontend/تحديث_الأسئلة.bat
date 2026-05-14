@echo off
echo --- Starting Question Bank Update ---
python update_questions.py
if %errorlevel% neq 0 (
    echo.
    echo [ERROR] There was a problem running the update. 
    echo Make sure Python is installed and update_questions.py is in this folder.
    pause
)
echo Update complete! Please refresh your browser (Ctrl+F5).
pause
