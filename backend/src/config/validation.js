/**
 * Environment variable validation
 * Fails fast with descriptive errors if configuration is missing
 */

const REQUIRED_VARS = [
  { name: 'JWT_SECRET', description: 'JWT signing secret', defaultValue: 'dev-secret-key' },
];

const CONDITIONAL_VARS = [
  { 
    name: 'OPENROUTER_API_KEY', 
    description: 'OpenRouter API key for AI chat',
    check: (val) => val && val !== 'sk-or-v1-your-key-here',
    warning: 'OpenRouter API key not configured — AI chat will use fallback providers'
  },
  {
    name: 'GEMINI_API_KEY',
    description: 'Google Gemini API key (secondary AI provider)',
    check: (val) => val && val !== 'your-gemini-api-key-here',
    warning: 'Gemini API key not configured — secondary AI provider unavailable'
  },
];

const OPTIONAL_VARS = [
  { name: 'PORT', defaultValue: '5000' },
  { name: 'FRONTEND_URL', defaultValue: 'http://localhost:5500' },
  { name: 'CORS_ORIGIN', defaultValue: '' },
  { name: 'OPENROUTER_MODEL', defaultValue: 'google/gemini-2.5-flash' },
  { name: 'OPENROUTER_MAX_TOKENS', defaultValue: '1500' },
  { name: 'NODE_ENV', defaultValue: 'development' },
];

export function validateConfig() {
  const errors = [];
  const warnings = [];
  const config = {};

  // Check required vars
  for (const v of REQUIRED_VARS) {
    const val = process.env[v.name] || v.defaultValue;
    if (!val) {
      errors.push(`❌ Missing required environment variable: ${v.name} (${v.description})`);
    } else {
      config[v.name] = val;
    }
  }

  // Check conditional vars
  for (const v of CONDITIONAL_VARS) {
    const val = process.env[v.name];
    if (!val || !v.check(val)) {
      warnings.push(`⚠️  ${v.warning}`);
    }
    config[v.name] = val || '';
  }

  // Set optional vars with defaults
  for (const v of OPTIONAL_VARS) {
    config[v.name] = process.env[v.name] || v.defaultValue;
  }

  return { errors, warnings, config };
}

export function printConfigSummary(config) {
  console.log('\n📋 Configuration Summary:');
  console.log('═══════════════════════════');
  console.log(`  PORT:              ${config.PORT}`);
  console.log(`  NODE_ENV:          ${config.NODE_ENV}`);
  console.log(`  FRONTEND_URL:      ${config.FRONTEND_URL}`);
  console.log(`  CORS_ORIGIN:       ${config.CORS_ORIGIN || '(not set)'}`);
  console.log(`  OPENROUTER_MODEL:  ${config.OPENROUTER_MODEL}`);
  console.log(`  OPENROUTER_MAX_TOKENS: ${config.OPENROUTER_MAX_TOKENS}`);
  console.log(`  OPENROUTER_API_KEY: ${config.OPENROUTER_API_KEY ? '✅ configured' : '❌ not set'}`);
  console.log(`  GEMINI_API_KEY:    ${config.GEMINI_API_KEY ? '✅ configured' : '❌ not set'}`);
  console.log(`  JWT_SECRET:        ${config.JWT_SECRET ? '✅ configured' : '❌ not set'}`);
  console.log('═══════════════════════════\n');
}

