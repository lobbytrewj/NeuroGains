import { useEffect, useRef, useState } from 'react';
import { Pose } from '@mediapipe/pose';
import { Camera } from '@mediapipe/camera_utils';

interface NeuralVideoFeedProps {
  stability: number;
  fatigue: number;
  isCalibrating: boolean;
  currentAngle?: number;
  repState?: number;
  onPoseLandmarks?: (landmarks: any[]) => void;
}

export const NeuralVideoFeed = ({
  stability,
  fatigue,
  isCalibrating,
  currentAngle = 180,
  repState = 0,
  onPoseLandmarks
}: NeuralVideoFeedProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);

  useEffect(() => {
    if (!videoRef.current || !canvasRef.current) return;

    const pose = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });

    pose.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    pose.onResults((results) => {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      if (!canvas || !video) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      ctx.save();
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (results.poseLandmarks) {
        const skeletonColor = getSkeletonColor(stability, fatigue, isCalibrating);
        drawSkeleton(ctx, results.poseLandmarks, canvas.width, canvas.height, skeletonColor);
        drawAngleGauge(ctx, results.poseLandmarks, canvas.width, canvas.height, currentAngle, repState);

        if (onPoseLandmarks) {
          onPoseLandmarks(results.poseLandmarks);
        }
      }

      ctx.restore();
    });

    poseRef.current = pose;

    const camera = new Camera(videoRef.current, {
      onFrame: async () => {
        if (videoRef.current && poseRef.current) {
          await poseRef.current.send({ image: videoRef.current });
        }
      },
      width: 1280,
      height: 720,
    });

    camera
      .start()
      .then(() => {
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to access camera');
        setIsLoading(false);
        console.error('Camera error:', err);
      });

    cameraRef.current = camera;

    return () => {
      if (cameraRef.current) {
        cameraRef.current.stop();
      }
      if (poseRef.current) {
        poseRef.current.close();
      }
    };
  }, []);

  const getSkeletonColor = (stability: number, fatigue: number, isCalibrating: boolean): string => {
    if (isCalibrating) return '#FCD34D';

    if (stability > 85) return '#06B6D4';
    if (stability > 70) return '#22D3EE';
    if (stability > 55) return '#FB923C';
    return '#EF4444';
  };

  const drawSkeleton = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number,
    color: string
  ) => {
    const connections = [
      [11, 13], [13, 15], [12, 14], [14, 16],
      [11, 12], [11, 23], [12, 24], [23, 24],
      [23, 25], [25, 27], [24, 26], [26, 28],
    ];

    ctx.strokeStyle = color;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';

    if (color === '#EF4444') {
      ctx.shadowColor = color;
      ctx.shadowBlur = 15;
    }

    connections.forEach(([start, end]) => {
      const startLandmark = landmarks[start];
      const endLandmark = landmarks[end];

      if (startLandmark && endLandmark) {
        ctx.beginPath();
        ctx.moveTo(startLandmark.x * width, startLandmark.y * height);
        ctx.lineTo(endLandmark.x * width, endLandmark.y * height);
        ctx.stroke();
      }
    });

    ctx.shadowBlur = 0;

    ctx.fillStyle = color;
    landmarks.forEach((landmark) => {
      if (landmark.visibility && landmark.visibility > 0.5) {
        ctx.beginPath();
        ctx.arc(landmark.x * width, landmark.y * height, 6, 0, 2 * Math.PI);
        ctx.fill();
      }
    });
  };

  const drawAngleGauge = (
    ctx: CanvasRenderingContext2D,
    landmarks: any[],
    width: number,
    height: number,
    angle: number,
    state: number
  ) => {
    const leftElbow = landmarks[13];
    const rightElbow = landmarks[14];

    [leftElbow, rightElbow].forEach((elbow) => {
      if (!elbow || elbow.visibility < 0.5) return;

      const x = elbow.x * width;
      const y = elbow.y * height;
      const radius = 50;

      ctx.save();

      ctx.strokeStyle = 'rgba(6, 182, 212, 0.3)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.stroke();

      const arcColor =
        state === 0 ? '#06B6D4' :
        state === 1 ? '#FB923C' :
        state === 2 ? '#EF4444' :
        '#22C55E';

      const normalizedAngle = Math.max(0, Math.min(180, angle));
      const arcAngle = (normalizedAngle / 180) * Math.PI * 2;

      ctx.strokeStyle = arcColor;
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(x, y, radius, -Math.PI / 2, -Math.PI / 2 + arcAngle);
      ctx.stroke();

      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.fillRect(x - 30, y - 40, 60, 24);

      ctx.fillStyle = arcColor;
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(`${Math.round(angle)}°`, x, y - 28);

      ctx.restore();
    });
  };

  return (
    <div className="relative w-full h-full bg-slate-900 rounded-lg overflow-hidden border-2 border-cyan-500/30">
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        playsInline
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
          <div className="text-cyan-400 text-lg font-mono animate-pulse">
            INITIALIZING NEURAL TRACKING...
          </div>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-900/90">
          <div className="text-red-400 text-lg font-mono">{error}</div>
        </div>
      )}

      <div className="absolute top-4 left-4 bg-slate-950/80 px-4 py-2 rounded border border-cyan-500/50">
        <div className="text-cyan-400 text-xs font-mono uppercase tracking-wider">
          Neural Skeleton Overlay
        </div>
        <div className="text-white text-sm font-mono mt-1">
          {isCalibrating ? 'CALIBRATING...' : 'ACTIVE'}
        </div>
      </div>

      <div className="absolute top-4 right-4 bg-slate-950/80 px-4 py-2 rounded border border-cyan-500/50">
        <div className="text-cyan-400 text-xs font-mono uppercase tracking-wider">
          Stability Status
        </div>
        <div className={`text-lg font-mono mt-1 ${
          stability > 85 ? 'text-cyan-400' : stability > 70 ? 'text-yellow-400' : 'text-red-400'
        }`}>
          {stability.toFixed(1)}%
        </div>
      </div>
    </div>
  );
};
