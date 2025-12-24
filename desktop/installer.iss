; SynapseAutomation Inno Setup 安装脚本
; 使用 Inno Setup 替代 electron-builder NSIS
; 支持在安装时解压浏览器，实现即开即用

#define MyAppName "SynapseAutomation"
#define MyAppVersion "0.1.0"
#define MyAppPublisher "SynapseAutomation Team"
#define MyAppURL "https://synapseautomation.com"
#define MyAppExeName "SynapseAutomation.exe"

[Setup]
; 基本信息
AppId={{8F7D2A3B-1C4E-4B5F-9A6D-7E8C9F0A1B2C}
AppName={#MyAppName}
AppVersion={#MyAppVersion}
AppPublisher={#MyAppPublisher}
AppPublisherURL={#MyAppURL}
AppSupportURL={#MyAppURL}
AppUpdatesURL={#MyAppURL}
DefaultDirName={autopf}\{#MyAppName}
DefaultGroupName={#MyAppName}
AllowNoIcons=yes
; LicenseFile=..\LICENSE  ; 可选：如果有 LICENSE 文件，取消此行注释
OutputDir=dist
OutputBaseFilename=SynapseAutomation-Setup-{#MyAppVersion}
; SetupIconFile=resources\icon.ico  ; 可选：如果有图标文件，取消此行注释
Compression=lzma2/max
SolidCompression=yes
WizardStyle=modern
PrivilegesRequired=admin
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
DisableProgramGroupPage=yes
UninstallDisplayIcon={app}\{#MyAppExeName}

; 安装向导页面
DisableWelcomePage=no
DisableDirPage=no
DisableReadyPage=no

[Languages]
Name: "english"; MessagesFile: "compiler:Default.isl"
; 中文语言文件在某些 Inno Setup 版本中可能不存在，暂时禁用
; Name: "chinesesimplified"; MessagesFile: "compiler:Languages\ChineseSimplified.isl"


[Tasks]
Name: "desktopicon"; Description: "{cm:CreateDesktopIcon}"; GroupDescription: "{cm:AdditionalIcons}"; Flags: unchecked

[Files]
; Electron 应用程序主文件
Source: "dist\win-unpacked\*"; DestDir: "{app}"; Flags: ignoreversion recursesubdirs createallsubdirs

; 浏览器 ZIP 文件（将在安装后脚本中解压）
Source: "resources\browsers-zip\chrome-for-testing.zip"; DestDir: "{tmp}"; Flags: deleteafterinstall

[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\{cm:UninstallProgram,{#MyAppName}}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"; Tasks: desktopicon

[Run]
; 安装完成后可选运行应用
Filename: "{app}\{#MyAppExeName}"; Description: "{cm:LaunchProgram,{#MyAppName}}"; Flags: nowait postinstall skipifsilent

[Code]
var
  ProgressPage: TOutputProgressWizardPage;
  BrowsersExtracted: Boolean;

{ 解压 ZIP 文件到指定目录 }
function ExtractZipFile(ZipPath, TargetPath: String): Boolean;
var
  Shell: Variant;
  ZipFile: Variant;
  TargetFolder: Variant;
  ResultCode: Integer;
begin
  Result := False;

  try
    { 使用 PowerShell 解压（Windows 10+ 内置） }
    if Exec('powershell.exe',
      '-NoProfile -ExecutionPolicy Bypass -Command "' +
      'Expand-Archive -Path ''' + ZipPath + ''' -DestinationPath ''' + TargetPath + ''' -Force"',
      '', SW_HIDE, ewWaitUntilTerminated, ResultCode) then
    begin
      Result := (ResultCode = 0);
    end;
  except
    Result := False;
  end;
end;

{ 在安装文件复制之后运行 }
procedure CurStepChanged(CurStep: TSetupStep);
var
  AppDataPath: String;
  BrowsersDir: String;
  ChromeZipPath: String;
  ChromeTargetDir: String;
begin
  if CurStep = ssPostInstall then
  begin
    { 获取用户 AppData 路径 }
    AppDataPath := ExpandConstant('{userappdata}\synapseautomation-desktop');
    BrowsersDir := AppDataPath + '\playwright-browsers';

    { 创建浏览器目录 }
    if not DirExists(BrowsersDir) then
      ForceDirectories(BrowsersDir);

    { 创建进度页面 }
    ProgressPage := CreateOutputProgressPage('正在准备浏览器文件', '这可能需要几分钟，请耐心等待...');
    try
      ProgressPage.Show;
      ProgressPage.SetText('正在解压 Chrome for Testing...', '');
      ProgressPage.SetProgress(0, 100);

      { 解压 Chrome for Testing }
      ChromeZipPath := ExpandConstant('{tmp}\chrome-for-testing.zip');
      ChromeTargetDir := BrowsersDir + '\chrome-for-testing';

      if FileExists(ChromeZipPath) then
      begin
        ProgressPage.SetProgress(10, 100);

        if ExtractZipFile(ChromeZipPath, ChromeTargetDir) then
        begin
          ProgressPage.SetProgress(90, 100);
          BrowsersExtracted := True;

          { 创建标记文件，表示浏览器已安装 }
          SaveStringToFile(BrowsersDir + '\.installed', 'v' + '{#MyAppVersion}', False);
          ProgressPage.SetProgress(100, 100);

          ProgressPage.SetText('浏览器文件准备完成', '');
        end
        else
        begin
          MsgBox('浏览器解压失败，首次启动时将自动下载', mbInformation, MB_OK);
        end;
      end
      else
      begin
        MsgBox('未找到浏览器 ZIP 文件，首次启动时将自动下载', mbInformation, MB_OK);
      end;

    finally
      ProgressPage.Hide;
    end;
  end;
end;

{ 安装完成时显示信息 }
procedure DeinitializeSetup();
begin
  if BrowsersExtracted then
  begin
    MsgBox('安装完成！浏览器已预装，首次启动无需等待下载。', mbInformation, MB_OK);
  end;
end;
