import axios from 'axios';

const API_URL = 'http://localhost:3010';

/**
 * Obtiene el flujo de entrevista para una posición específica
 * @param {string} positionId - ID de la posición
 * @returns {Promise} - Promesa con los datos del flujo de entrevista
 */
export const getInterviewFlow = async (positionId) => {
  try {
    const response = await axios.get(`${API_URL}/position/${positionId}/interviewflow`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener el flujo de entrevista:', error);
    throw error;
  }
};

/**
 * Obtiene los candidatos para una posición específica
 * @param {string} positionId - ID de la posición
 * @returns {Promise} - Promesa con los datos de los candidatos
 */
export const getPositionCandidates = async (positionId) => {
  try {
    const response = await axios.get(`${API_URL}/position/${positionId}/candidates`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener los candidatos:', error);
    throw error;
  }
};