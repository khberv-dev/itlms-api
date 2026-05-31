import { Injectable } from '@nestjs/common';
import { SellerDailyStatisticRepository } from '../repositories/seller-daily-statistic.repository';
import { calculateSellerLeadsCount } from 'src/common/helpers/bitrix';
import { Cron } from '@nestjs/schedule';
import { getCallHistory } from 'src/common/helpers/online-pbx';


@Injectable()
export class SellerDailyStatisticService {
    constructor(
        private readonly sellerDailyStatisticRepository: SellerDailyStatisticRepository,
    ) { }

    @Cron('*/10 * * * *', { timeZone: 'Asia/Tashkent' })
    async syncTodayStatistics() {

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const history = await getCallHistory();
        const sellers = await this.sellerDailyStatisticRepository.getSellers();
        const statsBySip = this.aggregateBySip(history);

        await Promise.all(sellers.map(async (seller) => {
            const sip = seller.sip || '';
            const stat = statsBySip[sip] || {};

            const leads_count = await calculateSellerLeadsCount(
                today,
                seller.amocrm_id,
            );

            await this.sellerDailyStatisticRepository.upsert({
                seller_id: seller.id,
                date: today,
                leads_count,
                ...stat,
            });
        }))
    }


    private aggregateBySip(calls: any[]) {
        const result: Record<string, any> = {};

        if (calls.length === 0) return [];

        for (const call of calls) {
            const sip =
                call.accountcode === 'outbound'
                    ? call.caller_id_number
                    : call.destination_number;

            if (!sip) continue;

            if (!result[sip]) {
                result[sip] = {
                    time: 0,
                    total_count: 0,
                    income_count: 0,
                    outgoing_count: 0,
                    succes_count: 0,
                    income_succes_count: 0,
                    outgoing_succes_count: 0,
                    failed_count: 0,
                    income_call_time: 0,
                    outgoing_call_time: 0,
                };
            }

            const s = result[sip];
            const success = call.hangup_cause === 'NORMAL_CLEARING';

            s.total_count++;
            s.time += call.user_talk_time || 0;

            if (call.accountcode === 'inbound') {
                s.income_count++;
                s.income_call_time += call.user_talk_time || 0;
                success ? s.income_succes_count++ : s.failed_count++;
            } else {
                s.outgoing_count++;
                s.outgoing_call_time += call.user_talk_time || 0;
                success ? s.outgoing_succes_count++ : s.failed_count++;
            }

            if (success) {
                s.succes_count++;
            }
        }

        return result;
    }
}
