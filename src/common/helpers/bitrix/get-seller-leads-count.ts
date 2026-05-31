import axios from 'axios';

const BASE_URL = process.env.BITRIX_WEBHOOK_URL;

async function calculateSellerLeadsCount(
  date: string | Date,
  seller_id,
  start = 0,
  count = 0
): Promise<number> {
  if (!seller_id) return 0;

  const start_of_day = new Date(date);
  start_of_day.setHours(0, 0, 0, 0);

  const end_of_day = new Date(date);
  end_of_day.setHours(23, 59, 59, 999);

  const response = await axios.post(`${BASE_URL}crm.lead.list`, {
    filter: {
      "ASSIGNED_BY_ID": seller_id,
      ">=DATE_CREATE": start_of_day.toISOString(),
      "<=DATE_CREATE": end_of_day.toISOString(),
    },
    select: ["ID"],
    start: start,
  });

  const results = response.data.result ?? [];
  const newCount = count + results.length;

  // ✅ Asosiy fix: faqat `next` mavjud bo'lganda rekursiya
  if (response.data.next !== undefined) {
    return calculateSellerLeadsCount(date, seller_id, response.data.next, newCount);
  }

  return newCount;
}

export default calculateSellerLeadsCount;