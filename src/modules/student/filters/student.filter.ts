import { GetStudentFilterDto } from '../dto';
import dateRange from 'src/common/filters/prisma/date.filter';
import contains from 'src/common/filters/prisma/string.filter';
import relationId from 'src/common/filters/prisma/relation.filter';

export function buildStudentWhere(filter: GetStudentFilterDto) {
  return {
    status: filter.status,
    address: contains(filter.address),
    job: contains(filter.job),
    telegram: contains(filter.telegram),

    group: relationId(filter.group),

    user: {
      first_name: contains(filter.first_name),
      last_name: contains(filter.last_name),
      phone: contains(filter.phone),
      created_at: dateRange(filter.start_date, filter.end_date),
    },
  };
}
