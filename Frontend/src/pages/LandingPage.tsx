import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Sparkles, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-20 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[4px] bg-yc-bg-secondary border border-yc-border text-xs text-yc-text-secondary">
          <Sparkles className="w-3.5 h-3.5 text-yc-orange" />
          <span>Next-Gen Job Matching Engine powered by Gemini & Vector Embeddings</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-yc-text max-w-3xl mx-auto leading-[1.15]">
          Your Job Search. Automated.
        </h1>

        <p className="text-base sm:text-lg text-yc-text-secondary max-w-2xl mx-auto leading-relaxed">
          Discover relevant opportunities, manage your applications, and simplify your job search from one place.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link to="/register">
            <Button size="lg" variant="primary" icon={<ArrowRight className="w-4 h-4" />}>
              Get Started
            </Button>
          </Link>
          <a href="#features">
            <Button size="lg" variant="outline">
              Explore Features
            </Button>
          </a>
        </div>
      </section>

      {/* Product Highlights Section */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-[4px] bg-yc-bg-secondary border border-yc-border flex items-center justify-center text-yc-text font-bold">
              1
            </div>
            <h3 className="text-base font-semibold text-yc-text">AI Resume Parsing</h3>
            <p className="text-xs text-yc-text-secondary leading-relaxed">
              Upload your PDF resume once. Google Gemini extracts your skills, projects, and career history directly into structured cloud data.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-[4px] bg-yc-bg-secondary border border-yc-border flex items-center justify-center text-yc-text font-bold">
              2
            </div>
            <h3 className="text-base font-semibold text-yc-text">Vector Semantic Matching</h3>
            <p className="text-xs text-yc-text-secondary leading-relaxed">
              768-dimension embeddings compute cosine similarity with live engineering roles to accurately score candidate-job alignment.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-8 h-8 rounded-[4px] bg-yc-bg-secondary border border-yc-border flex items-center justify-center text-yc-text font-bold">
              3
            </div>
            <h3 className="text-base font-semibold text-yc-text">Direct ATS Integration</h3>
            <p className="text-xs text-yc-text-secondary leading-relaxed">
              Connect to real Greenhouse and Lever company application boards without fake scrapers or synthetic listings.
            </p>
          </Card>
        </div>
      </section>
    </div>
  );
};

