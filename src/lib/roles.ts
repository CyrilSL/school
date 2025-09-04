export const ROLES = {
  INSTITUTION_ADMIN: "admin",
  PARENT: "parent",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export function isInstitutionAdmin(role: string | null | undefined): boolean {
  return role === ROLES.INSTITUTION_ADMIN;
}

export function isParent(role: string | null | undefined): boolean {
  return role === ROLES.PARENT;
}

export function hasAccess(userRole: string | null | undefined, requiredRole: Role): boolean {
  if (!userRole) return false;
  
  // Institution admins have access to everything
  if (userRole === ROLES.INSTITUTION_ADMIN) return true;
  
  return userRole === requiredRole;
}

export const ROLE_LABELS = {
  [ROLES.INSTITUTION_ADMIN]: "Institution Admin",
  [ROLES.PARENT]: "Parent",
} as const;