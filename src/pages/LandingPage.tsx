import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { StampBadge } from "@/components/ui/stamp-badge";
import type { ComplaintStatus } from "@/components/ui/stamp-badge";
import {
  ArrowRight,
  Shield,
  Clock,
  Users,
  Megaphone,
  BarChart,
  CheckCircle2,
  Lock,
} from "lucide-react";

const docketCards: Array<{
  ref: string;
  title: string;
  category: string;
  status: ComplaintStatus;
  rotate: number;
  zIndex: number;
}> = [
  {
    ref: "UCT-2024-00312",
    title: "Library closing times clash with exam schedule",
    category: "Academic",
    status: "resolved",
    rotate: -5,
    zIndex: 1,
  },
  {
    ref: "UCT-2024-00418",
    title: "Broken water fountains in Engineering block",
    category: "Facilities",
    status: "in_review",
    rotate: 2,
    zIndex: 2,
  },
  {
    ref: "UCT-2024-00521",
    title: "Shuttle service not running after 6pm",
    category: "Transport",
    status: "open",
    rotate: -2,
    zIndex: 3,
  },
  {
    ref: "UCT-2024-00603",
    title: "Wi-Fi signal lost in Residence Block C",
    category: "IT",
    status: "escalated",
    rotate: 4,
    zIndex: 4,
  },
];

function DocketCard({
  card,
  index,
}: {
  card: (typeof docketCards)[0];
  index: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: card.rotate - 4 }}
      animate={{ opacity: 1, y: 0, rotate: card.rotate }}
      transition={{
        delay: index * 0.75,
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1],
      }}
      style={{ zIndex: card.zIndex }}
      className="absolute w-72 bg-card border border-border rounded-xl shadow-2xl p-5 backdrop-blur-sm dark:bg-zinc-900/90">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-mono text-[10px] text-terracotta-600/80 uppercase tracking-wider mb-1.5">
            {card.ref}
          </p>
          <p className="text-sm font-semibold leading-snug line-clamp-2 text-foreground">
            {card.title}
          </p>
          <p className="text-xs text-muted-foreground mt-2 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/40"></span>
            {card.category}
          </p>
        </div>
        <StampBadge
          status={card.status}
          size="sm"
          animate={index === docketCards.length - 1}
        />
      </div>
    </motion.div>
  );
}

const stats = [
  { value: "48h", label: "Average Resolution Time" },
  { value: "12k+", label: "Issues Successfully Resolved" },
  { value: "100%", label: "Anonymity Guaranteed" },
];

