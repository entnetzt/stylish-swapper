import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ImageUpload from './ImageUpload';
import { Loader2 } from 'lucide-react';

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string>('');
  const [garmentPreview, setGarmentPreview] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePersonImageSelect = (file: File) => {
    setPersonImage(file);
    const previewUrl = URL.createObjectURL(file);
    setPersonPreview(previewUrl);
  };

  const handleGarmentImageSelect = (file: File) => {
    setGarmentImage(file);
    const previewUrl = URL.createObjectURL(file);
    setGarmentPreview(previewUrl);
  };

  const handleGenerate = async () => {
    if (!personImage || !garmentImage) {
      toast({
        title: "Missing Images",
        description: "Please upload both a person and a garment image.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      // Convert images to base64
      const personBase64 = await fileToBase64(personImage);
      const garmentBase64 = await fileToBase64(garmentImage);

      // Make API call to Replicate
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          version: "c86b353e1c1fec2a5ea9d5d18312ef4a3bda9bb29e8f0e899f65f2b0c7c4e2d3",
          input: {
            person_image: personBase64,
            garment_image: garmentBase64
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start prediction');
      }

      const prediction = await response.json();
      
      // Poll for results
      let result = await pollPrediction(prediction.id);
      
      if (result.status === 'succeeded') {
        setResultImage(result.output);
        toast({
          title: "Success!",
          description: "Your virtual try-on has been generated.",
        });
      } else {
        throw new Error('Prediction failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "Failed to generate the virtual try-on. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Remove the data:image/[type];base64, prefix
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  const pollPrediction = async (predictionId: string): Promise<any> => {
    const maxAttempts = 60; // 5 minutes with 5-second intervals
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${import.meta.env.VITE_REPLICATE_API_TOKEN}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check prediction status');
      }

      const prediction = await response.json();

      if (prediction.status === 'succeeded') {
        return prediction;
      } else if (prediction.status === 'failed') {
        throw new Error('Prediction failed');
      }

      // Wait 5 seconds before next attempt
      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Prediction timed out');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-fashion-DEFAULT mb-2">Virtual Try-On</h1>
        <p className="text-fashion-muted mb-8">Upload a photo of yourself and a garment to try it on virtually</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Person Image</h2>
            <ImageUpload
              onImageSelect={handlePersonImageSelect}
              label="Upload a full-body photo"
              previewUrl={personPreview}
            />
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4">Garment Image</h2>
            <ImageUpload
              onImageSelect={handleGarmentImageSelect}
              label="Upload a garment photo"
              previewUrl={garmentPreview}
            />
          </div>
        </div>

        <div className="flex justify-center mb-8">
          <Button
            onClick={handleGenerate}
            disabled={isLoading || !personImage || !garmentImage}
            className="w-full md:w-auto"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating...
              </>
            ) : (
              'Generate Try-On'
            )}
          </Button>
        </div>

        {resultImage && (
          <div className="border rounded-lg p-8">
            <h2 className="text-xl font-semibold mb-4">Result</h2>
            <img 
              src={resultImage} 
              alt="Virtual try-on result" 
              className="w-full max-w-2xl mx-auto rounded-lg shadow-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default VirtualTryOn;