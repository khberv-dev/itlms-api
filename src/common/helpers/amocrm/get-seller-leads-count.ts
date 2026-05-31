import axios from 'axios';

async function calculateSellerLeadsCount(date, seller_id, page = 1, count = 0) {

  if(!seller_id) return 0;

  const start_of_day = new Date(date);
  start_of_day.setHours(0, 0, 0, 0);
  const end_of_day = new Date(date);
  end_of_day.setHours(23, 59, 59, 999);

  const monthStart = Math.floor(start_of_day.getTime()) / 1000;
  const monthEnd = Math.floor(end_of_day.getTime()) / 1000;

  if (!seller_id) return 0;

  const response = await axios.get(
    `https://${process.env.AMOCRM_DOMAIN_NAME}.amocrm.ru/api/v4/leads?filter[responsible_user_id]=${seller_id}&` +
      `filter[created_at][from]=${monthStart}&filter[created_at][to]=${monthEnd}&page=${page}`,
    { headers: { Authorization: 'Bearer ' + process.env.AMOCRM_ACCESS_TOKEN } },
  );

  if (response.status === 200) {
    const leads = response.data._embedded.leads;
    return await calculateSellerLeadsCount(
      date,
      seller_id,
      page + 1,
      count + leads.length,
    );
  } else return count;
}

export default calculateSellerLeadsCount;
