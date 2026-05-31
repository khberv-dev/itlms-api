import axios from 'axios';
import Redis from 'ioredis';
import refreshPbxToken from './refresh-pbx-token';

const redis = new Redis();
const DOMAIN = process.env.ONLINE_PBX_DOMAIN;

async function getCallHistory<T>() {
  const start_date = Math.floor(new Date(new Date().setHours(0, 0, 0, 0)).getTime() / 1000);
  const end_date = Math.floor(new Date(new Date().setHours(23, 59, 59)).getTime() / 1000);

  let key = await redis.get('pbx:key');
  let key_id = await redis.get('pbx:key_id');

  try {
    const res = await axios.post(
      `https://api2.onlinepbx.ru/${DOMAIN}/mongo_history/search.json`,
      {
        start_stamp_from: start_date,
        start_stamp_to: end_date,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'x-pbx-authentication': `${key_id}:${key}`,
        },
      },
    );

    if (res?.data?.isNotAuth) {
      await refreshPbxToken();
      return await getCallHistory();
    }

    return res.data.data;
  } catch (e) {
    if (e.response?.data?.isNotAuth) {
      await refreshPbxToken();
      return await getCallHistory();
    }
  }
}

export default getCallHistory;
