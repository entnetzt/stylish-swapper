interface PredictionResponse {
  id: string;
  status: string;
  output?: string;
}

export const startPrediction = async (
  personBase64: string,
  garmentBase64: string,
  apiKey: string,
  proxyUrl: string
): Promise<PredictionResponse> => {
  const requestBody = {
    version: "f86afe8723b0416c99ca1706b9605741657009bf1c84f021669f4b3edf36aa67",
    input: {
      person: `data:image/jpeg;base64,${personBase64}`,
      cloth: `data:image/jpeg;base64,${garmentBase64}`,
    }
  };

  console.log('Making prediction request with:', {
    url: `${proxyUrl}https://api.replicate.com/v1/predictions`,
    version: requestBody.version,
    inputKeys: Object.keys(requestBody.input)
  });

  const response = await fetch(`${proxyUrl}https://api.replicate.com/v1/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error('Prediction request failed:', {
      status: response.status,
      statusText: response.statusText,
      errorData
    });
    throw new Error(errorData.detail || 'Failed to start prediction');
  }

  return response.json();
};

export const checkPredictionStatus = async (
  predictionId: string,
  apiKey: string,
  proxyUrl: string
): Promise<PredictionResponse> => {
  const response = await fetch(
    `${proxyUrl}https://api.replicate.com/v1/predictions/${predictionId}`,
    {
      headers: {
        'Authorization': `Token ${apiKey}`,
        'Origin': window.location.origin,
      },
    }
  );

  if (!response.ok) {
    throw new Error('Failed to check prediction status');
  }

  return response.json();
};