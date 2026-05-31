import { Injectable } from '@nestjs/common';
import { addMonths, startOfMonth, endOfMonth, differenceInDays, isSameMonth, format } from 'date-fns';

import { SaleRepository } from './sale.repository';
import { StudentService } from '../student/student.service';
import CreateSaleDto from './dto/create-sale.dto';
import { CreateResaleDto } from './dto';
import { SaleType } from '@prisma/client';
import { WebGateway } from '../web-socket/web-socket.gateway';
import { FileService } from '../file/file.service';
import { GoogleSheetsService } from './sale-sheet.service';

@Injectable()
export class SaleService {
    constructor(
        private readonly saleRepository: SaleRepository,
        private readonly studentService: StudentService,
        private readonly webSocketService: WebGateway,
        private readonly fileService: FileService,
        private readonly googleSheetsService: GoogleSheetsService
    ) { }

    async findAll() {
        return await this.saleRepository.findAll();
    }

    async findBySellerId(seller_id: string) {
        return await this.saleRepository.findBySellerId(seller_id);
    }

    async create(data: CreateSaleDto, seller_id: string, file: Express.Multer.File) {

        if (file) {
            const uploadedFile = await this.uploadFile(file);
            data.file_id = uploadedFile.id;
        }

        const { sale, student } = this.destructSaleObject(data);
        const created_student = await this.studentService.create(student);
        const new_sale = await this.saleRepository.create({ ...sale, seller_id, student_id: created_student.id });

        await this.generateSaleBreakdowns(
            new_sale.id,
            new_sale.student_id,
            Number(new_sale.sum),
            new_sale.month,
            new Date(data.date)
        );

        await this.webSocketService.handleNewSale(new_sale)

        await this.googleSheetsService.appendSaleRow({
            date: new_sale.date,
            type: new_sale.type,
            studentName: `${created_student.user.first_name} ${created_student.user?.last_name}`,
            studentPhone: created_student.user?.phone,
            sellerName: `${new_sale?.seller?.user?.first_name} ${new_sale?.seller?.user?.last_name}`,
            sum: new_sale.sum,
            month: new_sale.month,
            source: new_sale.source,
            paymentType: new_sale.payment_type,
            comment: new_sale.comment,
        }).catch(err => console.error('Google Sheets error:', err)); // main flow ni bloklamasin


        return new_sale;
    }

    async createResale(data: CreateResaleDto, seller_id: string, file: Express.Multer.File) {

        if (file) {
            const uploadedFile = await this.uploadFile(file);
            data.file_id = uploadedFile.id;
        }

        const new_sale = await this.saleRepository.create({ ...data, seller_id, type: SaleType.resale })
        await this.generateSaleBreakdowns(
            new_sale.id,
            new_sale.student_id,
            Number(new_sale.sum),
            new_sale.month,
            new Date(data.date)
        );

        await this.studentService.extendAccess(new_sale.student_id, new_sale.month);

        await this.webSocketService.handleNewSale(new_sale)


        return new_sale;
    }

    async delete(id: string) {
        return await this.saleRepository.delete(id);
    }

    async uploadFile(file: Express.Multer.File) {
        return await this.fileService.upload(file, { folder: 'sale', is_active: true });
    }

    //---------------------------------------------------

    async generateSaleBreakdowns(saleId: string, studentId: string, totalSum: number, monthsCount: number, startDate: Date) {
        // 1. Tugash sanasini hisoblash (masalan: 10-fevral + 1 oy = 10-mart)
        const endDate = addMonths(startDate, monthsCount);

        // 2. Jami kunlar sonini hisoblash
        const totalDays = differenceInDays(endDate, startDate);

        // 3. Bir kunlik narx (aniqlik uchun)
        const dailyPrice = totalSum / totalDays;

        const breakdowns: any[] = [];
        let currentPointer = new Date(startDate);

        while (currentPointer < endDate) {
            const currentMonthEnd = endOfMonth(currentPointer);

            // Bu oyda necha kun dars borligini aniqlash
            // Agar tugash sanasi shu oyning ichida bo'lsa, tugash sanasigacha hisoblaymiz
            const periodEnd = currentMonthEnd > endDate ? endDate : currentMonthEnd;

            // Kunlar sonini hisoblash (inclusive bo'lishi uchun +1 qo'shish kerak bo'lishi mumkin 
            // lekin differenceInDays o'zi yetarli bo'ladi ko'p hollarda)
            const daysInThisMonth = differenceInDays(periodEnd, currentPointer) + (isSameMonth(periodEnd, endDate) ? 0 : 1);

            // Agar oxirgi oy bo'lsa, qoldiq summani xatoliksiz yozish uchun:
            const isLastMonth = isSameMonth(currentPointer, endDate);
            let monthAmount = dailyPrice * daysInThisMonth;

            breakdowns.push({
                sale_id: saleId,
                student_id: studentId,
                month: currentPointer.getMonth() + 1, // JS da 0-11, bizga 1-12 kerak
                year: currentPointer.getFullYear(),
                days_count: daysInThisMonth,
                amount: parseFloat(monthAmount.toFixed(2)),
            });

            // Keyingi oyning boshiga o'tamiz
            currentPointer = startOfMonth(addMonths(currentPointer, 1));
        }

        // 4. Ma'lumotlar bazasiga saqlash
        await this.saleRepository.createSaleBreakDown(breakdowns);

        return breakdowns;
    }

    destructSaleObject(data) {
        const sale = {
            source: data.source,
            month: data.month,
            sum: data.sum,
            date: data.date,
            file_id: data.file_id,
            comment: data.comment,
        }
        const student = {
            address: data.address,
            job: data.job,
            password: data.password,
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
            gender: data.gender,
            telegram: data.telegram,
            month: data.month
        }
        return { sale, student };
    }

}
