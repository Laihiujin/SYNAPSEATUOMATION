; SynapseAutomation NSIS 自定义安装脚本

!macro customInstall
  ; 在这里可以添加自定义安装步骤
  ; 例如：注册表操作、环境变量设置等

  ; 创建用户数据目录
  CreateDirectory "$APPDATA\synapseautomation-desktop"

  ; 写入卸载信息
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\SynapseAutomation" "DisplayName" "SynapseAutomation"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\SynapseAutomation" "Publisher" "SynapseAutomation Team"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\SynapseAutomation" "DisplayIcon" "$INSTDIR\SynapseAutomation.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\SynapseAutomation" "UninstallString" "$INSTDIR\Uninstall.exe"
!macroend

!macro customUnInstall
  ; 在这里可以添加自定义卸载步骤

  ; 删除注册表项
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\SynapseAutomation"

  ; 询问是否删除用户数据
  MessageBox MB_YESNO "是否删除用户数据和配置文件?" IDYES DeleteUserData IDNO KeepUserData
  DeleteUserData:
    RMDir /r "$APPDATA\synapseautomation-desktop"
  KeepUserData:
!macroend
