import axios from 'axios';
require('dotenv').config();


export async function LambdaService(params) {
  try {
    let request = {};

    if (params && params.trim()) {
      request = {q:params}
    }

    const response = await axios.get(process.env.LAMBDA_URL, { params: request });

    return response.data;
  } catch (error) {
    throw new Error('Error fetching data:', error);
  }
}


const cleanInput = (input) => {
  // Utiliza una expresión regular para eliminar todos los caracteres que no sean letras o números
  return input.replace(/[^a-zA-Z0-9]/g, '');
};
