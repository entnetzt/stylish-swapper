interface PredictionResponse {
  id: string;
  status: string;
  output?: string;
}

export const startPrediction = async (
  personBase64: string,
  garmentBase64: string,
  apiKey: string
): Promise<PredictionResponse> => {
  const requestBody = {
    version: "c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4",
    input: {
      human_img: `data:image/jpeg;base64,${personBase64}`,
      garm_img: `data:image/jpeg;base64,${garmentBase64}`,
      garment_des: "clothing item"
    }
  };

  console.log('Making prediction request with:', {
    url: 'https://api.replicate.com/v1/predictions',
    version: requestBody.version,
    inputKeys: Object.keys(requestBody.input)
  });

  const response = await fetch('https://api.replicate.com/v1/predictions', {
    method: 'POST',
    headers: {
      'Authorization': `Token ${apiKey}`,
      'Content-Type': 'application/json',
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
  apiKey: string
): Promise<PredictionResponse> => {
  const response = await fetch(
    `https://api.replicate.com/v1/predictions/${predictionId}`,
    {
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
};