import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from "crypto";
import { z } from "zod";
import { createOrder, verifyPaymentSignature } from "./razorpay";
import { setupAuth } from "./auth";

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication
  setupAuth(app);
  
  // API prefix for all routes
  const apiPrefix = "/api";

  // URL scanning endpoint
  app.post(`${apiPrefix}/phishing/check`, async (req, res) => {
    try {
      const schema = z.object({
        url: z.string().url().or(z.string().min(1))
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      const { url } = result.data;
      
      // Check for common phishing patterns
      const phishingPatterns = [
        // Suspicious TLDs
        /\.(xyz|tk|ml|ga|cf|gq|top)$/i,
        // Numbers replacing letters
        /(paypa[l1]|am[a4]zon|g[o0]{2}g[l1]e|[a4]pple|f[a4]c[e3]b[o0]{2}k|micr[o0]s[o0]ft|netfl[i1]x)/i,
        // Common phishing keywords
        /(secure|verify|account|login|signin|bank|confirm|update|password)/i,
        // IP address in URL
        /https?:\/\/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/i,
        // Common misspellings of popular domains
        /(amaz[o0]n|g[o0]{2}le|facebo[o0]k|inst[a4]gr[a4]m|payp[a4]l|netfl[i1]x|tw[i1]tter|m[i1]cr[o0]s[o0]ft)/i,
        // Excessive subdomains
        /https?:\/\/([^\/]+\.){5,}/i,
        // Too many dashes in domain
        /https?:\/\/[^\/]*(-[^\/]*){3,}/i
      ];

      const reasons: string[] = [];
      let isPhishing = false;
      
      // Suspicious TLD check
      if (phishingPatterns[0].test(url)) {
        reasons.push("Uses a suspicious top-level domain");
        isPhishing = true;
      }
      
      // Number substitution for letters
      if (phishingPatterns[1].test(url)) {
        reasons.push("Uses numbers instead of similar-looking letters");
        isPhishing = true;
      }
      
      // Phishing keywords
      if (phishingPatterns[2].test(url)) {
        reasons.push("Contains suspicious keywords commonly used in phishing");
        isPhishing = true;
      }
      
      // IP address URL
      if (phishingPatterns[3].test(url)) {
        reasons.push("Uses an IP address instead of a domain name");
        isPhishing = true;
      }
      
      // Common misspellings
      if (phishingPatterns[4].test(url)) {
        reasons.push("Contains misspelling of a popular brand");
        isPhishing = true;
      }
      
      // Excessive subdomains
      if (phishingPatterns[5].test(url)) {
        reasons.push("Has an excessive number of subdomains");
        isPhishing = true;
      }
      
      // Too many dashes
      if (phishingPatterns[6].test(url)) {
        reasons.push("Contains too many dashes in the domain name");
        isPhishing = true;
      }
      
      // Save scan result
      const urlScan = await storage.saveUrlScan({
        url,
        isPhishing,
        reasons,
        scannedAt: new Date().toISOString()
      });
      
      res.json({
        url,
        isPhishing,
        reasons,
        id: urlScan.id
      });
    } catch (err) {
      console.error("Error checking URL:", err);
      res.status(500).json({ error: "Failed to process URL check" });
    }
  });

  // Get recent URL scans
  app.get(`${apiPrefix}/phishing/history`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const scans = await storage.getRecentUrlScans(limit);
      res.json(scans);
    } catch (err) {
      console.error("Error fetching URL scan history:", err);
      res.status(500).json({ error: "Failed to fetch URL scan history" });
    }
  });

  // File scanning endpoint
  app.post(`${apiPrefix}/files/scan`, async (req, res) => {
    try {
      const schema = z.object({
        fileName: z.string().min(1),
        fileSize: z.number().int().positive(),
        fileContent: z.string().min(1) // Base64 encoded file content
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid file data" });
      }

      const { fileName, fileSize, fileContent } = result.data;
      
      // Calculate MD5 hash of the file content
      const fileBuffer = Buffer.from(fileContent, 'base64');
      const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');
      
      // Check if the hash matches any known virus definitions
      const virusDefinition = await storage.getVirusByHash(fileHash);
      const isInfected = !!virusDefinition;
      
      // Save scan result
      const scanResult = await storage.saveFileScanResult({
        fileName,
        fileSize,
        fileHash,
        isInfected,
        virusId: virusDefinition ? virusDefinition.id : undefined,
        scannedAt: new Date().toISOString()
      });
      
      res.json({
        id: scanResult.id,
        fileName,
        fileSize,
        fileHash,
        isInfected,
        virus: virusDefinition,
        scannedAt: scanResult.scannedAt
      });
    } catch (err) {
      console.error("Error scanning file:", err);
      res.status(500).json({ error: "Failed to process file scan" });
    }
  });

  // Get recent file scan results
  app.get(`${apiPrefix}/files/history`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const scans = await storage.getRecentFileScanResults(limit);
      
      // Hydrate virus information
      const results = await Promise.all(scans.map(async (scan) => {
        if (scan.virusId) {
          const virus = await storage.getUser(scan.virusId);
          return { ...scan, virus };
        }
        return scan;
      }));
      
      res.json(results);
    } catch (err) {
      console.error("Error fetching file scan history:", err);
      res.status(500).json({ error: "Failed to fetch file scan history" });
    }
  });

  // Code vulnerability scanning endpoint
  app.post(`${apiPrefix}/code/scan`, async (req, res) => {
    try {
      const schema = z.object({
        language: z.string().min(1),
        codeSnippet: z.string().min(1)
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid code data" });
      }

      const { language, codeSnippet } = result.data;
      
      // Define patterns for common vulnerabilities based on language
      const vulnerabilityPatterns: Record<string, any[]> = {
        javascript: [
          {
            pattern: /document\.write\s*\(/i,
            type: "Cross-Site Scripting (XSS)",
            code: "A7:2017",
            severity: "Medium",
            recommendation: "Avoid using document.write() as it can enable XSS attacks. Use safer DOM manipulation methods."
          },
          {
            pattern: /\.innerHTML\s*=(?!\s*escapeHTML)/i,
            type: "Cross-Site Scripting (XSS)",
            code: "A7:2017",
            severity: "Medium",
            recommendation: "Use textContent instead of innerHTML, or ensure content is sanitized before assignment."
          },
          {
            pattern: /eval\s*\(/i,
            type: "Insecure Code Execution",
            code: "A7:2017",
            severity: "High",
            recommendation: "Avoid using eval() as it executes arbitrary code and poses security risks."
          },
          {
            pattern: /password|api[_-]?key|secret|token|credentials|pass/i,
            type: "Sensitive Data Exposure",
            code: "A3:2017",
            severity: "High",
            recommendation: "Avoid hardcoding sensitive information. Use environment variables or secure vaults."
          }
        ],
        php: [
          {
            pattern: /\$_GET|\$_POST|\$_REQUEST/i,
            type: "Insufficient Input Validation",
            code: "A1:2017",
            severity: "Medium",
            recommendation: "Always validate and sanitize user input before using it."
          },
          {
            pattern: /mysqli_query\s*\(.*\$.*\)/i,
            type: "SQL Injection",
            code: "A1:2017",
            severity: "Critical",
            recommendation: "Use prepared statements with parameter binding instead of concatenating SQL queries."
          },
          {
            pattern: /echo\s+.*\$_/i,
            type: "Cross-Site Scripting (XSS)",
            code: "A7:2017",
            severity: "Medium",
            recommendation: "Use htmlspecialchars() to escape output when echoing user input."
          }
        ],
        python: [
          {
            pattern: /exec\s*\(|eval\s*\(/i,
            type: "Insecure Code Execution",
            code: "A7:2017",
            severity: "Critical",
            recommendation: "Avoid using exec() or eval() as they can execute arbitrary code."
          },
          {
            pattern: /cursor\.execute\s*\(.*\%.*\)/i,
            type: "SQL Injection",
            code: "A1:2017",
            severity: "Critical",
            recommendation: "Use parameterized queries with placeholders instead of string formatting or concatenation."
          },
          {
            pattern: /pickle\.loads/i,
            type: "Insecure Deserialization",
            code: "A8:2017",
            severity: "High",
            recommendation: "Avoid using pickle for deserialization of untrusted data, use JSON or other safer alternatives."
          }
        ],
        html: [
          {
            pattern: /<script[^>]*src=["']http:/i,
            type: "Mixed Content",
            code: "A6:2017",
            severity: "Medium",
            recommendation: "Use HTTPS for all external resources to prevent man-in-the-middle attacks."
          },
          {
            pattern: /onclick|onload|onmouseover|onerror/i,
            type: "Cross-Site Scripting (XSS)",
            code: "A7:2017",
            severity: "Medium",
            recommendation: "Avoid inline JavaScript event handlers. Use unobtrusive JavaScript instead."
          }
        ],
        sql: [
          {
            pattern: /SELECT\s+\*\s+FROM/i,
            type: "Inefficient Query",
            code: "A6:2017",
            severity: "Low",
            recommendation: "Specify only needed columns instead of selecting all (*) to improve performance and security."
          },
          {
            pattern: /DROP\s+TABLE|TRUNCATE\s+TABLE/i,
            type: "Destructive Operation",
            code: "A5:2017",
            severity: "Critical",
            recommendation: "Be cautious with destructive operations, ensure proper access controls are in place."
          }
        ]
      };
      
      // Default to JavaScript patterns if language not supported
      const patterns = vulnerabilityPatterns[language.toLowerCase()] || vulnerabilityPatterns.javascript;
      
      // Detect vulnerabilities
      const vulnerabilities: any[] = [];
      const lines = codeSnippet.split('\n');
      
      patterns.forEach(({ pattern, type, code, severity, recommendation }) => {
        lines.forEach((line, index) => {
          if (pattern.test(line)) {
            vulnerabilities.push({
              id: vulnerabilities.length + 1,
              type,
              code,
              line: index + 1,
              snippet: line.trim(),
              recommendation,
              severity
            });
          }
        });
      });
      
      // Save scan result
      const scanResult = await storage.saveCodeScanResult({
        language,
        codeSnippet,
        vulnerabilities,
        scannedAt: new Date().toISOString()
      });
      
      res.json({
        id: scanResult.id,
        language,
        vulnerabilities,
        totalIssues: vulnerabilities.length,
        criticalCount: vulnerabilities.filter(v => v.severity === 'Critical').length,
        highCount: vulnerabilities.filter(v => v.severity === 'High').length,
        mediumCount: vulnerabilities.filter(v => v.severity === 'Medium').length,
        lowCount: vulnerabilities.filter(v => v.severity === 'Low').length,
        scannedAt: scanResult.scannedAt
      });
    } catch (err) {
      console.error("Error scanning code:", err);
      res.status(500).json({ error: "Failed to process code scan" });
    }
  });

  // Get OWASP vulnerability types
  app.get(`${apiPrefix}/vulnerabilities`, async (req, res) => {
    try {
      const types = await storage.getVulnerabilityTypes();
      res.json(types);
    } catch (err) {
      console.error("Error fetching vulnerability types:", err);
      res.status(500).json({ error: "Failed to fetch vulnerability types" });
    }
  });

  // Get recent code scan results
  app.get(`${apiPrefix}/code/history`, async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
      const scans = await storage.getRecentCodeScanResults(limit);
      res.json(scans);
    } catch (err) {
      console.error("Error fetching code scan history:", err);
      res.status(500).json({ error: "Failed to fetch code scan history" });
    }
  });

  // Get virus definitions
  app.get(`${apiPrefix}/viruses`, async (req, res) => {
    try {
      const viruses = await storage.getVirusDefinitions();
      res.json(viruses);
    } catch (err) {
      console.error("Error fetching virus definitions:", err);
      res.status(500).json({ error: "Failed to fetch virus definitions" });
    }
  });

  // Get subscription plans
  app.get(`${apiPrefix}/subscription/plans`, async (req, res) => {
    try {
      const plans = await storage.getSubscriptionPlans();
      res.json(plans);
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  // Get subscription plans by type
  app.get(`${apiPrefix}/subscription/plans/:type`, async (req, res) => {
    try {
      const { type } = req.params;
      const plans = await storage.getSubscriptionPlansByType(type);
      res.json(plans);
    } catch (err) {
      console.error("Error fetching subscription plans by type:", err);
      res.status(500).json({ error: "Failed to fetch subscription plans" });
    }
  });

  // Create a Razorpay order
  app.post(`${apiPrefix}/subscription/create-order`, async (req, res) => {
    try {
      const schema = z.object({
        planId: z.string().min(1),
        amount: z.number().int().positive()
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid order data" });
      }

      const { planId, amount } = result.data;
      
      // Create a new order
      const order = await createOrder(amount);
      
      // Save order info
      const receipt = `plan_${planId}_${Date.now()}`;
      
      res.json(order);
    } catch (err) {
      console.error("Error creating order:", err);
      res.status(500).json({ error: "Failed to create payment order" });
    }
  });

  // Verify Razorpay payment
  app.post(`${apiPrefix}/subscription/verify-payment`, async (req, res) => {
    try {
      const schema = z.object({
        razorpay_payment_id: z.string().min(1),
        razorpay_order_id: z.string().min(1),
        razorpay_signature: z.string().min(1),
        orderData: z.any()
      });

      const result = schema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ error: "Invalid payment verification data" });
      }

      const { razorpay_payment_id, razorpay_order_id, razorpay_signature, orderData } = result.data;
      
      // Verify payment signature
      const isValidSignature = verifyPaymentSignature(
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature
      );
      
      if (!isValidSignature) {
        return res.status(400).json({ error: "Invalid payment signature" });
      }
      
      // For demo, assume user ID 1
      const userId = 1;
      const planId = parseInt(orderData.notes?.planId || "1");
      
      // Record payment transaction
      const paymentTransaction = await storage.savePaymentTransaction({
        userId,
        subscriptionId: null, // Will be updated after subscription is created
        amount: orderData.amount,
        currency: orderData.currency,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        status: "success",
        paymentMethod: "razorpay"
      });
      
      // Get subscription plan
      const plan = await storage.getSubscriptionPlanById(planId);
      if (!plan) {
        return res.status(404).json({ error: "Subscription plan not found" });
      }
      
      // Create subscription
      const startDate = new Date().toISOString();
      const endDate = new Date(Date.now() + plan.duration * 24 * 60 * 60 * 1000).toISOString();
      
      const subscription = await storage.addUserSubscription({
        userId,
        planId,
        startDate,
        endDate,
        status: "active",
        paymentId: razorpay_payment_id
      });
      
      // Update payment transaction with subscription ID
      await storage.updateUserSubscription(subscription.id, {
        ...subscription
      });
      
      res.json({
        success: true,
        message: "Payment verified successfully",
        subscription
      });
    } catch (err) {
      console.error("Error verifying payment:", err);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  });

  // Get current user subscription (for demo, assume user ID 1)
  app.get(`${apiPrefix}/subscription/current`, async (req, res) => {
    try {
      // For demo, assume user ID 1
      const userId = 1;
      const subscription = await storage.getCurrentSubscription(userId);
      
      if (!subscription) {
        return res.status(404).json({ error: "No active subscription found" });
      }
      
      // Get plan details
      const plan = await storage.getSubscriptionPlanById(subscription.planId);
      
      res.json({
        subscription,
        plan
      });
    } catch (err) {
      console.error("Error fetching current subscription:", err);
      res.status(500).json({ error: "Failed to fetch subscription" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
