const axios = require('axios');

async function getAmocrmUsers() {
  try {
    const response = await axios.get(`https://${process.env.AMOCRM_DOMAIN_NAME}.amocrm.ru/api/v4/users`, {
      headers: {
        Authorization: `Bearer ${process.env.AMOCRM_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const users = response.data._embedded.users;
    const userIds = users.map(u => ({ id: u.id, name: u.name }));

    return userIds;
  } catch (error) {
    console.error('AMOCRM Users Error:', error.response?.data || error.message);
  }
}

export default getAmocrmUsers;