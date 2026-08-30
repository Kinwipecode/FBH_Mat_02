# FBH Materialplaner - Professional Layout Sync Manager Desktop App (WPF GUI)
Add-Type -AssemblyName PresentationFramework, System.Windows.Forms, System.Drawing

$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Location).Path }

$configPath = Join-Path $scriptDir "layout_sync_app_config.json"
$defaultJsonPath = Join-Path $scriptDir "menu_layout.json"
$defaultJsPath = Join-Path $scriptDir "default_toolbar_layout.js"

$savedJsonPath = $defaultJsonPath
$savedJsPath = $defaultJsPath

if (Test-Path $configPath) {
    try {
        $config = Get-Content -Raw -Path $configPath -Encoding UTF8 | ConvertFrom-Json
        if ($config.lastJsonPath -and (Test-Path $config.lastJsonPath)) {
            $savedJsonPath = $config.lastJsonPath
        }
        if ($config.lastJsPath -and (Test-Path $config.lastJsPath)) {
            $savedJsPath = $config.lastJsPath
        }
    } catch {}
}

[xml]$xaml = @"
<Window xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
        xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml"
        Title="FBH Material Rechner - Layout Sync Manager" 
        Height="500" Width="680"
        WindowStartupLocation="CenterScreen" 
        Background="#0f172a" 
        Foreground="#f8fafc" 
        ResizeMode="NoResize"
        FontFamily="Segoe UI">
    
    <Window.Resources>
        <Style TargetType="Button">
            <Setter Property="Background" Value="#0078d7"/>
            <Setter Property="Foreground" Value="White"/>
            <Setter Property="FontSize" Value="13"/>
            <Setter Property="FontWeight" Value="SemiBold"/>
            <Setter Property="Padding" Value="10,6"/>
            <Setter Property="BorderThickness" Value="0"/>
            <Setter Property="Cursor" Value="Hand"/>
        </Style>
    </Window.Resources>

    <Grid Margin="25">
        <Grid.RowDefinitions>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="Auto"/>
            <RowDefinition Height="*"/>
            <RowDefinition Height="Auto"/>
        </Grid.RowDefinitions>

        <!-- Header -->
        <StackPanel Grid.Row="0" Margin="0,0,0,20">
            <TextBlock Text="FBH Layout Sync Manager" FontSize="20" FontWeight="Bold" Foreground="#38bdf8"/>
            <TextBlock Text="Synchronisiert Ihre menu_layout.json Datei mit dem App-Code (default_toolbar_layout.js)" FontSize="12" Foreground="#94a3b8" Margin="0,4,0,0"/>
        </StackPanel>

        <!-- Form Inputs -->
        <StackPanel Grid.Row="1" Margin="0,0,0,15">
            <TextBlock Text="Quell-Datei (menu_layout.json):" FontSize="13" FontWeight="SemiBold" Foreground="#e2e8f0" Margin="0,0,0,6"/>
            <Grid Margin="0,0,0,15">
                <Grid.ColumnDefinitions>
                    <Grid.ColumnDefinition Width="*"/>
                    <Grid.ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                <TextBox Name="TxtJsonPath" Grid.Column="0" Height="34" Padding="8,6" Background="#1e293b" Foreground="#f8fafc" BorderBrush="#334155" FontSize="12" VerticalContentAlignment="Center"/>
                <Button Name="BtnBrowseJson" Grid.Column="1" Content="Durchsuchen..." Margin="8,0,0,0" Height="34" Width="140" Background="#334155"/>
            </Grid>

            <TextBlock Text="Ziel-Code-Datei (default_toolbar_layout.js):" FontSize="13" FontWeight="SemiBold" Foreground="#e2e8f0" Margin="0,0,0,6"/>
            <Grid>
                <Grid.ColumnDefinitions>
                    <Grid.ColumnDefinition Width="*"/>
                    <Grid.ColumnDefinition Width="Auto"/>
                </Grid.ColumnDefinitions>
                <TextBox Name="TxtJsPath" Grid.Column="0" Height="34" Padding="8,6" Background="#1e293b" Foreground="#f8fafc" BorderBrush="#334155" FontSize="12" VerticalContentAlignment="Center"/>
                <Button Name="BtnBrowseJs" Grid.Column="1" Content="Durchsuchen..." Margin="8,0,0,0" Height="34" Width="140" Background="#334155"/>
            </Grid>
        </StackPanel>

        <!-- Checkbox Options -->
        <StackPanel Grid.Row="2" Margin="0,0,0,15">
            <CheckBox Name="ChkAutoClose" Content="Nach erfolgreicher Synchronisation nach 2 Sekunden automatisch schliessen" Foreground="#cbd5e1" IsChecked="True" FontSize="12"/>
        </StackPanel>

        <!-- Status / Log Box -->
        <Border Grid.Row="3" Background="#1e293b" BorderBrush="#334155" BorderThickness="1" CornerRadius="6" Padding="12" Margin="0,0,0,20">
            <ScrollViewer VerticalScrollBarVisibility="Auto">
                <TextBlock Name="TxtLog" Text="Bereit. Waehlen Sie bei Bedarf eine abweichende menu_layout.json Datei." Foreground="#a3e635" FontFamily="Consolas" FontSize="12" TextWrapping="Wrap"/>
            </ScrollViewer>
        </Border>

        <!-- Action Button -->
        <Button Name="BtnSync" Grid.Row="4" Height="42" Content="Layout jetzt synchronisieren &amp; anwenden" Background="#10b981" FontSize="14" FontWeight="Bold"/>
    </Grid>
