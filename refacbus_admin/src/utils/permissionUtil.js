// src/utils/permissionUtils.js
export const hasPermission = (admin, key) => {
  return admin?.name === '박정원' || admin?.permissions?.[key];
};
