// google-sheets.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { google, sheets_v4 } from 'googleapis';

@Injectable()
export class GoogleSheetsService implements OnModuleInit {
    private sheets: sheets_v4.Sheets;
    private readonly spreadsheetId = process.env.GOOGLE_SHEET_ID;

    async onModuleInit() {
        const auth = new google.auth.GoogleAuth({
            credentials: {
                client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
                private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
            },
            scopes: ['https://www.googleapis.com/auth/spreadsheets'],
        });

        this.sheets = google.sheets({ version: 'v4', auth });
        await this.ensureHeadersExist();
    }

    private async ensureHeadersExist() {
        const headers = [
            'Sana', 'Tur', 'Oquvchi Ismi', 'Telefon',
            'Sotuvchi', 'Summa', 'Oy', 'Manba', "To'lov turi", 'Izoh'
        ];

        const res = await this.sheets.spreadsheets.values.get({
            spreadsheetId: this.spreadsheetId,
            range: 'Sheet1!A1:K1',
        });

        if (!res.data.values || res.data.values.length === 0) {
            await this.sheets.spreadsheets.values.update({
                spreadsheetId: this.spreadsheetId,
                range: 'Sheet1!A1',
                valueInputOption: 'RAW',
                requestBody: { values: [headers] },
            });
        }
    }

    async appendSaleRow(data: {
        date;
        type;
        studentName;
        studentPhone;
        sellerName;
        sum;
        month;
        source?;
        paymentType?;
        comment?;
    }) {
        const row = [
            new Date(data.date).toLocaleDateString('uz-UZ'),
            data.type === 'new' ? 'Yangi' : 'Qayta sotish',
            data.studentName,
            data.studentPhone,
            data.sellerName,
            Number(data.sum),
            data.month,
            data.source ?? '',
            data.paymentType ?? '',
            data.comment ?? '',
        ];

        await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values: [row] },
        });
    }

    // Bulk yozish uchun (migrate script uchun)
    async appendManySaleRows(rows: Parameters<typeof this.appendSaleRow>[0][]) {
        const values = rows.map(data => [
            new Date(data.date).toLocaleDateString('uz-UZ'),
            data.type === 'new' ? 'Yangi' : 'Qayta sotish',
            data.studentName,
            data.studentPhone,
            data.sellerName,
            Number(data.sum),
            data.month,
            data.source ?? '',
            data.paymentType ?? '',
            data.comment ?? '',
        ]);

        await this.sheets.spreadsheets.values.append({
            spreadsheetId: this.spreadsheetId,
            range: 'Sheet1!A1',
            valueInputOption: 'USER_ENTERED',
            insertDataOption: 'INSERT_ROWS',
            requestBody: { values },
        });
    }
}