</Window>
"@

$reader = (New-Object System.Xml.XmlNodeReader $xaml)
$window = [Windows.Markup.XamlReader]::Load($reader)

$TxtJsonPath = $window.FindName("TxtJsonPath")
$TxtJsPath = $window.FindName("TxtJsPath")
$BtnBrowseJson = $window.FindName("BtnBrowseJson")
$BtnBrowseJs = $window.FindName("BtnBrowseJs")
$BtnSync = $window.FindName("BtnSync")
$TxtLog = $window.FindName("TxtLog")
$ChkAutoClose = $window.FindName("ChkAutoClose")

$TxtJsonPath.Text = $savedJsonPath
$TxtJsPath.Text = $savedJsPath

# Browse JSON Button
$BtnBrowseJson.Add_Click({
    $dlg = New-Object System.Windows.Forms.OpenFileDialog
    $dlg.Filter = "JSON Layout-Dateien (*.json)|*.json|Alle Dateien (*.*)|*.*"
    $dlg.Title = "menu_layout.json Quell-Datei auswaehlen"
    if (Test-Path $TxtJsonPath.Text) {
        $dlg.InitialDirectory = [System.IO.Path]::GetDirectoryName($TxtJsonPath.Text)
        $dlg.FileName = [System.IO.Path]::GetFileName($TxtJsonPath.Text)
    }
    if ($dlg.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $TxtJsonPath.Text = $dlg.FileName
        $TxtLog.Text = "Quell-Datei geaendert: " + $dlg.FileName
        $TxtLog.Foreground = "#38bdf8"
    }
})

# Browse JS Button
$BtnBrowseJs.Add_Click({
    $dlg = New-Object System.Windows.Forms.OpenFileDialog
    $dlg.Filter = "JavaScript Dateien (*.js)|*.js|Alle Dateien (*.*)|*.*"
    $dlg.Title = "default_toolbar_layout.js Ziel-Datei auswaehlen"
    if (Test-Path $TxtJsPath.Text) {
        $dlg.InitialDirectory = [System.IO.Path]::GetDirectoryName($TxtJsPath.Text)
        $dlg.FileName = [System.IO.Path]::GetFileName($TxtJsPath.Text)
    }
    if ($dlg.ShowDialog() -eq [System.Windows.Forms.DialogResult]::OK) {
        $TxtJsPath.Text = $dlg.FileName
        $TxtLog.Text = "Ziel-Datei geaendert: " + $dlg.FileName
        $TxtLog.Foreground = "#38bdf8"
    }
})

# Sync Action Button
$BtnSync.Add_Click({
    $jsonP = $TxtJsonPath.Text.Trim()
    $jsP = $TxtJsPath.Text.Trim()

    if (-not (Test-Path $jsonP)) {
        $TxtLog.Text = "[FEHLER] Die Quell-Datei '$jsonP' existiert nicht!"
        $TxtLog.Foreground = "#f87171"
        return
    }

    try {
        $TxtLog.Text = "Synchronisiere Layout..."
        $TxtLog.Foreground = "#facc15"

        $rawJson = Get-Content -Raw -Path $jsonP -Encoding UTF8
        $jsonObj = $rawJson | ConvertFrom-Json

        if (-not $jsonObj.updatedAt) {
            $jsonObj | Add-Member -NotePropertyName "updatedAt" -NotePropertyValue ([DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds())
        } else {
            $jsonObj.updatedAt = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        }

        $jsonFormatted = $jsonObj | ConvertTo-Json -Depth 10
        Set-Content -Path $jsonP -Value $jsonFormatted -Encoding UTF8

        $jsContent = "// FBH Materialplaner - Standard Menue-Layout Konfiguration`nwindow.DEFAULT_TOOLBAR_LAYOUT = " + $jsonFormatted + ";"
        Set-Content -Path $jsP -Value $jsContent -Encoding UTF8

        # Save config file for next launch
        $cfgObj = @{
            lastJsonPath = $jsonP
            lastJsPath = $jsP
            lastSync = (Get-Date).ToString("yyyy-MM-dd HH:mm:ss")
        }
        $cfgObj | ConvertTo-Json | Set-Content -Path $configPath -Encoding UTF8

        $TxtLog.Text = "[ERFOLG] Layout wurde erfolgreich von '$jsonP' nach '$jsP' uebertragen und in allen Browsern aktiviert!`n`nKonfiguration gespeichert."
        $TxtLog.Foreground = "#4ade80"

        if ($ChkAutoClose.IsChecked) {
            $window.Close()
        }

    } catch {
        $TxtLog.Text = "[FEHLER] Bei der Synchronisation: " + $_.Exception.Message
        $TxtLog.Foreground = "#f87171"
    }
})

$window.ShowDialog() | Out-Null
