//  Necessary permission to access a route
// Route : Permissions
export const RoutePermissions = {
  inventoryProject: '',
  inventoryProjectWbs: '',
  weeklySummariesReport: 'getWeeklySummaries',
  projects: ['postProject', 'postWbs'],
  projectManagement_fullFunctionality: 'seeProjectManagement',
  projectManagement_addTeamMembersUploadNewWBS: 'seeProjectManagementTab',
  userManagement: 'postUserProfile',
  updateTask: 'updateTask',
  badgeManagement: 'createBadges',
  userPermissionsManagement: 'putUserProfilePermissions',
  permissionsManagement: 'putRole',
  permissionsManagementRole: 'putRole',
  teams: 'putTeam',
  reports: 'getReports',
};
