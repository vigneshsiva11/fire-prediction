import { useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '@/app/components/ui/button';
import { Input } from '@/app/components/ui/input';
import { Label } from '@/app/components/ui/label';
import { AlertCircle, ChevronDown, Flame, Shield, Waves } from 'lucide-react';
import { toast } from 'sonner';

interface LoginPageProps {
  onLogin: (credentials: { username: string; password: string }) => Promise<void>;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  const demoUsername = 'superadmin';
  const demoPassword = 'StrongPassword@123';

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await onLogin({ username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid username or password.');
      setIsLoading(false);
    }
  };

  const handleAutoFill = () => {
    setUsername(demoUsername);
    setPassword(demoPassword);
    toast.success('Admin credentials autofilled.');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0F172A]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.25),transparent_30%),radial-gradient(circle_at_80%_80%,rgba(239,68,68,0.18),transparent_35%),radial-gradient(circle_at_70%_10%,rgba(245,158,11,0.16),transparent_28%)]" />

      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-[#3B82F6]/60"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{ y: [0, -24, 0], opacity: [0.2, 0.7, 0.2] }}
          transition={{ duration: 3 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
        <motion.div className="w-full max-w-md" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <motion.div className="mb-8 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3, duration: 0.6 }}>
            <motion.div className="mb-4 flex items-center justify-center gap-3" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 3, repeat: Infinity }}>
              <Waves className="h-12 w-12 text-[#3B82F6]" />
              <Flame className="h-10 w-10 text-[#F59E0B]" />
            </motion.div>
            <h1 className="mb-2 text-4xl font-semibold text-slate-100">FireGuard AI</h1>
            <p className="text-lg text-slate-300">Admin Access Only</p>
          </motion.div>

          <motion.div
            className="rounded-2xl border border-slate-500/30 bg-[#1E293B]/85 p-8 shadow-[0_30px_70px_-40px_rgba(15,23,42,1)] backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-slate-300">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="border-slate-600/50 bg-[#0F172A]/70 text-slate-100 placeholder:text-slate-500 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter secure password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-slate-600/50 bg-[#0F172A]/70 text-slate-100 placeholder:text-slate-500 focus:border-[#3B82F6] focus:ring-[#3B82F6]"
                  required
                />
              </div>

              {error ? (
                <motion.div className="flex items-start gap-2 rounded-xl border border-[#EF4444]/50 bg-[#EF4444]/10 p-3" initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
                  <AlertCircle className="mt-0.5 h-5 w-5 shrink-0 text-[#EF4444]" />
                  <p className="text-sm text-[#FCA5A5]">{error}</p>
                </motion.div>
              ) : null}

              <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
                <Button type="submit" className="w-full bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white hover:from-[#2563EB] hover:to-[#1D4ED8]" disabled={isLoading}>
                  {isLoading ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="h-5 w-5 rounded-full border-2 border-white border-t-transparent"
                    />
                  ) : (
                    'Secure Login'
                  )}
                </Button>
              </motion.div>
            </form>

            <div className="mt-6 rounded-xl border border-slate-600/40 bg-[#0F172A]/60 px-4 py-3 text-sm text-slate-300 flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#F59E0B]" />
              Authorized Personnel Only
            </div>

            <div className="mt-4 rounded-xl border border-amber-500/40 bg-amber-900/20 p-4 text-sm">
              <button
                type="button"
                onClick={() => setShowDemoCredentials((prev) => !prev)}
                className="w-full flex items-center justify-between text-left text-amber-100"
              >
                <span>Demo Admin Access (Hackathon Mode)</span>
                <ChevronDown className={`h-4 w-4 transition-transform ${showDemoCredentials ? 'rotate-180' : ''}`} />
              </button>

              {showDemoCredentials ? (
                <motion.div
                  className="mt-3 space-y-3 text-amber-100"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <p className="text-base">
                    Username: <span className="font-semibold">{demoUsername}</span>
                  </p>
                  <p className="text-base">
                    Password: <span className="font-semibold">{demoPassword}</span>
                  </p>

                  <Button
                    type="button"
                    variant="outline"
                    className="w-full border-amber-500/40 bg-amber-900/30 text-amber-100"
                    onClick={handleAutoFill}
                  >
                    Auto Fill Admin
                  </Button>

                  <p className="text-xs text-amber-200/85">For evaluation purposes only</p>
                </motion.div>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
