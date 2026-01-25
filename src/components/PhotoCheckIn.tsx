import { useState, useRef, useEffect } from 'react';
import { Camera, X, Check, RotateCcw, Image as ImageIcon } from 'lucide-react';

interface PhotoCheckInProps {
  taskTitle: string;
  onConfirm: (photoData: string | null) => void;
  onCancel: () => void;
}

export function PhotoCheckIn({ taskTitle, onConfirm, onCancel }: PhotoCheckInProps) {
  const [mode, setMode] = useState<'choice' | 'camera' | 'preview'>('choice');
  const [photoData, setPhotoData] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      // 清理摄像头流
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startCamera = async () => {
    setMode('camera');
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' },
        audio: false 
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error('无法访问摄像头:', err);
      setCameraError('无法访问摄像头，请检查权限设置');
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const takePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const data = canvas.toDataURL('image/jpeg', 0.8);
        setPhotoData(data);
        setMode('preview');
        stopCamera();
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setPhotoData(event.target?.result as string);
        setMode('preview');
      };
      reader.readAsDataURL(file);
    }
  };

  const retake = () => {
    setPhotoData(null);
    setMode('choice');
  };

  const handleConfirm = () => {
    onConfirm(photoData);
  };

  const handleSkip = () => {
    onConfirm(null);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-[#fffef9] w-full max-w-sm rounded-2xl overflow-hidden border-2 border-[#e8e3d6]">
        {/* Header */}
        <div className="px-4 py-3 bg-[#2d5f3f] flex items-center justify-between">
          <h3 className="ios-text text-base font-semibold text-white">打卡完成</h3>
          <button onClick={onCancel} className="p-1 hover:bg-white/20 rounded-full transition-colors">
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        <div className="p-4">
          {/* 任务信息 */}
          <div className="bg-[#2d5f3f]/10 rounded-xl p-3 mb-4 border-2 border-[#2d5f3f]/20">
            <div className="flex items-center gap-2">
              <Check className="w-5 h-5 text-[#2d5f3f]" />
              <span className="ios-text text-sm font-medium text-[#2d5f3f]">{taskTitle}</span>
            </div>
          </div>

          {/* 选择模式 */}
          {mode === 'choice' && (
            <div className="space-y-3">
              <p className="ios-text text-sm text-[#737373] text-center mb-4">
                拍照记录你的成果，让打卡更有仪式感
              </p>
              
              <button
                onClick={startCamera}
                className="w-full flex items-center justify-center gap-2 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white py-3 rounded-xl ios-text font-medium transition-colors"
              >
                <Camera className="w-5 h-5" />
                拍照打卡
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 bg-[#f5f1e8] hover:bg-[#e8e3d6] text-[#4a4a4a] py-3 rounded-xl ios-text font-medium transition-colors"
              >
                <ImageIcon className="w-5 h-5" />
                从相册选择
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileSelect}
              />

              <button
                onClick={handleSkip}
                className="w-full text-[#737373] hover:text-[#4a4a4a] py-2 ios-text text-sm transition-colors"
              >
                跳过，直接完成
              </button>
            </div>
          )}

          {/* 相机模式 */}
          {mode === 'camera' && (
            <div className="space-y-3">
              {cameraError ? (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl text-center ios-text text-sm border-2 border-red-200">
                  {cameraError}
                  <button
                    onClick={() => setMode('choice')}
                    className="block w-full mt-3 text-[#2d5f3f] font-medium"
                  >
                    返回
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] border-2 border-[#e8e3d6]">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={() => {
                        stopCamera();
                        setMode('choice');
                      }}
                      className="p-3 bg-[#f5f1e8] hover:bg-[#e8e3d6] rounded-full transition-colors"
                    >
                      <X className="w-6 h-6 text-[#4a4a4a]" />
                    </button>
                    <button
                      onClick={takePhoto}
                      className="p-4 bg-[#2d5f3f] hover:bg-[#3d7a54] rounded-full transition-colors"
                    >
                      <Camera className="w-8 h-8 text-white" />
                    </button>
                    <div className="w-12" /> {/* Spacer for alignment */}
                  </div>
                </>
              )}
            </div>
          )}

          {/* 预览模式 */}
          {mode === 'preview' && photoData && (
            <div className="space-y-3">
              <div className="relative rounded-xl overflow-hidden aspect-[4/3] border-2 border-[#e8e3d6]">
                <img src={photoData} alt="打卡照片" className="w-full h-full object-cover" />
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={retake}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#f5f1e8] hover:bg-[#e8e3d6] text-[#4a4a4a] py-3 rounded-xl ios-text font-medium transition-colors"
                >
                  <RotateCcw className="w-4 h-4" />
                  重拍
                </button>
                <button
                  onClick={handleConfirm}
                  className="flex-1 flex items-center justify-center gap-2 bg-[#2d5f3f] hover:bg-[#3d7a54] text-white py-3 rounded-xl ios-text font-medium transition-colors"
                >
                  <Check className="w-4 h-4" />
                  确认打卡
                </button>
              </div>
            </div>
          )}
        </div>

        <canvas ref={canvasRef} className="hidden" />
      </div>

      <style>{`
        .ios-text {
          font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif;
        }
      `}</style>
    </div>
  );
}
