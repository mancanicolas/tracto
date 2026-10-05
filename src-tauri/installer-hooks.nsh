!macro KillRunningTracto
  nsExec::Exec 'taskkill /F /T /IM "${MAINBINARYNAME}.exe"'
  Pop $0
  Sleep 1500
!macroend

!macro NSIS_HOOK_PREINSTALL
  !insertmacro KillRunningTracto
!macroend

!macro NSIS_HOOK_PREUNINSTALL
  !insertmacro KillRunningTracto
!macroend
