interface PredictionResponse {
  id: string;
  status: string;
  output?: string;
}

const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export const startPrediction = async (
  personBase64: string,
  garmentBase64: string,
  apiKey: string
): Promise<PredictionResponse> => {
  const requestBody = {
    version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
    input: {
      human_img: personBase64.startsWith('data:') ? personBase64 : `data:image/jpeg;base64,${personBase64}`,
      garm_img: garmentBase64.startsWith('data:') ? garmentBase64 : `data:image/jpeg;base64,${garmentBase64}`,
      garment_des: "clothing item"
    }
  };

  console.log('Making prediction request with:', {
    url: 'https://api.replicate.com/v1/predictions',
    version: requestBody.version,
    inputKeys: Object.keys(requestBody.input)
  });

  try {
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent('https://api.replicate.com/v1/predictions')}`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Prediction request failed:', {
        status: response.status,
        statusText: response.statusText,
        errorData
      });
      throw new Error(errorData.detail || 'Failed to start prediction');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error in startPrediction:', error);
    throw new Error('Failed to connect to the prediction service. Please try again.');
  }
};

export const checkPredictionStatus = async (
  predictionId: string,
  apiKey: string
): Promise<PredictionResponse> => {
  try {
    const response = await fetch(
      `${CORS_PROXY}${encodeURIComponent(`https://api.replicate.com/v1/predictions/${predictionId}`)}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Token ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to check prediction status');
    }

    return response.json();
  } catch (error) {
    console.error('Error in checkPredictionStatus:', error);
    throw new Error('Failed to check prediction status. Please try again.');
  }
};