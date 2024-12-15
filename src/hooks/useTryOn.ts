import { useState } from 'react';
import { startPrediction, checkPredictionStatus } from '../utils/replicateApi';
import { useToast } from '@/components/ui/use-toast';

export const useTryOn = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [resultImage, setResultImage] = useState<string>('');
  const { toast } = useToast();

  const generateTryOn = async (
    personImage: File,
    garmentImage: File,
    apiKey: string
  ) => {
    setIsLoading(true);
    try {
      const personBase64 = await fileToBase64(personImage);
      const garmentBase64 = await fileToBase64(garmentImage);
      const proxyUrl = 'https://cors-anywhere.herokuapp.com/';

      const prediction = await startPrediction(
        personBase64,
        garmentBase64,
        apiKey,
        proxyUrl
      );

      let result = await pollPrediction(prediction.id, apiKey, proxyUrl);
      
      if (result.status === 'succeeded') {
        setResultImage(result.output || '');
        toast({
          title: "Success!",
          description: "Your virtual try-on has been generated.",
        });
      } else {
        throw new Error('Prediction failed');
      }
    } catch (error: any) {
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

  const pollPrediction = async (
    predictionId: string,
    apiKey: string,
    proxyUrl: string
  ): Promise<any> => {
    const maxAttempts = 60;
    let attempts = 0;

    while (attempts < maxAttempts) {
      const prediction = await checkPredictionStatus(predictionId, apiKey, proxyUrl);

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

  return {
    isLoading,
    resultImage,
    generateTryOn
  };
};