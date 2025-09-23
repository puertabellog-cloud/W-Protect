// const API_BASE_URL = 'https://oikoom.azurewebsites.net/oikoom/api/w';
const API_BASE_URL = 'http://localhost:8080/oikoom/api/w';

export interface ProfileData {
  name: string;
  phone: string;
  email: string;
  mensaje: string;
  deviceId: string | null;
  active: boolean;
  // Agrega más campos según tu modelo
}

export async function getProfile(deviceId: string) {
  const response = await fetch(`${API_BASE_URL}/users/device/${deviceId}`);
  if (!response.ok) throw new Error('Error al obtener el perfil');
  return response.json();
}

export async function updateProfile(data: ProfileData) {
  console.log('Updating profile with data:', data);
  const response = await fetch(`${API_BASE_URL}/users/save`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) throw new Error('Error al actualizar el perfil');
  return response.json();
}