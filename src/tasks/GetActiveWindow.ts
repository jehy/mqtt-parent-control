import GetByShell from './GetByShell';
import isWin from '../lib/isWin';

import type { TaskOptions, TaskType } from './Task';

export type GetActiveWindowConfig = {
  topic: string,
  user: string,
};

export default class GetActiveWindow extends GetByShell {
  public config: GetActiveWindowConfig;

  public name:TaskType = 'GetActiveWindow';

  constructor(config: any, options: TaskOptions) {
    super(config, options);
    this.config = config;
    if (!this.config.user) {
      this.enabled = false;
      this.logs.push('user not found');
    }
    if (isWin) {
      this.command = `Add-Type  @"
 using System;
 using System.Runtime.InteropServices;
 using System.Text;
public class APIFuncs
   {
    [DllImport("user32.dll", CharSet = CharSet.Auto, SetLastError = true)]
   public static extern int GetWindowText(IntPtr hwnd,StringBuilder
lpString, int cch);
    [DllImport("user32.dll", SetLastError=true, CharSet=CharSet.Auto)]
   public static extern IntPtr GetForegroundWindow();
    [DllImport("user32.dll", SetLastError=true, CharSet=CharSet.Auto)]
       public static extern Int32 GetWindowThreadProcessId(IntPtr hWnd,out
Int32 lpdwProcessId);
    [DllImport("user32.dll", SetLastError=true, CharSet=CharSet.Auto)]
       public static extern Int32 GetWindowTextLength(IntPtr hWnd);
    }
"@
 

$w = [apifuncs]::GetForegroundWindow()
$len = [apifuncs]::GetWindowTextLength($w)
$sb = New-Object text.stringbuilder -ArgumentList ($len + 1)
$rtnlen = [apifuncs]::GetWindowText($w,$sb,$sb.Capacity)
write-host "Window Title: $($sb.tostring())"`;
    } else {
      this.command = `su - ${config.user} -c  'DISPLAY=":0" xdotool getwindowfocus getwindowname'`;
    }
  }
}
