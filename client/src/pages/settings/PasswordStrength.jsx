import { motion } from 'framer-motion';

const checks = [
  { regex: /.{8,}/, label: 'At least 8 characters' },
  { regex: /[0-9]/, label: 'Contains a number' },
  { regex: /[A-Z]/, label: 'Contains an uppercase letter' },
  { regex: /[^A-Za-z0-9]/, label: 'Contains a special character' },
];

export default function PasswordStrength({ password }) {
  const score = checks.reduce((acc, check) => acc + (check.regex.test(password) ? 1 : 0), 0);
  
  const getStrengthColor = () => {
    if (score === 0) return 'bg-slate-200 dark:bg-slate-700';
    if (score <= 2) return 'bg-red-500';
    if (score === 3) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const getStrengthLabel = () => {
    if (score === 0) return '';
    if (score <= 2) return 'Weak';
    if (score === 3) return 'Medium';
    return 'Strong';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-500 dark:text-slate-400">Password Strength</span>
        <span className={`font-bold ${score <= 2 ? 'text-red-500' : score === 3 ? 'text-amber-500' : 'text-green-500'}`}>
          {getStrengthLabel()}
        </span>
      </div>
      
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${(score / 4) * 100}%` }}
          className={`h-full ${getStrengthColor()}`}
        />
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3">
        {checks.map((check, i) => {
          const passed = check.regex.test(password);
          return (
            <div key={i} className={`flex items-center space-x-1.5 text-xs ${passed ? 'text-green-600 dark:text-green-400' : 'text-slate-400'}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${passed ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
              <span>{check.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}