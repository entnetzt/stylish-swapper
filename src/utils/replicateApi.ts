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
    version: "8c86be2c8c59ec22b87883e23d8ef90ad20742a453a58e15cad44d5c1dc39375",
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
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Failed to check prediction status');
  }

  return response.json();
};