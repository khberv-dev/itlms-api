enum Role {
  student = 'student',
  rop = 'rop',
  seller = 'seller',
  mentor = 'mentor',
  assistant = 'assistant',
  admin = 'admin',
}

type ReturnedRole = 'student' | 'administration' | 'seller' | 'mentor';

const roleMap: Record<Role, ReturnedRole> = {
  [Role.student]: 'student',
  [Role.rop]: 'administration',
  [Role.seller]: 'seller',
  [Role.mentor]: 'mentor',
  [Role.assistant]: 'mentor',
  [Role.admin]: 'administration',
};

export function mapRole(role: Role): ReturnedRole {
  return roleMap[role];
}
