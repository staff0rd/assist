export const captureWindowPs1 = `
param([string]$ProcessName, [string]$OutputPath)

Add-Type -AssemblyName System.Drawing

Add-Type @"
using System;
using System.Runtime.InteropServices;
public class Win32Window {
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetProcessDPIAware();

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool IsIconic(IntPtr hWnd);

    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);

    [DllImport("dwmapi.dll")]
    public static extern int DwmGetWindowAttribute(
        IntPtr hwnd, int dwAttribute, out RECT pvAttribute, int cbAttribute);

    [DllImport("user32.dll")]
    public static extern IntPtr GetDC(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern int ReleaseDC(IntPtr hWnd, IntPtr hDC);

    [DllImport("gdi32.dll")]
    public static extern IntPtr CreateCompatibleDC(IntPtr hdc);

    [DllImport("gdi32.dll")]
    public static extern IntPtr CreateCompatibleBitmap(IntPtr hdc, int w, int h);

    [DllImport("gdi32.dll")]
    public static extern IntPtr SelectObject(IntPtr hdc, IntPtr h);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool BitBlt(
        IntPtr hdc, int x, int y, int cx, int cy,
        IntPtr hdcSrc, int x1, int y1, uint rop);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool DeleteObject(IntPtr ho);

    [DllImport("gdi32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool DeleteDC(IntPtr hdc);

    [StructLayout(LayoutKind.Sequential)]
    public struct RECT {
        public int Left;
        public int Top;
        public int Right;
        public int Bottom;
    }
}
"@

# DPI awareness ensures all coordinates are in physical pixels
[Win32Window]::SetProcessDPIAware() | Out-Null

$procs = Get-Process -Name $ProcessName -ErrorAction SilentlyContinue |
    Where-Object { $_.MainWindowHandle -ne [IntPtr]::Zero }

if (-not $procs) {
    Write-Error "No visible window found for process '$ProcessName'"
    exit 1
}

$proc = $procs | Select-Object -First 1
$hwnd = $proc.MainWindowHandle

if ([Win32Window]::IsIconic($hwnd)) {
    [Win32Window]::ShowWindow($hwnd, 9) | Out-Null   # SW_RESTORE
    Start-Sleep -Milliseconds 300
}

# DWMWA_EXTENDED_FRAME_BOUNDS (9) = visible bounds excluding invisible DWM shadow
$rect = New-Object Win32Window+RECT
$hr = [Win32Window]::DwmGetWindowAttribute(
    $hwnd, 9, [ref]$rect,
    [System.Runtime.InteropServices.Marshal]::SizeOf($rect))

if ($hr -ne 0) {
    Write-Error "Failed to get window bounds (HRESULT: $hr)"
    exit 1
}

$width  = $rect.Right  - $rect.Left
$height = $rect.Bottom - $rect.Top

if ($width -le 0 -or $height -le 0) {
    Write-Error "Window has invalid dimensions ($width x $height)"
    exit 1
}

# BitBlt from screen DC — both coords and capture use physical pixels
$hdcScreen = [Win32Window]::GetDC([IntPtr]::Zero)
$hdcMem    = [Win32Window]::CreateCompatibleDC($hdcScreen)
$hBitmap   = [Win32Window]::CreateCompatibleBitmap($hdcScreen, $width, $height)
$hOld      = [Win32Window]::SelectObject($hdcMem, $hBitmap)

$SRCCOPY = 0x00CC0020
[Win32Window]::BitBlt($hdcMem, 0, 0, $width, $height,
    $hdcScreen, $rect.Left, $rect.Top, $SRCCOPY) | Out-Null

$bitmap = [System.Drawing.Image]::FromHbitmap($hBitmap)
$bitmap.Save($OutputPath, [System.Drawing.Imaging.ImageFormat]::Png)
$bitmap.Dispose()

[Win32Window]::SelectObject($hdcMem, $hOld) | Out-Null
[Win32Window]::DeleteObject($hBitmap) | Out-Null
[Win32Window]::DeleteDC($hdcMem) | Out-Null
[Win32Window]::ReleaseDC([IntPtr]::Zero, $hdcScreen) | Out-Null

Write-Output $OutputPath
`;
