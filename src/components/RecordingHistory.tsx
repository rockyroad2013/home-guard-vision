import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Play, 
  Download, 
  Trash2, 
  FileVideo, 
  Calendar,
  Clock,
  HardDrive,
  Video,
  Camera,
  Image
} from "lucide-react";
import { useState } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

interface RecordingHistoryProps {
  recordings: string[];
}

export const RecordingHistory = ({ recordings: recordingUrls }: RecordingHistoryProps) => {
  const { files, storageInfo, deleteFile, clearAllFiles, downloadFile } = useLocalStorage();
  const [previewFile, setPreviewFile] = useState<string | null>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const handlePreview = (file: any) => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    const url = URL.createObjectURL(file.blob);
    setPreviewFile(url);
  };

  const closePreview = () => {
    if (previewFile) {
      URL.revokeObjectURL(previewFile);
    }
    setPreviewFile(null);
  };

  const recordings = files.filter(f => f.type === 'recording');
  const screenshots = files.filter(f => f.type === 'screenshot');
  const usedPercentage = (storageInfo.used / storageInfo.total) * 100;

  return (
    <Card className="p-4 border-border">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <FileVideo className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Local Storage</h3>
          <Badge variant="secondary" className="text-xs">
            {files.length} files
          </Badge>
        </div>
        
        {files.length > 0 && (
          <Button size="sm" variant="outline" onClick={clearAllFiles}>
            <Trash2 className="w-3 h-3 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      {/* Storage Usage */}
      <div className="mb-4 p-3 rounded-lg bg-muted/30 border border-border/50">
        <div className="flex justify-between text-sm mb-2">
          <span>Storage Used:</span>
          <span>{formatFileSize(storageInfo.used)} / {formatFileSize(storageInfo.total)}</span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${Math.min(usedPercentage, 100)}%` }}
          />
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          {usedPercentage.toFixed(1)}% used
        </div>
      </div>

      <Tabs defaultValue="recordings" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recordings" className="flex items-center gap-2">
            <Video className="w-4 h-4" />
            Recordings ({recordings.length})
          </TabsTrigger>
          <TabsTrigger value="screenshots" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Screenshots ({screenshots.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recordings" className="space-y-2 max-h-64 overflow-y-auto mt-4">
          {recordings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Video className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No recordings yet</p>
              <p className="text-xs">Start recording to see your files here</p>
            </div>
          ) : (
            recordings.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 border border-primary/20">
                    <Video className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-32">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(file.timestamp)}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePreview(file)}>
                    <Play className="w-3 h-3 mr-1" />
                    Play
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(file)}>
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteFile(file.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>

        <TabsContent value="screenshots" className="space-y-2 max-h-64 overflow-y-auto mt-4">
          {screenshots.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Image className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No screenshots yet</p>
              <p className="text-xs">Take screenshots to see them here</p>
            </div>
          ) : (
            screenshots.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded bg-primary/10 border border-primary/20">
                    <Camera className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium truncate max-w-32">{file.name}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(file.timestamp)}</span>
                      <span>•</span>
                      <span>{formatFileSize(file.size)}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={() => handlePreview(file)}>
                    <Image className="w-3 h-3 mr-1" />
                    View
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => downloadFile(file)}>
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => deleteFile(file.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Enhanced Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4"
          onClick={closePreview}
        >
          <div className="relative max-w-5xl max-h-[90vh] w-full">
            {/* Close Button */}
            <Button
              size="sm"
              variant="outline"
              className="absolute -top-12 right-0 bg-black/50 border-white/20 text-white hover:bg-white/20 z-10"
              onClick={closePreview}
            >
              ✕ Close
            </Button>
            
            <div 
              className="bg-black rounded-lg overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {previewFile.includes('video') || previewFile.includes('webm') ? (
                <video 
                  src={previewFile} 
                  controls 
                  autoPlay
                  className="w-full h-auto max-h-[80vh] rounded-lg"
                  style={{ maxWidth: '100%' }}
                  onLoadStart={() => console.log('Video loading...')}
                  onCanPlay={() => console.log('Video ready to play')}
                  onError={(e) => console.error('Video error:', e)}
                >
                  <p className="text-white p-4">
                    Your browser doesn't support video playback. 
                    <Button 
                      variant="link" 
                      className="text-primary underline ml-2"
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = previewFile;
                        link.download = 'recording.webm';
                        link.click();
                      }}
                    >
                      Download instead
                    </Button>
                  </p>
                </video>
              ) : (
                <img 
                  src={previewFile} 
                  alt="Screenshot preview" 
                  className="w-full h-auto max-h-[80vh] rounded-lg object-contain"
                />
              )}
              
              {/* Media Info Bar */}
              <div className="bg-black/80 text-white p-3 flex justify-between items-center text-sm">
                <div className="flex items-center gap-4">
                  <span>Playing back recorded content</span>
                  <Badge variant="secondary" className="bg-white/20 text-white">
                    {previewFile.includes('video') ? 'Video' : 'Image'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/20"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = previewFile;
                      link.download = previewFile.includes('video') ? 'recording.webm' : 'screenshot.png';
                      link.click();
                    }}
                  >
                    <Download className="w-3 h-3 mr-1" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};