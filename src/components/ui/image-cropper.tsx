import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from './button';
import { Slider } from './slider';
import { Card, CardContent } from './card';
import { Upload, RotateCw, Check, X } from 'lucide-react';

interface ImageCropperProps {
  onCrop: (croppedFile: File) => void;
  onCancel: () => void;
  aspectRatio?: number;
  size?: number;
  initialImage?: File | null;
}

export const ImageCropper: React.FC<ImageCropperProps> = ({
  onCrop,
  onCancel,
  aspectRatio = 1,
  size = 200,
  initialImage = null
}) => {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadImage = useCallback((file: File) => {
    const img = new Image();
    img.onload = () => {
      setImage(img);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    img.src = URL.createObjectURL(file);
  }, []);

  useEffect(() => {
    if (initialImage) {
      loadImage(initialImage);
    }
  }, [initialImage, loadImage]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      loadImage(file);
    }
  };

  const drawPreview = useCallback(() => {
    if (!image || !previewRef.current) return;

    const canvas = previewRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropSize = size;
    canvas.width = cropSize;
    canvas.height = cropSize;

    // Clear canvas
    ctx.clearRect(0, 0, cropSize, cropSize);

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Calculate image dimensions and position
    const imgAspect = image.width / image.height;
    let drawWidth = cropSize * scale;
    let drawHeight = cropSize * scale;

    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect;
    } else {
      drawWidth = drawHeight * imgAspect;
    }

    const drawX = (cropSize - drawWidth) / 2 + position.x;
    const drawY = (cropSize - drawHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    // Draw border
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2 - 1, 0, 2 * Math.PI);
    ctx.stroke();
  }, [image, scale, position, size]);

  useEffect(() => {
    drawPreview();
  }, [drawPreview]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!image) return;
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;
    
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    
    // Limit drag bounds
    const maxOffset = size * scale * 0.4;
    setPosition({
      x: Math.max(-maxOffset, Math.min(maxOffset, newX)),
      y: Math.max(-maxOffset, Math.min(maxOffset, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleCrop = async () => {
    if (!image || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const cropSize = size;
    canvas.width = cropSize;
    canvas.height = cropSize;

    // Clear canvas
    ctx.clearRect(0, 0, cropSize, cropSize);

    // Create circular clipping path
    ctx.save();
    ctx.beginPath();
    ctx.arc(cropSize / 2, cropSize / 2, cropSize / 2, 0, 2 * Math.PI);
    ctx.clip();

    // Calculate image dimensions and position (same as preview)
    const imgAspect = image.width / image.height;
    let drawWidth = cropSize * scale;
    let drawHeight = cropSize * scale;

    if (imgAspect > 1) {
      drawHeight = drawWidth / imgAspect;
    } else {
      drawWidth = drawHeight * imgAspect;
    }

    const drawX = (cropSize - drawWidth) / 2 + position.x;
    const drawY = (cropSize - drawHeight) / 2 + position.y;

    // Draw image
    ctx.drawImage(image, drawX, drawY, drawWidth, drawHeight);
    ctx.restore();

    // Convert to blob and create file
    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'cropped-logo.png', { type: 'image/png' });
        onCrop(file);
      }
    }, 'image/png', 1.0);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">Crop Your Logo</h3>
          <p className="text-sm text-muted-foreground">
            Upload an image and adjust the position and zoom to fit perfectly in the circle.
          </p>
        </div>

        {!image ? (
          <div className="space-y-4">
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="mx-auto h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-sm text-muted-foreground">
                Click to upload an image or drag and drop
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Preview Canvas */}
            <div className="flex justify-center">
              <div 
                className="relative cursor-move select-none"
                style={{ width: size, height: size }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas
                  ref={previewRef}
                  className="border border-border rounded-full"
                  style={{ 
                    width: size, 
                    height: size,
                    cursor: isDragging ? 'grabbing' : 'grab'
                  }}
                />
              </div>
            </div>

            {/* Controls */}
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Zoom</label>
                <Slider
                  value={[scale]}
                  onValueChange={(value) => setScale(value[0])}
                  min={0.5}
                  max={3}
                  step={0.1}
                  className="w-full"
                />
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Drag the image to reposition it within the circle
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1"
              >
                <Upload className="h-4 w-4 mr-2" />
                Change Image
              </Button>
              <Button
                variant="outline"
                onClick={onCancel}
                size="icon"
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                onClick={handleCrop}
                size="icon"
                className="bg-primary hover:bg-primary/90"
              >
                <Check className="h-4 w-4" />
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Hidden canvas for cropping */}
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};