import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ImageUpload from './ImageUpload';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string>('');
  const [garmentPreview, setGarmentPreview] = useState<string>('');
  const [resultImage, setResultImage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    const savedApiKey = localStorage.getItem('replicate_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newApiKey = e.target.value;
    setApiKey(newApiKey);
    localStorage.setItem('replicate_api_key', newApiKey);
  };

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

    if (!apiKey) {
      toast({
        title: "Missing API Key",
        description: "Please enter your Replicate API key.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const personBase64 = await fileToBase64(personImage);
      const garmentBase64 = await fileToBase64(garmentImage);

      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';
      const targetUrl = 'https://api.replicate.com/v1/predictions';

      const response = await fetch(proxyUrl + targetUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin,
        },
        body: JSON.stringify({
          version: "8c7c2b43f2dc8cd53c6f626d5f7798984a0d12a36329928dd914673133d1a01b",
          input: {
            image: personBase64,
            target: garmentBase64
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to start prediction');
      }

      const prediction = await response.json();
      let result = await pollPrediction(prediction.id, proxyUrl);
      
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
        description: error.message || "Failed to generate the virtual try-on. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const pollPrediction = async (predictionId: string, proxyUrl: string): Promise<any> => {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const response = await fetch(`${proxyUrl}https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Origin': window.location.origin,
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

      await new Promise(resolve => setTimeout(resolve, 5000));
      attempts++;
    }

    throw new Error('Prediction timed out');
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        }
      };
      reader.onerror = error => reject(error);
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-fashion-DEFAULT mb-2">Virtual Try-On</h1>
        <p className="text-fashion-muted mb-8">Upload a photo of yourself and a garment to try it on virtually</p>
        
        <div className="mb-8">
          <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
            Replicate API Key
          </label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={handleApiKeyChange}
            placeholder="Enter your Replicate API key"
            className="max-w-md"
          />
        </div>

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
            disabled={isLoading || !personImage || !garmentImage || !apiKey}
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