import { useRef, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Camera, Video, Square, Pause, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CameraFeedProps {
  onStartRecording: () => void;
  onStopRecording: (recordingUrl: string) => void;
  isRecording: boolean;
}

export const CameraFeed = ({ onStartRecording, onStopRecording, isRecording }: CameraFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720 },
        audio: true 
      });
      
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setIsPlaying(true);
      }
      
      toast({
        title: "Camera Connected",
        description: "Live feed is now active",
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

  const takeScreenshot = () => {
    if (!videoRef.current) return;

    const canvas = document.createElement('canvas');
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `screenshot-${new Date().toISOString()}.png`;
          a.click();
          
          toast({
            title: "Screenshot Taken",
            description: "Image saved to downloads",
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

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        onStopRecording(url);
        
        // Auto-download the recording
        const a = document.createElement('a');
        a.href = url;
        a.download = `recording-${new Date().toISOString()}.webm`;
        a.click();
        
        toast({
          title: "Recording Saved",
          description: "Video saved to downloads",
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
      {/* Video Feed */}
      <div className="relative aspect-video bg-muted rounded-lg overflow-hidden border border-border">
        <video
          ref={videoRef}
          autoPlay
          muted
          className="w-full h-full object-cover"
          onLoadedMetadata={() => {
            if (videoRef.current) {
              videoRef.current.play();
            }
          }}
        />
        
        {/* Overlay Controls */}
        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300">
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