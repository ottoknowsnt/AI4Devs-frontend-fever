import axios from 'axios';

const API_URL = 'http://localhost:3010';

export const uploadCV = async (file) => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await axios.post(`${API_URL}/upload`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data; // Devuelve la ruta del archivo y el tipo
    } catch (error) {
        throw new Error('Error al subir el archivo:', error.response.data);
    }
};

export const sendCandidateData = async (candidateData) => {
    try {
        const response = await axios.post(`${API_URL}/candidates`, candidateData);
        return response.data;
    } catch (error) {
        throw new Error('Error al enviar datos del candidato:', error.response.data);
    }
};

/**
 * Actualiza la fase actual de un candidato
 * @param {number} candidateId - ID del candidato
 * @param {object} updateData - Datos para actualizar
 * @param {number} updateData.applicationId - ID de la aplicación
 * @param {number} updateData.currentInterviewStep - ID de la fase destino
 * @returns {Promise} - Promesa con la respuesta del servidor
 */
export const updateCandidateStep = async (candidateId, updateData) => {
    try {
        const response = await axios.put(`${API_URL}/candidates/${candidateId}`, updateData);
        return response.data;
    } catch (error) {
        console.error('Error al actualizar la fase del candidato:', error);
        throw error;
    }
};