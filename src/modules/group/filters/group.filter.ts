import { GetGroupFilterDto } from '../dto';
import dateRange from 'src/common/filters/prisma/date.filter';
import contains from 'src/common/filters/prisma/string.filter';

export function buildGroupWhere(filter: GetGroupFilterDto = {}) {
  return {
    title: contains(filter.title),
    status: filter.status,
    level_id: filter.level_id,
    mentor_id: filter.mentor_id,
    assistant_id: filter.assistant_id,
    created_at: dateRange(filter.start_date, filter.end_date),
  };
}
