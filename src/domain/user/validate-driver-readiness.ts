import type {
  DriverReadinessStatus,
  UserProfile,
  VehicleProfile,
} from './user-profile';

export function resolveDriverReadinessStatus(params: {
  hasSpareHelmet?: boolean;
  vehicles?: VehicleProfile[];
}): DriverReadinessStatus {
  const activeVehicle = params.vehicles?.find(vehicle => vehicle.isActiveForBooking);

  if (!activeVehicle) {
    return 'draft';
  }

  if (activeVehicle.vehicleType === 'motor' && !params.hasSpareHelmet) {
    return 'declared';
  }

  return 'minimum_valid';
}

export function isDriverReady(profile: UserProfile): boolean {
  return profile.driverReadinessStatus === 'minimum_valid';
}
