const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

// Filter out existing questions to avoid duplicates
db.questions = [];

const categories = {
  tech: [
    "course-2", "course-6", "course-16", "course-19", "course-20", "course-23", "course-24", "course-25"
  ],
  data_ai: [
    "course-1", "course-3", "course-4", "course-5", "course-7"
  ],
  design: [
    "course-8", "course-15"
  ],
  business: [
    "course-9", "course-10", "course-11", "course-13", "course-17"
  ],
  social: [
    "course-12", "course-14", "course-18", "course-21", "course-22"
  ]
};

const templates = {
  tech: [
    (i) => ({
      question: `Scenario ${i}: In a distributed microservices architecture, Service A calls Service B with a timeout of ${i * 10}ms. Service B experiences latency spikes of ${i * 15}ms during peak load. Which resilient pattern should be implemented to prevent cascading failures?`,
      options: ["Circuit Breaker with exponential backoff", "Synchronous blocking calls", "Increase timeout to 5000ms", "Remove Service B and merge with Service A"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: You notice an N+1 query problem in your ORM while fetching ${i * 50} relational records. What is the most optimized approach to resolve this latency bottleneck at the database layer?`,
      options: ["Implement Eager Loading (JOINs) or Batching (DataLoader)", "Run a loop and query each record individually", "Store all data in an unstructured format", "Increase server RAM"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: A race condition occurs when ${i * 5} concurrent threads attempt to increment a shared counter in memory. Which synchronization primitive is most appropriate with the lowest overhead?`,
      options: ["Atomic Operations / Compare-and-Swap (CAS)", "Heavyweight Mutex Lock", "Global Interpreter Lock", "Sleep(100) before accessing"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: Your frontend bundle size has bloated to ${i + 3}MB, severely impacting First Contentful Paint (FCP). What is the most effective modern strategy to optimize this?`,
      options: ["Implement Route-based Code Splitting and Tree Shaking", "Minify HTML only", "Remove all CSS styles", "Serve the app via HTTP/1.0"],
      correctOptionIndex: 0
    })
  ],
  data_ai: [
    (i) => ({
      question: `Scenario ${i}: While training a deep neural network on a dataset with ${i * 1000} samples, you observe exploding gradients. Which technique is a standard mathematical fix for this?`,
      options: ["Gradient Clipping and Batch Normalization", "Increase the learning rate to 1.0", "Use a linear activation function for all layers", "Reduce the batch size to 1"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: A SQL query joining ${i % 5 + 3} massive tables is causing a full table scan and taking ${i * 2} minutes. How do you optimize the execution plan?`,
      options: ["Analyze the query execution plan and create composite indexes on join predicates", "Use SELECT * instead of specific columns", "Increase the database storage capacity", "Convert the database to CSV files"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: Your Kubernetes cluster running ${i * 10} pods experiences intermittent DNS resolution failures under high load. What is the practical DevOps solution?`,
      options: ["Implement NodeLocal DNSCache", "Restart the entire cluster daily", "Hardcode IP addresses in the application code", "Switch to physical bare-metal servers"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: You are performing PCA on a dataset with ${i * 10 + 50} dimensions. The first 3 principal components explain only 40% of the variance. What does this imply?`,
      options: ["The data is highly complex and not well-represented in a low-dimensional linear space", "The data has zero variance", "PCA has failed and should never be used", "You should drop the first 3 components"],
      correctOptionIndex: 0
    })
  ],
  design: [
    (i) => ({
      question: `Scenario ${i}: A UI button has a contrast ratio of ${2 + (i % 2)}.5:1 against its background. According to WCAG AA standards, is this acceptable for standard text?`,
      options: ["No, it requires at least 4.5:1", "Yes, any contrast above 2:1 is fine", "It depends on the font family", "Only if the button is animated"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: During usability testing, ${i * 2 + 10}% of users failed to find the checkout button. What is the most data-driven UX intervention?`,
      options: ["Conduct an A/B test moving the button to the natural reading path (F-pattern)", "Make the button flash rapidly", "Remove the checkout feature", "Change the background to dark mode"],
      correctOptionIndex: 0
    })
  ],
  business: [
    (i) => ({
      question: `Scenario ${i}: Your marketing campaign has a Customer Acquisition Cost (CAC) of $${i * 10 + 50} and a Lifetime Value (LTV) of $${i * 15 + 40}. Based on the LTV:CAC ratio, what is the strategic move?`,
      options: ["Calculate the exact ratio; if < 3:1, optimize funnel conversion before scaling ad spend", "Immediately double the ad budget", "Stop all marketing entirely", "Increase the product price by 500%"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: A stock's RSI (Relative Strength Index) is showing ${80 + (i % 10)}. In technical analysis, what does this mathematically suggest?`,
      options: ["The asset is highly overbought and may face a pullback", "The asset is oversold and a strong buy", "The volume is zero", "The moving average is crossing the baseline"],
      correctOptionIndex: 0
    })
  ],
  social: [
    (i) => ({
      question: `Scenario ${i}: Your YouTube video has a CTR (Click-Through Rate) of ${i % 5 + 2}% but an Average View Duration (AVD) of 70%. What practical adjustment should you make to the packaging?`,
      options: ["A/B test a higher-contrast thumbnail and more compelling title to improve CTR", "Make the video shorter to reduce AVD", "Delete the video and re-upload it", "Buy fake views to boost algorithm ranking"],
      correctOptionIndex: 0
    }),
    (i) => ({
      question: `Scenario ${i}: The algorithm prioritizes 'watch time'. If you have a ${i + 10} minute video, how do you mathematically maximize retention in the first 30 seconds?`,
      options: ["Use a high-retention hook that immediately introduces the core conflict or value proposition", "Play a 30-second branded intro", "Speak very slowly to pad the time", "Show a static image for suspense"],
      correctOptionIndex: 0
    })
  ]
};

// Generic hard templates to mix in
const genericHardTemplates = [
  (i, courseName) => ({
    question: `Advanced Application ${i}: In the context of ${courseName}, you are faced with a complex edge case where system entropy is increasing. Applying the Pareto principle (80/20 rule), which 20% of effort will yield 80% of the result?`,
    options: [
      "Identifying and resolving the core bottleneck identified via telemetry/analytics.",
      "Rewriting the entire foundation from scratch.",
      "Adding more superficial features.",
      "Ignoring the metric until it becomes a critical failure."
    ],
    correctOptionIndex: 0
  }),
  (i, courseName) => ({
    question: `Scenario ${i} (${courseName}): A critical stakeholder demands a feature that violates established best practices for this domain. What is the most professional and practical approach?`,
    options: [
      "Present data-backed risk assessments and propose a viable, compliant alternative.",
      "Implement it exactly as asked, knowing it will fail.",
      "Refuse the request without explanation.",
      "Quit the project immediately."
    ],
    correctOptionIndex: 0
  })
];

let globalQId = 1;

db.courses.forEach(course => {
  let courseCategory = 'tech';
  for (const [cat, ids] of Object.entries(categories)) {
    if (ids.includes(course.id)) {
      courseCategory = cat;
      break;
    }
  }

  const catTemplates = templates[courseCategory] || templates.tech;

  // Generate exactly 30 questions: 5 easy, 10 moderate, 15 hard (application-based)
  for (let i = 1; i <= 30; i++) {
    let qObj;
    
    // Determine difficulty tier
    if (i <= 5) {
      // Easy (1-5)
      qObj = {
        question: `Easy Knowledge ${i}: What is the primary purpose of the core concepts taught in ${course.title}?`,
        options: [
          "To provide fundamental understanding and basic operations.",
          "To confuse the developer with unnecessary complexity.",
          "To slow down the system intentionally.",
          "To completely replace all existing frameworks."
        ],
        correctOptionIndex: 0
      };
    } else if (i <= 15) {
      // Moderate (6-15)
      const template = catTemplates[i % catTemplates.length];
      qObj = template(i);
      qObj.question = `[Moderate] ${qObj.question}`;
    } else {
      // Hard (16-30) - Application based
      const template = genericHardTemplates[i % genericHardTemplates.length];
      qObj = template(i, course.title);
      qObj.question = `[Hard Application] ${qObj.question}`;
    }

    // Scramble options to ensure correctOptionIndex isn't always 0
    const correctAns = qObj.options[qObj.correctOptionIndex];
    const shuffledOptions = [...qObj.options].sort(() => Math.random() - 0.5);
    const newCorrectIndex = shuffledOptions.indexOf(correctAns);

    db.questions.push({
      id: `q-${course.id}-${globalQId++}`,
      courseId: course.id,
      question: qObj.question,
      options: shuffledOptions,
      correctOptionIndex: newCorrectIndex
    });
  }
  
  // Ensure the course has questionsCount updated
  course.questionsCount = 30;
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully injected 30 questions (5 easy, 10 moderate, 15 hard) per course!');
