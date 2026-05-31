import axios from 'axios';
import Redis from 'ioredis';

const redis = new Redis();
const DOMAIN = process.env.ONLINE_PBX_DOMAIN;
const PBX_API_KEY = process.env.ONLINE_PBX_API_KEY;

async function refreshPbxToken() {
  const res = await axios.post(`https://api2.onlinepbx.ru/${DOMAIN}/auth.json`, {
    auth_key: PBX_API_KEY,
  });

  const { key, key_id } = res.data.data;

  await redis.set('pbx:key', key);
  await redis.set('pbx:key_id', key_id);
  await redis.set(
    'pbx:expired_at',
    Date.now() + 2.5 * 24 * 60 * 60 * 1000, // 2.5 kun
  );

  return { key, key_id };
}

export default refreshPbxToken;
