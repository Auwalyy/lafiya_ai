require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const User = require("./models/User");
const Doctor = require("./models/Doctor");

const users = [
  {
    firstName: "Admin",
    lastName: "Lafiya",
    email: "admin@lafiya.ai",
    password: "Admin1234!",
    role: "admin",
    isEmailVerified: true,
    location: { state: "Kano" },
  },
  {
    firstName: "Amina",
    lastName: "Bello",
    email: "amina@lafiya.ai",
    password: "Patient1234!",
    role: "patient",
    isEmailVerified: true,
    gender: "female",
    dateOfBirth: new Date("1995-04-12"),
    location: { state: "Kano", lga: "Nassarawa" },
    healthConditions: ["Diabetes"],
    preferredLanguage: "ha",
  },
  {
    firstName: "Yusuf",
    lastName: "Garba",
    email: "yusuf@lafiya.ai",
    password: "Patient1234!",
    role: "patient",
    isEmailVerified: true,
    gender: "male",
    dateOfBirth: new Date("1988-09-23"),
    location: { state: "Kaduna", lga: "Chikun" },
    preferredLanguage: "en",
  },
  {
    firstName: "Ibrahim",
    lastName: "Musa",
    email: "dr.ibrahim@lafiya.ai",
    password: "Doctor1234!",
    role: "doctor",
    isEmailVerified: true,
    gender: "male",
    location: { state: "Kano" },
  },
  {
    firstName: "Fatima",
    lastName: "Aliyu",
    email: "dr.fatima@lafiya.ai",
    password: "Doctor1234!",
    role: "doctor",
    isEmailVerified: true,
    gender: "female",
    location: { state: "Abuja" },
  },
  {
    firstName: "Usman",
    lastName: "Suleiman",
    email: "dr.usman@lafiya.ai",
    password: "Doctor1234!",
    role: "doctor",
    isEmailVerified: true,
    gender: "male",
    location: { state: "Sokoto" },
  },
];

const doctorProfiles = [
  {
    email: "dr.ibrahim@lafiya.ai",
    specialization: "Cardiology",
    licenseNumber: "MDCN-2018-KN-4421",
    yearsOfExperience: 10,
    bio: "Consultant cardiologist at AKTH with over 10 years experience.",
    languages: ["English", "Hausa"],
    consultationFee: 5000,
    isVerified: true,
    isAvailableForTelemedicine: true,
    rating: 4.8,
    reviewCount: 120,
    availability: [
      { day: "Monday", startTime: "09:00", endTime: "17:00" },
      { day: "Wednesday", startTime: "09:00", endTime: "17:00" },
      { day: "Friday", startTime: "09:00", endTime: "13:00" },
    ],
  },
  {
    email: "dr.fatima@lafiya.ai",
    specialization: "Obstetrics & Gynecology",
    licenseNumber: "MDCN-2020-AB-8832",
    yearsOfExperience: 7,
    bio: "Specialist in maternal health and high-risk pregnancies.",
    languages: ["English", "Hausa", "Yoruba"],
    consultationFee: 6000,
    isVerified: true,
    isAvailableForTelemedicine: true,
    rating: 4.9,
    reviewCount: 95,
    availability: [
      { day: "Tuesday", startTime: "08:00", endTime: "16:00" },
      { day: "Thursday", startTime: "08:00", endTime: "16:00" },
    ],
  },
  {
    email: "dr.usman@lafiya.ai",
    specialization: "General Practice",
    licenseNumber: "MDCN-2015-SK-1103",
    yearsOfExperience: 12,
    bio: "General practitioner serving rural and urban communities in Sokoto.",
    languages: ["English", "Hausa", "Fulfulde"],
    consultationFee: 3000,
    isVerified: true,
    isAvailableForTelemedicine: false,
    rating: 4.6,
    reviewCount: 200,
    availability: [
      { day: "Monday", startTime: "08:00", endTime: "18:00" },
      { day: "Tuesday", startTime: "08:00", endTime: "18:00" },
      { day: "Wednesday", startTime: "08:00", endTime: "18:00" },
      { day: "Thursday", startTime: "08:00", endTime: "18:00" },
      { day: "Friday", startTime: "08:00", endTime: "14:00" },
    ],
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB");

  // Clear existing seed users by email
  const emails = users.map((u) => u.email);
  await User.deleteMany({ email: { $in: emails } });

  // Create users (password hashing handled by pre-save hook)
  const created = await Promise.all(users.map((u) => new User(u).save()));
  console.log(`Created ${created.length} users`);

  // Clear existing doctor profiles for these users
  const doctorUserIds = created.filter((u) => u.role === "doctor").map((u) => u._id);
  await Doctor.deleteMany({ user: { $in: doctorUserIds } });

  // Create doctor profiles
  for (const profile of doctorProfiles) {
    const user = created.find((u) => u.email === profile.email);
    const { email, ...rest } = profile;
    await Doctor.create({ user: user._id, ...rest });
  }
  console.log(`Created ${doctorProfiles.length} doctor profiles`);

  console.log("\nSeed credentials:");
  users.forEach((u) => console.log(`  [${u.role}] ${u.email} / ${u.password}`));

  await mongoose.disconnect();
}

seed().catch((err) => { console.error(err); process.exit(1); });
