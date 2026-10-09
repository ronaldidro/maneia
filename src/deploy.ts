import { spawn } from 'child_process';
import * as dotenv from 'dotenv';

dotenv.config();

const serviceId = process.env.RENDER_SERVICE_ID;

if (!serviceId) {
  console.error('❌ RENDER_SERVICE_ID is not defined in the .env file');
  process.exit(1);
}

console.log(`🚀 Initiating deploy for service ${serviceId}...`);

const logsProcess = spawn(
  'render',
  ['logs', '--resources', serviceId, '--tail'],
  { stdio: 'inherit' },
);

const deployProcess = spawn('render', [
  'deploys',
  'create',
  serviceId,
  '--wait',
  '--confirm',
]);

deployProcess.stdout.on('data', (data: string) => process.stdout.write(data));
deployProcess.stderr.on('data', (data: string) => process.stderr.write(data));

deployProcess.on('close', (code) => {
  logsProcess.kill();

  if (code !== 0) {
    console.error('❌ Deployment failed.');
    process.exit(1);
  }

  setTimeout(() => {
    console.log('✅ Deployment successfully.');
    process.exit(0);
  }, 100);
});

process.on('SIGINT', () => {
  logsProcess.kill();
  deployProcess.kill();
  process.exit(0);
});
