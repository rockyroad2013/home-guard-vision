import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Video, Square, Pause, Play, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface CameraFeedProps {
  onStartRecording: () => void;
  onStopRecording: (recordingUrl: string) => void;
  isRecording: boolean;
  nightVision: boolean;
  onNightVisionToggle: () => void;
}

export const CameraFeed = ({ onStartRecording, onStopRecording, isRecording, nightVision, onNightVisionToggle }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [selectedCamera, setSelectedCamera] = useState<string>('');
  const { toast } = useToast();
  const { saveRecording, saveScreenshot } = useLocalStorage();

  useEffect(() => {
    getCameraDevices();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (selectedCamera) {
      startCamera(selectedCamera);
    }
  }, [selectedCamera]);

  const getCameraDevices = async () => {
    try {
      // Request permission first
      await navigator.mediaDevices.getUserMedia({ video: true });
      
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      
      setAvailableCameras(videoDevices);
      
      if (videoDevices.length > 0 && !selectedCamera) {
        setSelectedCamera(videoDevices[0].deviceId);
      }
      
      toast({
        title: "Cameras Detected",
        description: `Found ${videoDevices.length} camera(s)`,
      });
    } catch (error) {
      console.error("Error getting camera devices:", error);
      toast({
        title: "Camera Detection Failed",
        description: "Unable to detect camera devices",
        variant: "destructive",
      });
    }
  };

  const startCamera = async (deviceId?: string) => {
    try {
      // Stop existing stream
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints: MediaStreamConstraints = {
        video: deviceId ? 
          { deviceId: { exact: deviceId }, width: 1280, height: 720 } :
          { width: 1280, height: 720 },
        audio: true
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsPlaying(true);
      }
      
      // Get camera label for toast
      const cameraLabel = availableCameras.find(cam => cam.deviceId === deviceId)?.label || "Default Camera";
      
      toast({
        title: "Camera Connected",
        description: `${cameraLabel} is now active`,
      });
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Camera Error",
        description: "Unable to access camera. Please check permissions.",
        variant: "destructive",
      });
    }
  };

  const takeScreenshot = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      // Apply night vision filter if enabled
      if (nightVision) {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        for (let i = 0; i < data.length; i += 4) {
          const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
          data[i] = 0;     // Red
          data[i + 1] = avg; // Green (enhanced for night vision)
          data[i + 2] = 0;   // Blue
        }
        
        ctx.putImageData(imageData, 0, 0);
      }
      
      canvas.toBlob(async (blob) => {
        if (blob) {
          await saveScreenshot(blob);
          toast({
            title: "Screenshot Saved",
            description: "Screenshot stored locally on your device",
          });
        }
      });
    }
  };

  const startRecording = () => {
    if (!stream) return;

    try {
      const mediaRecorder = new MediaRecorder(stream);
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (event) => {
        chunks.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        await saveRecording(blob);
        onStopRecording('');
        
        toast({
          title: "Recording Saved",
          description: "Video stored locally on your device",
        });
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      onStartRecording();
    } catch (error) {
      console.error("Error starting recording:", error);
      toast({
        title: "Recording Error",
        description: "Unable to start recording",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* Camera Controls */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex-1">
          <Select value={selectedCamera} onValueChange={setSelectedCamera}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Camera" />
            </SelectTrigger>
            <SelectContent>
              {availableCameras.map((camera) => (
                <SelectItem key={camera.deviceId} value={camera.deviceId}>
                  {camera.label || `Camera ${camera.deviceId.slice(0, 8)}...`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <Button
          size="sm"
          variant={nightVision ? "default" : "outline"}
          onClick={onNightVisionToggle}
          className={nightVision ? "bg-success hover:bg-success/90 text-success-foreground" : "border-success text-success hover:bg-success hover:text-success-foreground"}
        >
          {nightVision ? <Eye className="w-4 h-4 mr-2" /> : <EyeOff className="w-4 h-4 mr-2" />}
          Night Vision
        </Button>
      </div>

      {/* Video Feed */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-border">
        <video
          ref={videoRef}
          autoPlay
          muted
          className={`w-full h-full object-cover transition-all duration-300 ${
            nightVision 
              ? 'filter brightness-75 contrast-150 hue-rotate-90 saturate-50' 
              : ''
          }`}
          style={nightVision ? {
            filter: 'brightness(0.8) contrast(1.5) hue-rotate(90deg) saturate(0.5) sepia(0.3)',
            backgroundColor: '#001100'
          } : {}}
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play();
            }
          }}
        />
        
        {/* Night Vision Overlay */}
        {nightVision && (
          <div className="absolute inset-0 bg-gradient-to-b from-green-900/10 to-green-800/20 pointer-events-none">
            <div className="absolute top-4 right-4 text-green-400 text-xs font-mono bg-black/50 px-2 py-1 rounded">
              NIGHT VISION ACTIVE
            </div>
          </div>
        )}

        {/* Overlay Controls */}
        <div className={`absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 ${
          nightVision ? 'bg-green-900/20' : 'bg-black/20'
        }`}>
          <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="secondary"
                onClick={togglePlayPause}
                className="bg-black/50 hover:bg-black/70 text-white border-none"
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
            </div>
            
            <div className="text-white text-sm bg-black/50 px-2 py-1 rounded">
              {isRecording && (
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
                  REC
                </div>
              )}
            </div>
          </div>
        </div>

        {!stream && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="text-center">
              <Camera className="w-12 h-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No camera feed</p>
            </div>
          </div>
        )}
      </div>

      {/* Quick Controls */}
      <div className="flex gap-2 justify-center">
        <Button
          size="sm"
          variant="outline"
          onClick={takeScreenshot}
          disabled={!stream}
          className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
        >
          <Camera className="w-4 h-4 mr-2" />
          Screenshot
        </Button>
        
        {!isRecording ? (
          <Button
            size="sm"
            onClick={startRecording}
            disabled={!stream}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            <Video className="w-4 h-4 mr-2" />
            Start Recording
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={stopRecording}
            className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Square className="w-4 h-4 mr-2" />
            Stop Recording
          </Button>
        )}
      </div>
    </div>
  );
};