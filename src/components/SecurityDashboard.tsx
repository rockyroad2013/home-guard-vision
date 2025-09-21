import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CameraFeed } from "./CameraFeed";
import { ControlPanel } from "./ControlPanel";
import { StatusBar } from "./StatusBar";
import { RecordingHistory } from "./RecordingHistory";
import { Shield, Camera, AlertTriangle, Wifi, WifiOff } from "lucide-react";

export const SecurityDashboard = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [alarmActive, setAlarmActive] = useState(false);
  const [cameraConnected, setCameraConnected] = useState(false);
  const [recordings, setRecordings] = useState<string[]>([]);
  const [nightVision, setNightVision] = useState(false);
  const alarmAudioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    // Check camera availability
    navigator.mediaDevices.getUserMedia({ video: true })
      .then(() => setCameraConnected(true))
      .catch(() => setCameraConnected(false));
  }, []);

  const handleStartRecording = () => {
    setIsRecording(true);
  };

  const handleStopRecording = (recordingUrl: string) => {
    setIsRecording(false);
    setRecordings(prev => [...prev, recordingUrl]);
  };

  const handleAlarmToggle = () => {
    setAlarmActive(prev => {
      const newState = !prev;
      if (newState && alarmAudioRef.current) {
        alarmAudioRef.current.currentTime = 0;
        alarmAudioRef.current.play().catch(console.error);
      } else if (!newState && alarmAudioRef.current) {
        alarmAudioRef.current.pause();
        alarmAudioRef.current.currentTime = 0;
      }
      return newState;
    });
  };

  const handleNightVisionToggle = () => {
    setNightVision(prev => !prev);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10 border border-primary/20">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Security Monitor</h1>
              <p className="text-muted-foreground">Home surveillance system</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {cameraConnected ? (
                <>
                  <Wifi className="w-4 h-4 text-success" />
                  <Badge variant="outline" className="border-success text-success">
                    Camera Online
                  </Badge>
                </>
              ) : (
                <>
                  <WifiOff className="w-4 h-4 text-destructive" />
                  <Badge variant="outline" className="border-destructive text-destructive">
                    Camera Offline
                  </Badge>
                </>
              )}
            </div>
            
            {alarmActive && (
              <Badge variant="destructive" className="animate-pulse">
                <AlertTriangle className="w-3 h-3 mr-1" />
                ALARM ACTIVE
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Status Bar */}
      <StatusBar 
        isRecording={isRecording}
        alarmActive={alarmActive}
        cameraConnected={cameraConnected}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Camera Feed - Takes up 2 columns on large screens */}
        <div className="lg:col-span-2">
          <Card className="p-4 border-border">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-primary" />
                <h2 className="text-lg font-semibold">Main Camera</h2>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${cameraConnected ? 'bg-success' : 'bg-destructive'} animate-pulse`} />
                <span className="text-sm text-muted-foreground">
                  {cameraConnected ? 'Live' : 'Offline'}
                </span>
              </div>
            </div>
            
            <CameraFeed 
              onStartRecording={handleStartRecording}
              onStopRecording={handleStopRecording}
              isRecording={isRecording}
              nightVision={nightVision}
              onNightVisionToggle={handleNightVisionToggle}
            />
          </Card>
        </div>

        {/* Control Panel */}
        <div>
          <ControlPanel 
            isRecording={isRecording}
            alarmActive={alarmActive}
            onStartRecording={handleStartRecording}
            onStopRecording={() => handleStopRecording('')}
            onAlarmToggle={handleAlarmToggle}
            cameraConnected={cameraConnected}
            nightVision={nightVision}
            onNightVisionToggle={handleNightVisionToggle}
          />
        </div>
      </div>

      {/* Recording History */}
      <RecordingHistory recordings={recordings} />

      {/* Hidden Audio Element for Alarm */}
      <audio
        ref={alarmAudioRef}
        src="/alarm.flac"
        loop
        preload="auto"
        className="hidden"
      />
    </div>
  );
};