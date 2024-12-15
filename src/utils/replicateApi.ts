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
      version: "8c7c2b43f2dc8cd53c6f626d5f7798984a0d12a36329928dd914673133d1a01b",
      input: {
        image: `data:image/jpeg;base64,${personBase64}`,
        target: `data:image/jpeg;base64,${garmentBase64}`
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