const steps = [
  {
    title: "File the Docket",
    description:
      "Drop a pin, upload a photo, and detail the issue in under 60 seconds. Choose to remain completely anonymous.",
  },
  {
    title: "SRC Escalation",
    description:
      "Your docket bypasses the general inbox and lands directly on the dashboard of the relevant student representative.",
  },
  {
    title: "Public Accountability",
    description:
      "Track the status live. Once verified, the issue's status is visible to the student body, ensuring the administration acts.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background selection:bg-terracotta-100 selection:text-terracotta-900">
      {/* Navigation */}
      <header className="fixed top-0 inset-x-0 z-50 h-16 flex items-center justify-between px-6 border-b border-border/40 bg-background/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-display text-xl font-bold tracking-tight">
            <span className="text-terracotta-600">Campus</span>
            <span className="text-foreground">Docket</span>
          </span>
        </div>
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground"
            asChild>
            <Link to="/login">Sign in</Link>
          </Button>
          <Button
            size="sm"
            className="bg-terracotta-600 hover:bg-terracotta-700 text-white shadow-md"
            asChild>
            <Link to="/signup">File a Complaint</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-terracotta-200 bg-terracotta-50/50 dark:bg-terracotta-950/20 dark:border-terracotta-900 px-3 py-1 text-xs font-medium text-terracotta-700 dark:text-terracotta-400 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-terracotta-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-terracotta-500"></span>
              </span>
              v2.0 is live for the Fall Semester
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              The black hole of campus emails is{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-terracotta-600 to-orange-500">
                officially closed.
              </span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8 max-w-xl">
              Don't let your grievances get buried in an administrative inbox.
              Campus Docket puts your issues on the record, connects you
              directly to the SRC, and forces transparent resolutions.
            </p>

            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <Button
                size="lg"
                className="bg-terracotta-600 hover:bg-terracotta-700 text-white h-12 px-8 text-base shadow-lg shadow-terracotta-600/20"
                asChild>
                <Link
                  to="/signup"
                  className="flex items-center gap-2">
                  Submit a Docket
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-12 px-8 text-base border-border"
                asChild>
                <Link to="/explore">View Public Dockets</Link>
              </Button>
            </div>
          </motion.div>

          {/* Enhanced Docket Stack Illustration */}
          <div className="relative h-[400px] w-full max-w-md mx-auto lg:mx-0 flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-tr from-terracotta-100 to-transparent dark:from-terracotta-900/20 rounded-full blur-3xl opacity-50"></div>
            {docketCards.map((card, i) => (
              <DocketCard
                key={card.ref}
                card={card}
                index={i}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Metrics */}
      <section className="border-y border-border bg-card/30">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-border text-center">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="pt-6 md:pt-0">
                <p className="text-4xl font-display font-bold text-foreground mb-2">
                  {stat.value}
                </p>
                <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="mb-16 md:text-center max-w-3xl mx-auto">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4 tracking-tight">
              Bureaucracy, bypassed.
            </h2>
            <p className="text-lg text-muted-foreground">
              We built a system that administration can't ignore. Every feature
              is designed to protect students and hold institutions accountable.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 auto-rows-[280px]">
            {/* Large Feature */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              className="md:col-span-2 bg-gradient-to-br from-card to-card/50 border border-border rounded-3xl p-8 relative overflow-hidden group">
              <Shield className="h-10 w-10 text-terracotta-600 mb-6" />
              <h3 className="text-2xl font-bold mb-3">Iron-clad anonymity</h3>
              <p className="text-muted-foreground max-w-md leading-relaxed">
                Speak up about unfair grading, harassment, or infrastructure
                failures without fear of retaliation. We strip metadata and
                protect your identity cryptographically before the SRC ever sees
                it.
              </p>
            </motion.div>

            {/* Square Feature */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border rounded-3xl p-8 flex flex-col">
              <BarChart className="h-8 w-8 text-foreground mb-auto" />
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Data that demands action
                </h3>
                <p className="text-sm text-muted-foreground">
                  We aggregate similar complaints to identify systemic issues
                  across campus.
                </p>
              </div>
            </motion.div>

            {/* Square Feature */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-3xl p-8 flex flex-col">
              <Clock className="h-8 w-8 text-foreground mb-auto" />
              <div>
                <h3 className="text-xl font-bold mb-2">Live audit trails</h3>
                <p className="text-sm text-muted-foreground">
                  Watch your docket move from "Submitted" to "Under Review" to
                  "Resolved" in real-time.
                </p>
              </div>
            </motion.div>

            {/* Large Feature */}
            <motion.div
              whileInView={{ opacity: 1, y: 0 }}
              initial={{ opacity: 0, y: 20 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="md:col-span-2 bg-zinc-900 dark:bg-zinc-100 text-zinc-50 dark:text-zinc-900 rounded-3xl p-8 relative overflow-hidden">
              <Users className="h-10 w-10 mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-3">
                Direct SRC integration
              </h3>
              <p className="text-zinc-400 dark:text-zinc-600 max-w-md leading-relaxed">
                No more "contact us" forms that go nowhere. Dockets are routed
                directly to the specific student representative tasked with your
                portfolio.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How it Works Journey */}
      <section className="py-24 px-6 bg-muted/30 border-y border-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display text-3xl font-bold text-center mb-16 tracking-tight">
            How a grievance becomes a resolution
          </h2>

          <div className="grid md:grid-cols-3 gap-10">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative">
                {/* Connecting Line (hidden on mobile) */}
                {index !== steps.length - 1 && (
                  <div className="hidden md:block absolute top-6 left-[calc(100%-2rem)] w-[calc(100%-1rem)] h-[2px] bg-border" />
                )}

                <div className="h-12 w-12 rounded-full bg-background border-2 border-terracotta-600 text-terracotta-600 flex items-center justify-center font-bold text-lg mb-6 relative z-10 shadow-sm">
                  {index + 1}
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-terracotta-600/5 dark:bg-terracotta-900/10" />
        <div className="max-w-2xl mx-auto space-y-8 relative z-10">
          <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">
            Stop complaining.
            <br />
            Start documenting.
          </h2>
          <p className="text-lg text-muted-foreground">
            Join thousands of students who are holding their campuses
            accountable. It takes exactly 60 seconds to file your first docket.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button
              size="lg"
              className="bg-terracotta-600 hover:bg-terracotta-700 text-white h-14 px-8 text-base w-full sm:w-auto"
              asChild>
              <Link
                to="/signup"
                className="flex items-center gap-2">
                Create a free account
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground sm:hidden">or</p>
            <Button
              size="lg"
              variant="ghost"
              className="h-14 px-8 text-base w-full sm:w-auto"
              asChild>
              <Link to="/explore">View recent dockets</Link>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 mt-6">
            <Lock className="h-3 w-3" /> SSL Secured & End-to-End Encrypted
          </p>
        </div>
      </section>

      {/* Expanded Premium Footer */}
      <footer className="border-t border-border bg-background pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
          <div className="col-span-2">
            <span className="font-display text-xl font-bold tracking-tight mb-4 block">
              <span className="text-terracotta-600">Campus</span>
              <span className="text-foreground">Docket</span>
            </span>
            <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
              The definitive platform for student grievance management and
              institutional accountability.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Platform</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/features"
                  className="hover:text-foreground transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link
                  to="/security"
                  className="hover:text-foreground transition-colors">
                  Security & Privacy
                </Link>
              </li>
              <li>
                <Link
                  to="/universities"
                  className="hover:text-foreground transition-colors">
                  For Universities
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4 text-sm">Legal</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li>
                <Link
                  to="/terms"
                  className="hover:text-foreground transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-foreground transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  to="/guidelines"
                  className="hover:text-foreground transition-colors">
                  Community Guidelines
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>
            © {new Date().getFullYear()} Campus Docket Inc. All rights reserved.
          </p>
          <p>
            Designed by <a href="mailto:yahayaabdullahimana@gmail.com">Jika</a>{" "}
            for student advocacy.
          </p>
        </div>
      </footer>
    </div>
  );
}
