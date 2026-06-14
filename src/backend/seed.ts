import { prisma } from './prisma.js';

const defaultCourses = [
  {
    id: 'course-1',
    title: 'AI & Machine Learning',
    category: 'Tech',
    description: 'Learn foundations of Neural Networks, Supervised & Unsupervised learning, and Transformers. Work with industry-standard Python deep learning libraries to design, train, and deploy advanced artificial intelligence algorithms.',
    examPrice: 299,
    lectures: [
      { title: 'Lecture 1: Introduction to Neural Networks', videoId: 'aircAruvnKk' },
      { title: 'Lecture 2: Linear Regression & Gradient Descent', videoId: 'vsWrXDxO564' },
      { title: 'Lecture 3: Deep Convolutional Neural Networks', videoId: 'YRhxdVk_sIs' },
      { title: 'Lecture 4: Large Language Models & Self-Attention', videoId: 'zxQyFrgLYrY' }
    ],
    durationMins: 60,
    passPercentage: 70
  },
  {
    id: 'course-2',
    title: 'Full Stack Web Development',
    category: 'Tech',
    description: 'Build enterprise-grade full-stack web applications. Covers modern frontend frameworks, scalable backends, database integrations, responsive user-interface designs, security protocols, and state management systems.',
    examPrice: 249,
    lectures: [
      { title: 'Lecture 1: React Foundations & Virtual DOM', videoId: 'Ke90Tje7VS0' },
      { title: 'Lecture 2: Express Node Backends & Core Routing', videoId: 'SccSCuHhOw0' },
      { title: 'Lecture 3: Relational vs Non-Relational Databases', videoId: 'Tk1skSgzIig' },
      { title: 'Lecture 4: Web Sockets, Realtime Bridges & Security', videoId: 'UUYg7G4UorY' }
    ],
    durationMins: 60,
    passPercentage: 70
  },
  {
    id: 'course-3',
    title: 'Data Science & Analytics',
    category: 'Tech',
    description: 'Uncover business insights from data. Master statistical analysis, data mining, visual dashboards, data pipelines, predictive operations, and data cleansing architectures using Pandas, Jupyter, and D3.',
    examPrice: 299,
    lectures: [
      { title: 'Lecture 1: Structured Pandas DataFrames', videoId: 'F6kmIpWWEdU' },
      { title: 'Lecture 2: Statistical Inference & Hypothesis Testing', videoId: 'GPVsHO7VqI8' },
      { title: 'Lecture 3: Data Visualizations with Seaborn & Plotly', videoId: 'q7oD_NPco-s' },
      { title: 'Lecture 4: Feature Selection & Predictive Workflows', videoId: 'h8L_0H_7y9g' }
    ],
    durationMins: 60,
    passPercentage: 70
  },
  {
    id: 'course-4',
    title: 'Cybersecurity & Eth Hacking',
    category: 'Tech',
    description: 'Defend organizational assets against digital intrusions. Learn modern penetration testing, vulnerability assessment, networking security architecture, encryption algorithms, and incident mitigation plans.',
    examPrice: 249,
    lectures: [
      { title: 'Lecture 1: Cybersecurity Fundamentals & Terminology', videoId: '3Kq1MmMv_Rk' },
      { title: 'Lecture 2: Network Vulnerability Scanning & Port Analysis', videoId: 'V_HqDOnZ_H4' },
      { title: 'Lecture 3: Cryptography Protocols (AES, RSA, ECC)', videoId: 'G0v0n7XreF4' },
      { title: 'Lecture 4: Web Application Hacking & SQL Injections', videoId: 'i_D_H9YgPZc' }
    ],
    durationMins: 60,
    passPercentage: 70
  }
];

async function main() {
  console.log('Seeding database with default courses...');
  for (const course of defaultCourses) {
    await prisma.course.upsert({
      where: { id: course.id },
      update: {},
      create: {
        id: course.id,
        title: course.title,
        category: course.category,
        description: course.description,
        price: course.examPrice,
        lectures: course.lectures as any,
        durationMins: course.durationMins,
        passPercentage: course.passPercentage,
        skills: []
      }
    });
  }
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
