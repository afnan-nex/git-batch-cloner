; NSIS Custom Installer Script for Git Batch Cloner
; Force kill any running Git Batch Cloner process before install / uninstall

!macro customInit
  nsExec::Exec 'taskkill /F /IM "Git Batch Cloner.exe"'
  nsExec::Exec 'taskkill /F /IM "Git Cloner.exe"'
  nsExec::Exec 'taskkill /F /IM "git-cloner.exe"'
!macroend

!macro customUnInit
  nsExec::Exec 'taskkill /F /IM "Git Batch Cloner.exe"'
  nsExec::Exec 'taskkill /F /IM "Git Cloner.exe"'
  nsExec::Exec 'taskkill /F /IM "git-cloner.exe"'
!macroend
