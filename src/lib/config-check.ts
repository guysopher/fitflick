/**
 * Configuration Checker Utility
 * Helps debug environment variable and configuration issues
 */

export interface ConfigCheck {
  name: string;
  value: string | undefined;
  required: boolean;
  isValid: boolean;
  error?: string;
}

export function checkEnvironmentConfig(): ConfigCheck[] {
  const requiredEnvVars = [
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'POSTGRES_URL',
  ];

  const optionalEnvVars = [
    'OPENAI_API_KEY',
    'ELEVENLABS_API_KEY',
  ];

  const allVars = [
    ...requiredEnvVars.map(name => ({ name, required: true })),
    ...optionalEnvVars.map(name => ({ name, required: false })),
  ];

  return allVars.map(({ name, required }) => {
    const value = process.env[name];
    const isValid = required ? !!value : true;
    
    let error: string | undefined;
    
    if (required && !value) {
      error = 'Required environment variable is missing';
    } else if (name === 'NEXTAUTH_URL' && value && !value.startsWith('http')) {
      error = 'NEXTAUTH_URL must be a valid HTTP URL';
    } else if (name.includes('SECRET') && value && value.length < 32) {
      error = 'Secret should be at least 32 characters long';
    }

    return {
      name,
      value: value ? (name.includes('SECRET') || name.includes('KEY') ? '***' : value) : undefined,
      required,
      isValid: isValid && !error,
      error,
    };
  });
}

export function getConfigSummary(): {
  allValid: boolean;
  requiredMissing: string[];
  errors: string[];
} {
  const checks = checkEnvironmentConfig();
  const requiredMissing = checks
    .filter(check => check.required && !check.value)
    .map(check => check.name);
  
  const errors = checks
    .filter(check => check.error)
    .map(check => `${check.name}: ${check.error}`);

  return {
    allValid: requiredMissing.length === 0 && errors.length === 0,
    requiredMissing,
    errors,
  };
}

export function logConfigStatus(): void {
  const summary = getConfigSummary();
  
  if (summary.allValid) {
    console.log('✅ All required environment variables are configured');
  } else {
    console.error('❌ Configuration issues detected:');
    
    if (summary.requiredMissing.length > 0) {
      console.error('Missing required variables:', summary.requiredMissing.join(', '));
    }
    
    if (summary.errors.length > 0) {
      summary.errors.forEach(error => console.error(`- ${error}`));
    }
  }
  
  // In development, show detailed info
  if (process.env.NODE_ENV === 'development') {
    console.table(checkEnvironmentConfig());
  }
} 