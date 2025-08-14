import React from 'react';
import { Redirect } from 'expo-router';

// Re-export individual screens for named imports in other modules if needed
export { default as Dashboard } from './Dashboard';
export { default as MyRoutes } from './MyRoutes';
export { default as MyEarnings } from './MyEarnings';
export { default as ChatList } from './ChatList';
export { default as CreateRoute } from './create_route/CreateRoute';
export { default as Notifications } from './Notifications';
export { default as DeliverySummary } from './DeliverySummary';
export { default as WithdrawalDetails } from './WithdrawalDetails';
export { default as Profile } from './Profile';
export { default as PersonalInformation } from './PersonalInformation';
export { default as UploadFacePhoto } from './UploadFacePhoto';

// Default export required by expo-router for the route
export default function DriverIndex() {
  return <Redirect href="/pages/driver/Dashboard" />;
}
