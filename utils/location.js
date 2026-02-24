export function parseCoordinates(latInput, lonInput) {
  const latitude = Number.parseFloat(latInput);
  const longitude = Number.parseFloat(lonInput);

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    return { error: 'Latitude and longitude must be valid numbers.' };
  }

  if (latitude < -90 || latitude > 90) {
    return { error: 'Latitude must be between -90 and 90.' };
  }

  if (longitude < -180 || longitude > 180) {
    return { error: 'Longitude must be between -180 and 180.' };
  }

  return {
    latitude: Number(latitude.toFixed(6)),
    longitude: Number(longitude.toFixed(6)),
  };
}
