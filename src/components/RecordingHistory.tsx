import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Play, 
  Download, 
  Trash2, 
  FileVideo, 
  Calendar,
  Clock,
  HardDrive
} from "lucide-react";
import { useState } from "react";

interface RecordingHistoryProps {
  recordings: string[];
}

export const RecordingHistory = ({ recordings }: RecordingHistoryProps) => {
  const [selectedRecording, setSelectedRecording] = useState<string | null>(null);

  // Mock recording data - in real app this would come from props/API
  const mockRecordings = [
    {
      id: '1',
      filename: 'motion-detected-2024-01-15-14-30-00.webm',
      date: '2024-01-15',
      time: '14:30:00',
      duration: '00:02:15',
      size: '45.2 MB',
      type: 'Motion Detection',
      url: '#'
    },
    {
      id: '2',
      filename: 'manual-recording-2024-01-15-12-15-30.webm',
      date: '2024-01-15',
      time: '12:15:30',
      duration: '00:05:42',
      size: '89.7 MB',
      type: 'Manual',
      url: '#'
    },
    {
      id: '3',
      filename: 'alarm-triggered-2024-01-14-23-45-12.webm',
      date: '2024-01-14',
      time: '23:45:12',
      duration: '00:01:33',
      size: '28.1 MB',
      type: 'Alarm Triggered',
      url: '#'
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Motion Detection':
        return 'bg-warning text-warning-foreground';
      case 'Alarm Triggered':
        return 'bg-destructive text-destructive-foreground';
      case 'Manual':
        return 'bg-primary text-primary-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const handlePlay = (url: string) => {
    setSelectedRecording(url);
  };

  const handleDownload = (recording: any) => {
    // In a real app, this would download the actual file
    console.log('Downloading:', recording.filename);
  };

  const handleDelete = (id: string) => {
    // In a real app, this would delete the recording
    console.log('Deleting recording:', id);
  };

  return (
    <Card className="p-4 border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileVideo className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Recording History</h3>
          <Badge variant="secondary" className="text-xs">
            {mockRecordings.length} recordings
          </Badge>
        </div>
        
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <HardDrive className="w-3 h-3" />
          <span>Total: 163.0 MB</span>
        </div>
      </div>

      {mockRecordings.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <FileVideo className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>No recordings yet</p>
          <p className="text-xs">Start recording to see your footage here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {mockRecordings.map((recording) => (
            <div
              key={recording.id}
              className="p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge 
                      className={`text-xs px-2 py-0 ${getTypeColor(recording.type)}`}
                    >
                      {recording.type}
                    </Badge>
                    <span className="text-xs text-muted-foreground font-mono">
                      {recording.filename}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {recording.date}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {recording.time}
                    </div>
                    <span>Duration: {recording.duration}</span>
                    <span>Size: {recording.size}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handlePlay(recording.url)}
                    className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(recording)}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
                    <Download className="w-3 h-3" />
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(recording.id)}
                    className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};