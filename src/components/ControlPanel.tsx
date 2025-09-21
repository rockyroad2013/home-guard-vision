import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Video, 
  Camera, 
  Bell, 
  BellOff, 
  Volume2, 
  VolumeX, 
  Settings,
  Download,
  Trash2
} from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface ControlPanelProps {
  isRecording: boolean;
  alarmActive: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onAlarmToggle: () => void;
  cameraConnected: boolean;
  nightVision: boolean;
  onNightVisionToggle: () => void;
}

export const ControlPanel = ({
  isRecording,
  alarmActive,
  onStartRecording,
  onStopRecording,
  onAlarmToggle,
  cameraConnected,
  nightVision,
  onNightVisionToggle
}: ControlPanelProps) => {
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [motionDetection, setMotionDetection] = useState(true);
  const { storageInfo, clearAllFiles } = useLocalStorage();

  return (
    <Card className="p-4 space-y-4 border-border">
      <div className="flex items-center gap-2 mb-4">
        <Settings className="w-5 h-5 text-primary" />
        <h3 className="font-semibold">Control Panel</h3>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Quick Actions</h4>
        
        <Button
          className={`w-full justify-start ${
            isRecording 
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
              : 'bg-primary hover:bg-primary/90 text-primary-foreground'
          }`}
          onClick={isRecording ? onStopRecording : onStartRecording}
          disabled={!cameraConnected}
        >
          <Video className="w-4 h-4 mr-2" />
          {isRecording ? 'Stop Recording' : 'Start Recording'}
        </Button>

        <Button
          className={`w-full justify-start ${
            alarmActive 
              ? 'bg-destructive hover:bg-destructive/90 text-destructive-foreground' 
              : 'bg-warning hover:bg-warning/90 text-warning-foreground'
          }`}
          onClick={onAlarmToggle}
        >
          {alarmActive ? <BellOff className="w-4 h-4 mr-2" /> : <Bell className="w-4 h-4 mr-2" />}
          {alarmActive ? 'Disable Alarm' : 'Enable Alarm'}
        </Button>
      </div>

      <Separator />

      {/* System Settings */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-muted-foreground">System Settings</h4>
        
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              <span className="text-sm">Sound Alerts</span>
            </div>
            <Switch
              checked={soundEnabled}
              onCheckedChange={setSoundEnabled}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              <span className="text-sm">Night Vision</span>
            </div>
            <Switch
              checked={nightVision}
              onCheckedChange={onNightVisionToggle}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4" />
              <span className="text-sm">Motion Detection</span>
            </div>
            <Switch
              checked={motionDetection}
              onCheckedChange={setMotionDetection}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Status Information */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">System Status</h4>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Camera Status</span>
            <Badge variant={cameraConnected ? "default" : "destructive"} className="text-xs">
              {cameraConnected ? "Online" : "Offline"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Recording</span>
            <Badge variant={isRecording ? "destructive" : "secondary"} className="text-xs">
              {isRecording ? "Active" : "Inactive"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Alarm System</span>
            <Badge variant={alarmActive ? "destructive" : "secondary"} className="text-xs">
              {alarmActive ? "Armed" : "Disarmed"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Motion Detection</span>
            <Badge variant={motionDetection ? "default" : "secondary"} className="text-xs">
              {motionDetection ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </div>
      </div>

      <Separator />

      {/* Storage Management */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">Storage</h4>
        
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="flex-1" disabled>
            <Download className="w-3 h-3 mr-1" />
            Export
          </Button>
          <Button size="sm" variant="outline" className="flex-1" onClick={clearAllFiles}>
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
        
        <div className="text-xs text-muted-foreground">
          <div className="flex justify-between">
            <span>Used Storage:</span>
            <span>{(storageInfo.used / (1024 * 1024)).toFixed(1)} MB / {(storageInfo.total / (1024 * 1024 * 1024)).toFixed(0)} GB</span>
          </div>
          <div className="w-full bg-muted rounded-full h-1 mt-1">
            <div className="bg-primary h-1 rounded-full transition-all duration-300" style={{ width: `${Math.min((storageInfo.used / storageInfo.total) * 100, 100)}%` }}></div>
          </div>
        </div>
      </div>
    </Card>
  );
};