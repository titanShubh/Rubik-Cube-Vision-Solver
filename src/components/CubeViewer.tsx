
import { useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CubeViewerProps {
  cubeState: string[][][];
}

export const CubeViewer = ({ cubeState }: CubeViewerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !cubeState.length) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw a simple 2D representation of the cube
    const squareSize = 30;
    const gap = 2;
    
    // Color mapping
    const colors: { [key: string]: string } = {
      'white': '#ffffff',
      'yellow': '#ffff00',
      'red': '#ff0000',
      'orange': '#ff8800',
      'blue': '#0000ff',
      'green': '#00ff00'
    };

    // Draw the unfolded cube pattern
    const drawFace = (face: string[][], startX: number, startY: number) => {
      for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
          const x = startX + j * (squareSize + gap);
          const y = startY + i * (squareSize + gap);
          
          ctx.fillStyle = colors[face[i][j]] || '#cccccc';
          ctx.fillRect(x, y, squareSize, squareSize);
          
          ctx.strokeStyle = '#333333';
          ctx.lineWidth = 1;
          ctx.strokeRect(x, y, squareSize, squareSize);
        }
      }
    };

    // Layout the faces in a cross pattern
    const faceSize = 3 * squareSize + 2 * gap;
    const centerX = canvas.width / 2 - faceSize / 2;
    const centerY = canvas.height / 2 - faceSize / 2;

    // Draw faces (mock layout)
    if (cubeState.length >= 6) {
      // Top
      drawFace(cubeState[4], centerX, centerY - faceSize - gap);
      // Left, Front, Right
      drawFace(cubeState[3], centerX - faceSize - gap, centerY);
      drawFace(cubeState[0], centerX, centerY);
      drawFace(cubeState[2], centerX + faceSize + gap, centerY);
      // Bottom
      drawFace(cubeState[5], centerX, centerY + faceSize + gap);
    }

  }, [cubeState]);

  return (
    <Card className="bg-slate-800/30 border-slate-700">
      <CardHeader>
        <CardTitle className="text-white text-lg">Cube State</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex justify-center">
          <canvas 
            ref={canvasRef}
            width={400}
            height={300}
            className="border border-slate-600 rounded-lg bg-slate-900/50"
          />
        </div>
      </CardContent>
    </Card>
  );
};
