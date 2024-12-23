import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import ImageUpload from './ImageUpload';
import { Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useTryOn } from '@/hooks/useTryOn';

const VirtualTryOn = () => {
  const [personImage, setPersonImage] = useState<File | null>(null);
  const [garmentImage, setGarmentImage] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string>('');
  const [garmentPreview, setGarmentPreview] = useState<string>('');
  const [apiKey, setApiKey] = useState('');
  const { toast } = useToast();
  const { isLoading, resultImage, generateTryOn } = useTryOn();

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

    await generateTryOn(personImage, garmentImage, apiKey);
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