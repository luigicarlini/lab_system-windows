@echo off
setlocal

REM Set MongoDB variables
set MONGO_BIN_PATH=C:\Program Files\MongoDB\Server\7.0\bin
set DB_NAME=instrumentDB
set BACKUP_PATH=C:\MongoDB_Backup

REM Set the number of days for backup retention
set RETENTION_DAYS=30

REM Create a backup
echo Creating backup...
"%MONGO_BIN_PATH%\mongodump" --db %DB_NAME% --out "%BACKUP_PATH%\backup_%date:~-4,4%%date:~-10,2%%date:~-7,2%"

REM Delete backups older than the retention period
echo Deleting backups older than %RETENTION_DAYS% days...
forfiles /p "%BACKUP_PATH%" /s /m *.* /d -%RETENTION_DAYS% /c "cmd /c del @path"

echo Backup and cleanup process completed.
endlocal
