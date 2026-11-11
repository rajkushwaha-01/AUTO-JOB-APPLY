import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Cpu,
  FileText,
  Building,
  MapPin,
  ExternalLink,
  Layers,
  Clock,
  Briefcase,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full bg-white text-yc-text">
      {/* ── 1. Hero Section ────────────────────────────────────────── */}
      <section className="pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center border-b border-yc-border">
        <div className="max-w-3xl mx-auto flex flex-col items-center">
          {/* Announcement Badge */}
          

          {/* Master Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-yc-text max-w-3xl leading-[1.12] mb-6">
            Your Job Search. Automated.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-yc-text-secondary max-w-xl mx-auto mb-8 leading-relaxed">
            Discover relevant opportunities, manage your applications, and simplify your job search from one place.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto justify-center mb-8">
            <Link to="/register" className="w-full sm:w-auto">
              <Button size="lg" variant="primary" className="w-full sm:w-auto" icon={<ArrowRight className="w-4 h-4" />}>
                Get Started
              </Button>
            </Link>
            <a href="#features" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full sm:w-auto">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Real Verification Note */}
          
        </div>
      </section>

      {/* ── 2. Real Product UI Preview ────────────────────────────── */}
      

      {/* ── 3. How It Works Section ───────────────────────────────── */}
      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-yc-border">
        <div className="mb-12 text-center sm:text-left">
          <span className="text-[11px] font-semibold text-yc-orange uppercase tracking-wider">
            Architecture & Pipeline
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-yc-text mt-1">
            How AUTO-JOB-APPLY Works
          </h2>
          <p className="text-xs sm:text-sm text-yc-text-secondary max-w-xl mt-2">
            An end-to-end autonomous engine engineered specifically for software engineers.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-yc-border p-6 rounded-[4px] flex flex-col justify-between space-y-6">
            <div>
              <div className="text-sm font-bold text-yc-orange mb-3">01 / Upload & Parse Resume</div>
              <h3 className="text-base font-semibold text-yc-text mb-2">Google Gemini PDF Extraction</h3>
              <p className="text-xs text-yc-text-secondary leading-relaxed">
                Upload your PDF. Google Gemini parses skills, categorized proficiencies, project URLs, and work history into a clean JSON schema while preserving the raw document in MongoDB GridFS.
              </p>
            </div>
            <div className="pt-4 border-t border-yc-border-subtle flex items-center justify-between text-[11px] text-yc-text-muted font-medium">
              <span>ZERO MANUAL DATA ENTRY</span>
              <FileText className="w-4 h-4 text-yc-text-muted" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-yc-border p-6 rounded-[4px] flex flex-col justify-between space-y-6">
            <div>
              <div className="text-sm font-bold text-yc-orange mb-3">02 / Vector Embedding Generation</div>
              <h3 className="text-base font-semibold text-yc-text mb-2">High-Density Semantic Vectors</h3>
              <p className="text-xs text-yc-text-secondary leading-relaxed">
                Your parsed resume context is transformed into 768-dimension embeddings via gemini-embedding-001. SHA-256 hashes cache the vector representation to prevent redundant compute.
              </p>
            </div>
            <div className="pt-4 border-t border-yc-border-subtle flex items-center justify-between text-[11px] text-yc-text-muted font-medium">
              <span>768-DIM VECTOR EMBEDDING</span>
              <Cpu className="w-4 h-4 text-yc-text-muted" />
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-yc-border p-6 rounded-[4px] flex flex-col justify-between space-y-6">
            <div>
              <div className="text-sm font-bold text-yc-orange mb-3">03 / Hybrid Match & Direct Apply</div>
              <h3 className="text-base font-semibold text-yc-text mb-2">Cosine Similarity + Keyword Boost</h3>
              <p className="text-xs text-yc-text-secondary leading-relaxed">
                Each job is ranked with a 50% vector similarity and 50% keyword verification formula. Only relevant engineering positions scoring above 0.35 are presented for direct one-click ATS application.
              </p>
            </div>
            <div className="pt-4 border-t border-yc-border-subtle flex items-center justify-between text-[11px] text-yc-text-muted font-medium">
              <span>DIRECT ATS LINKS</span>
              <ExternalLink className="w-4 h-4 text-yc-text-muted" />
            </div>
          </div>
        </div>
      </section>

      {/* ── 4. Key Features (Bento Grid) ─────────────────────────── */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-yc-border">
        <div className="mb-12 text-center sm:text-left">
          <span className="text-[11px] font-semibold text-yc-orange uppercase tracking-wider">
            Key Capabilities
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-yc-text mt-1">
            Built with Engineering Clarity
          </h2>
          <p className="text-xs sm:text-sm text-yc-text-secondary max-w-xl mt-2">
            No bloated dashboards, no fake recruiters, and no synthetic profiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-yc-border p-6 rounded-[4px] space-y-3">
            <div className="w-7 h-7 rounded-[4px] bg-yc-bg-secondary flex items-center justify-center text-yc-orange">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-yc-text">AI Skill Categorization</h3>
            <p className="text-xs text-yc-text-secondary leading-relaxed">
              Automatically indexes skills into Frontend, Backend, Database, DevOps, Tools, and Languages.
            </p>
          </div>

          <div className="bg-white border border-yc-border p-6 rounded-[4px] space-y-3">
            <div className="w-7 h-7 rounded-[4px] bg-yc-bg-secondary flex items-center justify-center text-yc-orange">
              <Building className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-yc-text">ATS Ingestion Support</h3>
            <p className="text-xs text-yc-text-secondary leading-relaxed">
              Configurable batch ingestion pulls open roles directly from Greenhouse, Lever, and Adzuna APIs.
            </p>
          </div>

          <div className="bg-white border border-yc-border p-6 rounded-[4px] space-y-3">
            <div className="w-7 h-7 rounded-[4px] bg-yc-bg-secondary flex items-center justify-center text-yc-orange">
              <Layers className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-yc-text">Master-Detail Split View</h3>
            <p className="text-xs text-yc-text-secondary leading-relaxed">
              Explore job openings and detailed requirement breakdowns side-by-side with zero context switching.
            </p>
          </div>

          <div className="bg-white border border-yc-border p-6 rounded-[4px] space-y-3">
            <div className="w-7 h-7 rounded-[4px] bg-yc-bg-secondary flex items-center justify-center text-yc-orange">
              <Briefcase className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-yc-text">Application Tracking</h3>
            <p className="text-xs text-yc-text-secondary leading-relaxed">
              Organize your pipeline from Applied to Technical Interview and Final Offer with zero spreadsheet manual tracking.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Conversion Banner ─────────────────────────────────── */}
      
    </div>
  );
};
