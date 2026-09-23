export interface MembershipSummaryDto {
  id: string;
  userId: string;
  firstName: string;
  email: string;
  groupId: string;
  groupName: string;
  budget: string;
  total: string;
  exceeded?: string;
  remaining?: string;
}
