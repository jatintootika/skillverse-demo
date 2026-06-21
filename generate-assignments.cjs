const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'data-db.json');
let db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

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
      title: `Lab ${i}: Build a Rate Limiter Middleware`,
      description: `Implement a token bucket or sliding window rate limiter to protect a simulated API endpoint from DDoS attacks.`,
      task: `Write a Node.js/Python script that intercepts requests, checks against a Redis-backed store, and returns HTTP 429 if the limit (${i * 10} req/sec) is exceeded.`,
      expectedOutput: `When firing ${i * 15} requests simultaneously, exactly ${i * 10} should return 200 OK, and the rest should return 429 Too Many Requests.`
    }),
    (i) => ({
      title: `Lab ${i}: Optimize Database Indexing`,
      description: `A database table containing ${i * 10000} rows of e-commerce transactions is experiencing slow reads on range queries.`,
      task: `Analyze the query execution plan for 'SELECT * FROM orders WHERE amount > 500 AND status = "shipped"'. Add a composite B-tree index to reduce the query time by at least 80%.`,
      expectedOutput: `The EXPLAIN ANALYZE output should confirm an Index Scan is used instead of a Full Table Scan (Seq Scan).`
    })
  ],
  data_ai: [
    (i) => ({
      title: `Lab ${i}: Handle Class Imbalance in Classification`,
      description: `You have a medical dataset where only ${i % 3 + 1}% of the records are positive for a disease. A naive model achieves 99% accuracy by predicting everything as negative.`,
      task: `Implement SMOTE (Synthetic Minority Over-sampling Technique) or configure class weights in your loss function to penalize false negatives heavily.`,
      expectedOutput: `Achieve a Recall of at least 85% on the minority class on a holdout test set.`
    }),
    (i) => ({
      title: `Lab ${i}: Deploy a Dockerized ML Inference API`,
      description: `Wrap a pre-trained sentiment analysis model in a lightweight FastAPI/Flask application.`,
      task: `Create a Dockerfile that installs dependencies, copies the model weights (approx ${i * 10} MB), and exposes port 8080. Build and run the container locally.`,
      expectedOutput: `A cURL request to localhost:8080/predict with a JSON payload returns a valid sentiment score.`
    })
  ],
  design: [
    (i) => ({
      title: `Lab ${i}: Conduct a Heuristic Evaluation`,
      description: `Review a provided wireframe of a checkout flow containing ${i + 2} potential friction points.`,
      task: `Identify usability issues according to Nielsen's 10 Usability Heuristics. Propose structural redesigns for each issue.`,
      expectedOutput: `A PDF report or Figma board detailing the before-and-after states with clear rationale for improved accessibility and conversion.`
    })
  ],
  business: [
    (i) => ({
      title: `Lab ${i}: Calculate Breakeven and ROI Projections`,
      description: `A SaaS product has a fixed monthly cost of $${i * 1000} and a variable cost of $${i + 5} per user. The subscription is priced at $${i * 5 + 20}.`,
      task: `Build a spreadsheet or Python script to calculate the breakeven point (in number of users). Plot the projected ROI over 12 months assuming a 5% MoM growth rate.`,
      expectedOutput: `A chart showing the exact month the product becomes profitable, and the total net profit at the end of the year.`
    })
  ],
  social: [
    (i) => ({
      title: `Lab ${i}: A/B Test Thumbnail and Hook`,
      description: `You have an initial video hook that retains ${i * 2 + 10}% of the audience at 30 seconds.`,
      task: `Write two alternative scripts for the first 15 seconds. One must use an open loop (mystery), and the other must use a direct value proposition. Sketch or describe 2 thumbnail concepts for each.`,
      expectedOutput: `A document comparing the expected psychological impact of both approaches, detailing why one might outperform the other for a broad audience.`
    })
  ]
};

// Generic hard templates to mix in
const genericHardTemplates = [
  (i, courseName) => ({
    title: `Advanced Project ${i}: End-to-End Capstone`,
    description: `Integrate the core concepts of ${courseName} into a comprehensive, production-ready system.`,
    task: `Design the architecture, implement the solution, write automated tests achieving >80% coverage, and prepare a deployment strategy. Include robust error handling and telemetry.`,
    expectedOutput: `A GitHub repository link with a comprehensive README, CI/CD pipeline configuration, and a demo link or video walkthrough.`
  }),
  (i, courseName) => ({
    title: `Lab ${i}: Legacy Code Refactoring Challenge`,
    description: `You are given a poorly structured, deeply nested, and highly coupled snippet relevant to ${courseName}.`,
    task: `Refactor the logic using SOLID principles (or domain-equivalent best practices). Write unit tests first to ensure regression safety, then decouple the components.`,
    expectedOutput: `Clean, modular output that passes all original tests but reduces cyclomatic complexity by at least half.`
  })
];

db.courses.forEach(course => {
  let courseCategory = 'tech';
  for (const [cat, ids] of Object.entries(categories)) {
    if (ids.includes(course.id)) {
      courseCategory = cat;
      break;
    }
  }

  const catTemplates = templates[courseCategory] || templates.tech;

  course.assignments = [];

  // Generate 95 assignments for this course
  for (let i = 1; i <= 95; i++) {
    let aObj;
    
    // Mix category-specific and generic hard templates
    if (i % 7 === 0) {
      const template = genericHardTemplates[i % genericHardTemplates.length];
      aObj = template(i, course.title);
    } else {
      const template = catTemplates[i % catTemplates.length];
      aObj = template(i);
    }

    course.assignments.push({
      id: `lab-${course.id}-${i}`,
      title: aObj.title,
      description: aObj.description,
      task: aObj.task,
      expectedOutput: aObj.expectedOutput,
      solution: `Step 1: Analyze the requirements carefully. \nStep 2: Implement the core logic as described in the task. \nStep 3: Verify the output matches the expected result. \n\nCode snippet / approach:\n// Use best practices for ${course.title} here.\n// Example: Ensure error handling and performance are prioritized.`
    });
  }
});

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
console.log('Successfully injected 95 hard practical lab assignments per course!');
