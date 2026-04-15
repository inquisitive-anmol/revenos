import mongoose, { Schema } from 'mongoose';
import { config } from 'dotenv';
import path from 'path';

// 1. Load configuration
config({ path: path.join(process.cwd(), '.env') });

const MONGODB_URI = process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error('❌ DATABASE_URL not found in .env');
  process.exit(1);
}

// 2. Define Schemas locally to avoid import issues
const CreditPackageSchema = new Schema({
  name: { type: String, required: true },
  credits: { type: Number, required: true },
  priceUsd: { type: Number, required: true },
  stripePriceId: { type: String, required: true },
  isActive: { type: Boolean, default: true },
  isPopular: { type: Boolean, default: false },
}, { timestamps: true });

const CreditWalletSchema = new Schema({
  workspaceId: { type: String, required: true, unique: true },
  balance: { type: Number, default: 0 },
  lifetimeEarned: { type: Number, default: 0 },
  lifetimeSpent: { type: Number, default: 0 },
}, { timestamps: true });

const BillingSchema = new Schema({
  workspaceId: { type: String, required: true, unique: true },
  plan: { type: String, enum: ['free', 'starter', 'growth', 'scale'], default: 'free' },
  status: { type: String, default: 'active' },
  monthlyCreditsIncluded: { type: Number, default: 100 },
  currentPeriodEnd: { type: Date },
  nextResetAt: { type: Date },
}, { timestamps: true });

const WorkspaceSchema = new Schema({
  name: { type: String, required: true },
  clerkOwnerId: { type: String },
}, { timestamps: true });

const CreditPackage = mongoose.models.CreditPackage || mongoose.model('CreditPackage', CreditPackageSchema);
const CreditWallet = mongoose.models.CreditWallet || mongoose.model('CreditWallet', CreditWalletSchema);
const Billing = mongoose.models.Billing || mongoose.model('Billing', BillingSchema);
const Workspace = mongoose.models.Workspace || mongoose.model('Workspace', WorkspaceSchema);

// 3. Define the Global Packages
const packages = [
  { name: 'Starter Pack', credits: 500, priceUsd: 10, stripePriceId: 'razorpay_topup_starter', isActive: true, isPopular: false },
  { name: 'Growth Pack', credits: 2500, priceUsd: 40, stripePriceId: 'razorpay_topup_growth', isActive: true, isPopular: true },
  { name: 'Scale Pack', credits: 10000, priceUsd: 120, stripePriceId: 'razorpay_topup_scale', isActive: true, isPopular: false },
];

async function seed() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI!);
    console.log('✅ Connected.');

    // A. Seed Global Packages
    console.log('🗑️ Cleaning existing packages...');
    await CreditPackage.deleteMany({});
    console.log('🌱 Seeding global credit packages...');
    await CreditPackage.insertMany(packages);

    // B. Find Workspace to provision
    console.log('🔍 Looking for an existing workspace...');
    const workspace = await Workspace.findOne().sort({ createdAt: 1 });

    if (!workspace) {
      console.warn('⚠️ No workspace found in database. Please sign up in the app first!');
    } else {
      const workspaceId = workspace._id.toString();
      console.log(`🏠 Found Workspace: "${workspace.name}" (${workspaceId})`);

      // 1. Provision Wallet
      const walletExists = await CreditWallet.findOne({ workspaceId });
      if (!walletExists) {
        console.log('💳 Creating Credit Wallet...');
        await CreditWallet.create({
          workspaceId,
          balance: 100,
          lifetimeEarned: 100,
        });
      } else {
        console.log('✅ Credit Wallet already exists.');
      }

      // 2. Provision Billing
      const billingExists = await Billing.findOne({ workspaceId });
      if (!billingExists) {
        console.log('📝 Creating Billing profile (Free plan)...');
        const nextMonth = new Date();
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        await Billing.create({
          workspaceId,
          plan: 'free',
          status: 'active',
          monthlyCreditsIncluded: 100,
          currentPeriodEnd: nextMonth,
          nextResetAt: nextMonth,
        });
      } else {
        console.log('✅ Billing profile already exists.');
      }
    }

    console.log('✨ Seeding and provisioning complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
