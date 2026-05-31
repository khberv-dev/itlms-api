import axios from 'axios';

const BASE_URL = process.env.BITRIX_WEBHOOK_URL;

async function getBitrixUsers() {
  try {
    const response = await axios.get(`${BASE_URL}user.get`);

    const users = response.data.result;

    return users.map((u) => ({
      id: u.ID,
      name: `${u.NAME} ${u.LAST_NAME}`,
    }));
  } catch (error) {
    console.error('Bitrix Users Error:', error.response?.data || error.message);
  }
}

export default getBitrixUsers;
