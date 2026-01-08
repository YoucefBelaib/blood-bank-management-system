// Infrastructure - Database Repositories
import {
  DrizzleUserRepository,
  DrizzleDonorRepository,
  DrizzleHospitalRepository,
  DrizzleBloodRequestRepository,
  DrizzleStatisticsRepository,
} from "../infrastructure/database/repositories";

// Services
import {
  AuthService,
  DonorService,
  HospitalService,
  StatisticsService,
} from "../services";

// Controllers
import {
  AuthController,
  DonorController,
  HospitalController,
  StatisticsController,
} from "../controllers";

// Repository instances (singletons)
const userRepository = new DrizzleUserRepository();
const donorRepository = new DrizzleDonorRepository();
const hospitalRepository = new DrizzleHospitalRepository();
const bloodRequestRepository = new DrizzleBloodRequestRepository();
const statisticsRepository = new DrizzleStatisticsRepository();

// Service instances
const authService = new AuthService(userRepository);
const donorService = new DonorService(donorRepository, statisticsRepository);
const hospitalService = new HospitalService(
  hospitalRepository,
  bloodRequestRepository,
  statisticsRepository
);
const statisticsService = new StatisticsService(
  statisticsRepository,
  donorRepository,
  hospitalRepository,
  bloodRequestRepository
);

// Controller instances
const authController = new AuthController(authService);
const donorController = new DonorController(donorService);
const hospitalController = new HospitalController(hospitalService);
const statisticsController = new StatisticsController(statisticsService);

// Export container
export const container = {
  // Repositories
  repositories: {
    user: userRepository,
    donor: donorRepository,
    hospital: hospitalRepository,
    bloodRequest: bloodRequestRepository,
    statistics: statisticsRepository,
  },

  // Services
  services: {
    auth: authService,
    donor: donorService,
    hospital: hospitalService,
    statistics: statisticsService,
  },

  // Controllers
  controllers: {
    auth: authController,
    donor: donorController,
    hospital: hospitalController,
    statistics: statisticsController,
  },
};
