import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Clock, 
  HardDrive, 
  Wifi, 
  Battery, 
  Thermometer,
  Activity
} from "lucide-react";
import { useState, useEffect } from "react";

interface StatusBarProps {
  isRecording: boolean;
  alarmActive: boolean;
  cameraConnected: boolean;
}

export const StatusBar = ({ isRecording, alarmActive, cameraConnected }: StatusBarProps) => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [systemTemp, setSystemTemp] = useState(42);
  const [cpuUsage, setCpuUsage] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      // Simulate system metrics
      setSystemTemp(40 + Math.random() * 10);
      setCpuUsage(10 + Math.random() * 30);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <Card className="p-4 mb-6 border-border">
      <div className="flex items-center justify-between">
        {/* Left side - Time and Date */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-primary" />
            <div>
              <div className="text-lg font-mono font-bold text-primary">
                {formatTime(currentTime)}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDate(currentTime)}
              </div>
            </div>
          </div>

          {/* System Status */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Activity className="w-3 h-3 text-accent" />
              <span className="text-xs text-muted-foreground">CPU</span>
              <span className="text-xs font-mono text-accent">{cpuUsage.toFixed(0)}%</span>
            </div>
            
            <div className="flex items-center gap-1">
              <Thermometer className="w-3 h-3 text-warning" />
              <span className="text-xs text-muted-foreground">Temp</span>
              <span className="text-xs font-mono text-warning">{systemTemp.toFixed(0)}°C</span>
            </div>
          </div>
        </div>

        {/* Center - System Alerts */}
        <div className="flex items-center gap-3">
          {alarmActive && (
            <Badge variant="destructive" className="animate-pulse">
              🚨 SECURITY ALERT
            </Badge>
          )}
          
          {isRecording && (
            <Badge variant="destructive" className="animate-pulse">
              ● REC
            </Badge>
          )}

          {!cameraConnected && (
            <Badge variant="destructive">
              📷 CAMERA OFFLINE
            </Badge>
          )}
        </div>

        {/* Right side - Connection and Storage */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <HardDrive className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Storage</span>
            <span className="text-xs font-mono text-foreground">2.3/10 GB</span>
          </div>
          
          <div className="flex items-center gap-1">
            <Wifi className={`w-3 h-3 ${cameraConnected ? 'text-success' : 'text-destructive'}`} />
            <span className="text-xs text-muted-foreground">Network</span>
            <Badge 
              variant={cameraConnected ? "default" : "destructive"}
              className="text-xs px-1 py-0"
            >
              {cameraConnected ? "Online" : "Offline"}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            <Battery className="w-3 h-3 text-success" />
            <span className="text-xs text-muted-foreground">UPS</span>
            <span className="text-xs font-mono text-success">98%</span>
          </div>
        </div>
      </div>
    </Card>
  );
};