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
  const response = await fetch(`${proxyUrl}https://api.replicate.com/v1/predictions`, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
    },
    body: JSON.stringify({
      version: "7af9ea6fe8bfa9a0f4b6f0b4389525a8c49a3f349d92de6f6c80d86d3f1fe11f",
      input: {
        image: `data:image/jpeg;base64,${personBase64}`,
        target: `data:image/jpeg;base64,${garmentBase64}`,
        use_mask: true
      }
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
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