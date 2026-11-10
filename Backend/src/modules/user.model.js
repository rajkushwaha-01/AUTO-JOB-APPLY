const mongoose = require("mongoose");

// ── Sub-schemas ────────────────────────────────────────────────────────────────

const educationSchema = new mongoose.Schema(
  {
    degree: { type: String, trim: true },
    institution: { type: String, trim: true },
    location: { type: String, trim: true }, // city/country of institution
    startYear: { type: String, trim: true },
    endYear: { type: String, trim: true },
    year: { type: String, trim: true }, // kept for backwards compat (single year string)
    grade: { type: String, trim: true }, // GPA / percentage / grade
  },
  { _id: false },
);

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    description: { type: String, trim: true },
    techUsed: { type: [String], default: [] },
    liveUrl: { type: String, trim: true }, // deployed link
    repoUrl: { type: String, trim: true }, // GitHub / source link
  },
  { _id: false },
);

const experienceSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    company: { type: String, trim: true },
    location: { type: String, trim: true },
    startDate: { type: String, trim: true },
    endDate: { type: String, trim: true }, // "Present" if current
    isCurrent: { type: Boolean, default: false },
    bullets: { type: [String], default: [] }, // responsibility bullet points
    description: { type: String, trim: true }, // freeform fallback
  },
  { _id: false },
);

const certificationSchema = new mongoose.Schema(
  {
    name: { type: String, trim: true },
    issuer: { type: String, trim: true },
    date: { type: String, trim: true }, // "Month Year" or "Year"
    credentialUrl: { type: String, trim: true },
    credentialId: { type: String, trim: true },
  },
  { _id: false },
);

const languageSchema = new mongoose.Schema(
  {
    language: { type: String, trim: true },
    proficiency: { type: String, trim: true }, // e.g. Native, Fluent, Intermediate, Basic
  },
  { _id: false },
);

const awardSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    issuer: { type: String, trim: true },
    date: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false },
);

const volunteerSchema = new mongoose.Schema(
  {
    role: { type: String, trim: true },
    organization: { type: String, trim: true },
    duration: { type: String, trim: true },
    description: { type: String, trim: true },
  },
  { _id: false },
);

const publicationSchema = new mongoose.Schema(
  {
    title: { type: String, trim: true },
    publisher: { type: String, trim: true },
    date: { type: String, trim: true },
    url: { type: String, trim: true },
  },
  { _id: false },
);

const pdfLinkSchema = new mongoose.Schema(
  {
    url: { type: String },
    hasDestination: { type: Boolean, default: false },
  },
  { _id: false },
);

const resumeSchema = new mongoose.Schema(
  {
    fullName: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    location: { type: String, trim: true }, // city, state, country
    portfolio: { type: String, trim: true }, // personal website / portfolio URL
    linkedin: { type: String, trim: true },
    github: { type: String, trim: true },
    twitter: { type: String, trim: true },

    summary: { type: String, trim: true },
    objective: { type: String, trim: true }, // separate if both are present

    skills: { type: [String], default: [] },

    skillsByCategory: {
      type: Map,
      of: [String],
      default: {},
    },

    experience: { type: [experienceSchema], default: [] },
    totalYearsExperience: { type: Number, default: 0 },

    education: { type: [educationSchema], default: [] },

    projects: { type: [projectSchema], default: [] },

    certifications: { type: [certificationSchema], default: [] },

    hackathons: { type: [String], default: [] }, // brief descriptions / names

    languages: { type: [languageSchema], default: [] },

    awards: { type: [awardSchema], default: [] },

    volunteer: { type: [volunteerSchema], default: [] },

    publications: { type: [publicationSchema], default: [] },

    interests: { type: [String], default: [] },

    pdfLinks: { type: [pdfLinkSchema], default: [] },
    rawText: { type: String }, // full extracted text
    uploadedAt: { type: Date, default: Date.now },
    pdfFileId: { type: mongoose.Schema.Types.ObjectId, default: null },
  },
  { _id: false },
);

// ── Main User Schema ───────────────────────────────────────────────────────────

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // store the bcrypt hash here, never plain text
    },
    resume: {
      type: resumeSchema,
      default: null, // null until the user uploads a PDF
    },
    preferences: {
      roles: { type: [String], default: [] },
      locations: { type: [String], default: [] },
      remoteOnly: { type: Boolean, default: false },
      minSalary: { type: Number, default: 0 },
    },
  },
  { timestamps: true }, // adds createdAt / updatedAt automatically
);

// never return the password hash when the doc is serialized to JSON
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
