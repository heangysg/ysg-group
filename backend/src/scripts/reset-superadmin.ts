import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { getPgClient } from '../lib/db';

dotenv.config();

function getArg(flag: string): string {
  const prefix = `--${flag}=`;
  const hit = process.argv.find((arg) => arg.startsWith(prefix));
  return hit ? hit.slice(prefix.length).trim() : '';
}

async function main() {
  const email = getArg('email');
  const password = getArg('password');

  if (!email || !password) {
    console.error('Usage: npm run reset-superadmin -- --email=admin@example.com --password=NewStrongPassword');
    process.exit(1);
  }

  if (password.length < 8) {
    console.error('Error: Password must be at least 8 characters long.');
    process.exit(1);
  }

  const pgClient = await getPgClient();
  try {
    const hashed = await bcrypt.hash(password, 10);
    const { rows } = await pgClient.query(
      `UPDATE "User"
       SET password = $1, "isSuperAdmin" = true, "isActive" = true, "updatedAt" = NOW()
       WHERE LOWER(email) = LOWER($2)
       RETURNING id, name, email, "isSuperAdmin", "isActive"`,
      [hashed, email]
    );

    if (rows.length === 0) {
      console.error(`No admin user found with email: ${email}`);
      process.exit(1);
    }

    console.log('Super Admin password reset successfully:', rows[0]);
  } finally {
    await pgClient.release();
    process.exit(0);
  }
}

main().catch((err) => {
  console.error('Failed to reset Super Admin password:', err);
  process.exit(1);
});

