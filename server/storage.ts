import {
  User,
  InsertUser,
  UrlScan,
  InsertUrlScan,
  VirusDefinition,
  InsertVirusDefinition,
  FileScanResult,
  InsertFileScanResult,
  VulnerabilityType,
  InsertVulnerabilityType,
  CodeScanResult,
  InsertCodeScanResult,
  Vulnerability,
  SubscriptionPlan,
  InsertSubscriptionPlan,
  UserSubscription,
  InsertUserSubscription,
  PaymentTransaction,
  InsertPaymentTransaction
} from "@shared/schema";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export interface IStorage {
  // User methods from original template
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // URL Scans
  saveUrlScan(scan: InsertUrlScan): Promise<UrlScan>;
  getRecentUrlScans(limit?: number): Promise<UrlScan[]>;
  
  // Virus definitions
  getVirusDefinitions(): Promise<VirusDefinition[]>;
  getVirusByHash(hash: string): Promise<VirusDefinition | undefined>;
  addVirusDefinition(virus: InsertVirusDefinition): Promise<VirusDefinition>;
  
  // File Scans
  saveFileScanResult(scan: InsertFileScanResult): Promise<FileScanResult>;
  getRecentFileScanResults(limit?: number): Promise<FileScanResult[]>;
  
  // Vulnerability types
  getVulnerabilityTypes(): Promise<VulnerabilityType[]>;
  getVulnerabilityTypeByCode(code: string): Promise<VulnerabilityType | undefined>;
  addVulnerabilityType(type: InsertVulnerabilityType): Promise<VulnerabilityType>;
  
  // Code Scans
  saveCodeScanResult(scan: InsertCodeScanResult): Promise<CodeScanResult>;
  getRecentCodeScanResults(limit?: number): Promise<CodeScanResult[]>;

  // Subscription Plans
  getSubscriptionPlans(): Promise<SubscriptionPlan[]>;
  getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined>;
  getSubscriptionPlansByType(planType: string): Promise<SubscriptionPlan[]>;
  addSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan>;
  updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined>;
  
  // User Subscriptions
  getUserSubscriptions(userId: number): Promise<UserSubscription[]>;
  getCurrentSubscription(userId: number): Promise<UserSubscription | undefined>;
  addUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription>;
  updateUserSubscription(id: number, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined>;
  
  // Payment Transactions
  savePaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction>;
  getPaymentTransactionsByUser(userId: number): Promise<PaymentTransaction[]>;
  getPaymentTransactionById(id: number): Promise<PaymentTransaction | undefined>;

  // Initialize mock data
  initMockData(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private urlScans: Map<number, UrlScan>;
  private virusDefinitions: Map<number, VirusDefinition>;
  private fileScanResults: Map<number, FileScanResult>;
  private vulnerabilityTypes: Map<number, VulnerabilityType>;
  private codeScanResults: Map<number, CodeScanResult>;
  private subscriptionPlans: Map<number, SubscriptionPlan>;
  private userSubscriptions: Map<number, UserSubscription>;
  private paymentTransactions: Map<number, PaymentTransaction>;
  
  private currentUserId: number;
  private currentUrlScanId: number;
  private currentVirusId: number;
  private currentFileScanId: number;
  private currentVulnerabilityTypeId: number;
  private currentCodeScanId: number;
  private currentSubscriptionPlanId: number;
  private currentUserSubscriptionId: number;
  private currentPaymentTransactionId: number;

  constructor() {
    this.users = new Map();
    this.urlScans = new Map();
    this.virusDefinitions = new Map();
    this.fileScanResults = new Map();
    this.vulnerabilityTypes = new Map();
    this.codeScanResults = new Map();
    this.subscriptionPlans = new Map();
    this.userSubscriptions = new Map();
    this.paymentTransactions = new Map();
    
    this.currentUserId = 1;
    this.currentUrlScanId = 1;
    this.currentVirusId = 1;
    this.currentFileScanId = 1;
    this.currentVulnerabilityTypeId = 1;
    this.currentCodeScanId = 1;
    this.currentSubscriptionPlanId = 1;
    this.currentUserSubscriptionId = 1;
    this.currentPaymentTransactionId = 1;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // URL Scans
  async saveUrlScan(scan: InsertUrlScan): Promise<UrlScan> {
    const id = this.currentUrlScanId++;
    const urlScan: UrlScan = { 
      ...scan, 
      id, 
      reasons: scan.reasons || null 
    };
    this.urlScans.set(id, urlScan);
    return urlScan;
  }

  async getRecentUrlScans(limit: number = 10): Promise<UrlScan[]> {
    return Array.from(this.urlScans.values())
      .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
      .slice(0, limit);
  }

  // Virus definitions
  async getVirusDefinitions(): Promise<VirusDefinition[]> {
    return Array.from(this.virusDefinitions.values());
  }

  async getVirusByHash(hash: string): Promise<VirusDefinition | undefined> {
    return Array.from(this.virusDefinitions.values()).find(
      (virus) => virus.hash === hash
    );
  }

  async addVirusDefinition(virus: InsertVirusDefinition): Promise<VirusDefinition> {
    const id = this.currentVirusId++;
    const virusDefinition: VirusDefinition = { 
      ...virus, 
      id,
      description: virus.description || null
    };
    this.virusDefinitions.set(id, virusDefinition);
    return virusDefinition;
  }

  // File Scans
  async saveFileScanResult(scan: InsertFileScanResult): Promise<FileScanResult> {
    const id = this.currentFileScanId++;
    const fileScanResult: FileScanResult = { 
      ...scan, 
      id,
      virusId: scan.virusId || null
    };
    this.fileScanResults.set(id, fileScanResult);
    return fileScanResult;
  }

  async getRecentFileScanResults(limit: number = 10): Promise<FileScanResult[]> {
    return Array.from(this.fileScanResults.values())
      .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
      .slice(0, limit);
  }

  // Vulnerability types
  async getVulnerabilityTypes(): Promise<VulnerabilityType[]> {
    return Array.from(this.vulnerabilityTypes.values());
  }

  async getVulnerabilityTypeByCode(code: string): Promise<VulnerabilityType | undefined> {
    return Array.from(this.vulnerabilityTypes.values()).find(
      (type) => type.code === code
    );
  }

  async addVulnerabilityType(type: InsertVulnerabilityType): Promise<VulnerabilityType> {
    const id = this.currentVulnerabilityTypeId++;
    const vulnerabilityType: VulnerabilityType = { ...type, id };
    this.vulnerabilityTypes.set(id, vulnerabilityType);
    return vulnerabilityType;
  }

  // Code Scans
  async saveCodeScanResult(scan: InsertCodeScanResult): Promise<CodeScanResult> {
    const id = this.currentCodeScanId++;
    const codeScanResult: CodeScanResult = { ...scan, id };
    this.codeScanResults.set(id, codeScanResult);
    return codeScanResult;
  }

  async getRecentCodeScanResults(limit: number = 10): Promise<CodeScanResult[]> {
    return Array.from(this.codeScanResults.values())
      .sort((a, b) => new Date(b.scannedAt).getTime() - new Date(a.scannedAt).getTime())
      .slice(0, limit);
  }
  
  // Subscription Plans methods
  async getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values());
  }
  
  async getSubscriptionPlanById(id: number): Promise<SubscriptionPlan | undefined> {
    return this.subscriptionPlans.get(id);
  }
  
  async getSubscriptionPlansByType(planType: string): Promise<SubscriptionPlan[]> {
    return Array.from(this.subscriptionPlans.values())
      .filter(plan => plan.planType === planType);
  }
  
  async addSubscriptionPlan(plan: InsertSubscriptionPlan): Promise<SubscriptionPlan> {
    const id = this.currentSubscriptionPlanId++;
    const subscriptionPlan: SubscriptionPlan = { 
      ...plan, 
      id, 
      createdAt: new Date().toISOString() 
    };
    this.subscriptionPlans.set(id, subscriptionPlan);
    return subscriptionPlan;
  }
  
  async updateSubscriptionPlan(id: number, plan: Partial<InsertSubscriptionPlan>): Promise<SubscriptionPlan | undefined> {
    const existingPlan = this.subscriptionPlans.get(id);
    if (!existingPlan) {
      return undefined;
    }
    
    const updatedPlan: SubscriptionPlan = { ...existingPlan, ...plan };
    this.subscriptionPlans.set(id, updatedPlan);
    return updatedPlan;
  }
  
  // User Subscriptions methods
  async getUserSubscriptions(userId: number): Promise<UserSubscription[]> {
    return Array.from(this.userSubscriptions.values())
      .filter(subscription => subscription.userId === userId);
  }
  
  async getCurrentSubscription(userId: number): Promise<UserSubscription | undefined> {
    const today = new Date().toISOString();
    return Array.from(this.userSubscriptions.values())
      .find(subscription => 
        subscription.userId === userId && 
        subscription.status === "active" && 
        subscription.endDate >= today
      );
  }
  
  async addUserSubscription(subscription: InsertUserSubscription): Promise<UserSubscription> {
    const id = this.currentUserSubscriptionId++;
    const userSubscription: UserSubscription = { ...subscription, id, createdAt: new Date().toISOString() };
    this.userSubscriptions.set(id, userSubscription);
    return userSubscription;
  }
  
  async updateUserSubscription(id: number, subscription: Partial<InsertUserSubscription>): Promise<UserSubscription | undefined> {
    const existingSubscription = this.userSubscriptions.get(id);
    if (!existingSubscription) {
      return undefined;
    }
    
    const updatedSubscription: UserSubscription = { ...existingSubscription, ...subscription };
    this.userSubscriptions.set(id, updatedSubscription);
    return updatedSubscription;
  }
  
  // Payment Transactions methods
  async savePaymentTransaction(transaction: InsertPaymentTransaction): Promise<PaymentTransaction> {
    const id = this.currentPaymentTransactionId++;
    const paymentTransaction: PaymentTransaction = { ...transaction, id, createdAt: new Date().toISOString() };
    this.paymentTransactions.set(id, paymentTransaction);
    return paymentTransaction;
  }
  
  async getPaymentTransactionsByUser(userId: number): Promise<PaymentTransaction[]> {
    return Array.from(this.paymentTransactions.values())
      .filter(transaction => transaction.userId === userId);
  }
  
  async getPaymentTransactionById(id: number): Promise<PaymentTransaction | undefined> {
    return this.paymentTransactions.get(id);
  }

  // Initialize mock data
  async initMockData(): Promise<void> {
    // Add demo user
    await this.createUser({
      username: "demo",
      password: await hashPassword("password"),
      email: "demo@example.com"
    });
    
    // Add sample virus definitions
    await this.addVirusDefinition({
      hash: "5e8c1a1e779e6b3edfcca1c16af2d5c5",
      name: "Win32.FakeTrojan.A",
      type: "Trojan",
      description: "A fake trojan for demo purposes",
      severity: "Critical"
    });

    await this.addVirusDefinition({
      hash: "9d77f54d31b5e6c9a4177f8b6694d9a6",
      name: "FakeWorm.B",
      type: "Worm",
      description: "A simulated worm virus",
      severity: "High"
    });

    await this.addVirusDefinition({
      hash: "6d2e2082d68dd52e5b48a62c0e7c6a72",
      name: "RansomDemo.C",
      type: "Ransomware",
      description: "A mock ransomware for testing",
      severity: "Critical"
    });

    // Add vulnerability types based on OWASP Top 10
    await this.addVulnerabilityType({
      name: "SQL Injection",
      code: "A1:2017",
      description: "SQL injection flaws occur when software constructs SQL statements that include user-supplied data without proper validation.",
      severity: "Critical"
    });

    await this.addVulnerabilityType({
      name: "Broken Authentication",
      code: "A2:2017",
      description: "Authentication weaknesses that allow attackers to compromise passwords, keys, or session tokens.",
      severity: "Critical"
    });

    await this.addVulnerabilityType({
      name: "Sensitive Data Exposure",
      code: "A3:2017",
      description: "Sensitive data that is not protected sufficiently, such as passwords, credit card numbers, health records, etc.",
      severity: "High"
    });

    await this.addVulnerabilityType({
      name: "XML External Entities (XXE)",
      code: "A4:2017",
      description: "Poorly configured XML parsers that evaluate external entity references.",
      severity: "High"
    });

    await this.addVulnerabilityType({
      name: "Broken Access Control",
      code: "A5:2017",
      description: "Improper enforcement of restrictions on authenticated users.",
      severity: "Medium"
    });

    await this.addVulnerabilityType({
      name: "Security Misconfiguration",
      code: "A6:2017",
      description: "Insecure default configurations, open cloud storage, verbose error messages.",
      severity: "Medium"
    });

    await this.addVulnerabilityType({
      name: "Cross-Site Scripting (XSS)",
      code: "A7:2017",
      description: "Flaws that allow execution of scripts in the victim's browser.",
      severity: "Medium"
    });

    await this.addVulnerabilityType({
      name: "Insecure Deserialization",
      code: "A8:2017",
      description: "Flaws in deserializing data leading to remote code execution.",
      severity: "High"
    });

    await this.addVulnerabilityType({
      name: "Using Components with Known Vulnerabilities",
      code: "A9:2017",
      description: "Using libraries and frameworks with known security vulnerabilities.",
      severity: "Medium"
    });

    await this.addVulnerabilityType({
      name: "Insufficient Logging & Monitoring",
      code: "A10:2017",
      description: "Insufficient logging and monitoring, combined with missing or ineffective integration with incident response.",
      severity: "Low"
    });

    // Add some sample URL scans
    await this.saveUrlScan({
      url: "example.com/login",
      isPhishing: false,
      reasons: [],
      scannedAt: new Date().toISOString()
    });

    await this.saveUrlScan({
      url: "paypa1.com/secure-login",
      isPhishing: true,
      reasons: [
        "Domain mimics a popular brand (PayPal)",
        "Uses number '1' instead of letter 'l'",
        "Contains suspicious keywords: 'secure-login'"
      ],
      scannedAt: new Date().toISOString()
    });
    
    // Add subscription plans
    await this.addSubscriptionPlan({
      name: "Student",
      price: 499,
      duration: 30,
      description: "Perfect for students and educational use",
      features: [
        "Basic phishing URL detection",
        "File scanning (up to 10 MB)",
        "Code vulnerability scanning (basic)",
        "Email support"
      ],
      isActive: true,
      planType: "student"
    });
    
    await this.addSubscriptionPlan({
      name: "Professional",
      price: 1499,
      duration: 30,
      description: "Ideal for professionals and small businesses",
      features: [
        "Advanced phishing URL detection",
        "File scanning (up to 50 MB)",
        "Code vulnerability scanning (advanced)",
        "Advanced threat detection",
        "Batch file scanning",
        "Email and chat support"
      ],
      isActive: true,
      planType: "professional"
    });
    
    await this.addSubscriptionPlan({
      name: "Enterprise",
      price: 4999,
      duration: 30,
      description: "Full security suite for organizations",
      features: [
        "Enterprise-grade phishing detection",
        "File scanning (unlimited)",
        "Code vulnerability scanning (premium)",
        "Advanced threat detection",
        "Batch file scanning",
        "Developer mode access",
        "Priority support",
        "Dedicated account manager"
      ],
      isActive: true,
      planType: "enterprise"
    });
  }
}

export const storage = new MemStorage();
// Initialize mock data on server start
storage.initMockData().catch(console.error);
