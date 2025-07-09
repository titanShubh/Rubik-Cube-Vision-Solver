
import { useState, useRef } from "react";
import { Camera, Upload, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CubeCaptureProps {
  onSideCapture: (image: string, sideIndex: number) => void;
  capturedSides: string[];
}

const CUBE_SIDES = [
  { name: 'Front', color: 'bg-blue-500', position: 'front' },
  { name: 'Back', color: 'bg-green-500', position: 'back' },
  { name: 'Right', color: 'bg-red-500', position: 'right' },
  { name: 'Left', color: 'bg-orange-500', position: 'left' },
  { name: 'Top', color: 'bg-yellow-500', position: 'top' },
  { name: 'Bottom', color: 'bg-white', position: 'bottom' }
];

export const CubeCapture = ({ onSideCapture, capturedSides }: CubeCaptureProps) => {
  const [selectedSide, setSelectedSide] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && selectedSide !== null) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageData = e.target?.result as string;
        onSideCapture(imageData, selectedSide);
        setSelectedSide(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSideClick = (index: number) => {
    setSelectedSide(index);
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {CUBE_SIDES.map((side, index) => (
          <Card 
            key={side.name}
            className={`relative cursor-pointer transition-all duration-300 hover:scale-105 ${
              capturedSides[index] ? 'border-green-500 bg-green-500/10' : 'border-slate-600 hover:border-slate-500'
            }`}
            onClick={() => handleSideClick(index)}
          >
            <CardContent className="p-4">
              <div className="flex flex-col items-center space-y-3">
                {capturedSides[index] ? (
                  <>
                    <div className="relative w-16 h-16 rounded-lg overflow-hidden">
                      <img 
                        src={capturedSides[index]} 
                        alt={`${side.name} side`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                        <Check className="text-green-500" size={20} />
                      </div>
                    </div>
                    <Badge variant="secondary" className="bg-green-500/20 text-green-400">
                      Captured
                    </Badge>
                  </>
                ) : (
                  <>
                    <div className={`w-16 h-16 rounded-lg ${side.color} flex items-center justify-center`}>
                      <Camera className="text-white" size={24} />
                    </div>
                    <Badge variant="outline" className="border-slate-600 text-slate-400">
                      Click to capture
                    </Badge>
                  </>
                )}
                <span className="text-sm font-medium text-white">{side.name}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      <div className="text-center">
        <p className="text-slate-400 text-sm">
          Captured: {capturedSides.filter(Boolean).length} / 6 sides
        </p>
        <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(capturedSides.filter(Boolean).length / 6) * 100}%` }}
          />
        </div>
      </div>
    </div>
  );
};
