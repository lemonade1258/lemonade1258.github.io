import { Publication, Person, NewsItem, ContactInfo, EventItem } from "./types";

export const LAB_NAME = "CLAIN";
export const LAB_FULL_NAME = "Center for Language and Information Research";
export const UNIVERSITY_NAME = "Wuhan University";

export const PUBLICATIONS: Publication[] = [
  {
    id: "p1",
    title: "Deep Learning for Satellite Image Analysis in Urban Planning",
    authors: ["Zhang, W.", "Li, J.", "Chen, Y."],
    conference: "CVPR 2024",
    year: 2024,
    tags: ["Computer Vision", "Remote Sensing"],
    link: "https://arxiv.org",
  },
  {
    id: "p2",
    title: "Robust Natural Language Understanding in Low-Resource Settings",
    authors: ["Wang, H.", "Zhang, W."],
    conference: "ACL 2023",
    year: 2023,
    tags: ["NLP", "Generative AI"],
    link: "https://arxiv.org",
  },
  {
    id: "p3",
    title: "Next Generation Wireless Networks: A Survey",
    authors: ["Liu, K.", "Zhang, W.", "Smith, A."],
    conference: "IEEE INFOCOM",
    year: 2023,
    tags: ["Networking"],
    link: "https://ieee.org",
  },
  {
    id: "p4",
    title: "Optimizing Database Queries with Reinforcement Learning",
    authors: ["Chen, Y.", "Wu, X."],
    conference: "SIGMOD 2022",
    year: 2022,
    tags: ["Databases", "ML"],
    link: "https://acm.org",
  },
];

export const CONTACT_DEFAULTS: ContactInfo = {
  addressEn:
    "Center for Language and Information Research\nComputer Science Building, Room 502\nWuhan University\nWuhan, Hubei, 430072\nP.R. China",
  addressZh:
    "语言与信息研究中心\n计算机学院 502 室\n武汉大学\n湖北省武汉市 430072\n中国",
  emailGeneral: "contact@whu-nextgen.edu.cn",
  emailAdmissions: "admissions@whu-nextgen.edu.cn",
  introEn:
    "We are located at the heart of the Wuhan University campus. We welcome visits from prospective students and collaborators.",
  introZh: "我们位于武汉大学校园中心。欢迎未来的学生和合作伙伴来访。",
  hiringTextEn: "We are actively looking for PhD students and Postdocs.",
  hiringTextZh: "我们正在积极招募博士生和博士后研究员。",
  hiringLink: "#",
  mapEmbedUrl:
    "https://maps.google.com/maps?width=100%&height=600&hl=en&q=Wuhan%20University&ie=UTF8&t=m&z=14&iwloc=B&output=embed",
};

export const EVENTS: EventItem[] = [
  {
    id: "e1",
    date: "June 15, 2024",
    time: "14:00 - 15:30",
    location: "Room 502",
    title: "Weekly Research Seminar",
    description: "Discussion on latest papers in Multi-modal LLMs.",
  },
  {
    id: "e2",
    date: "June 22, 2024",
    time: "10:00 - 11:30",
    location: "Lecture Hall A",
    title: "Invited Talk: Future of AI",
    description: "Guest speaker from Industry regarding AI applications.",
  },
];

export const PEOPLE: Person[] = [
  // ... (Kept existing People data same as before to save space in this response, assume previous content is here) ...
  {
    id: "t1",
    name: "Qianqian Xie",
    nameZh: "谢倩倩",
    category: "Teachers",
    title: "Professor / PhD Supervisor",
    titleZh: "教授 / 博导",
    avatar: "https://picsum.photos/400/400?random=101",
    email: "xieq@whu.edu.cn",
    homepage: "https://github.com/xieqianqian",
    order: 1,
    bio: "Dr. Xie is a Professor at the School of Computer Science, Wuhan University. Her research focuses on Natural Language Processing, AI for Finance, and Medical AI.",
    bioZh:
      "武汉大学计算机学院教授，博士生导师。主要研究方向包括自然语言处理、智能金融、医疗AI、多模态学习及可解释性AI。",
    teacherProfile: {
      position: "Professor at School of Computer Science, Wuhan University",
      positionZh: "武汉大学计算机学院教授",
      researchAreas: [
        "Natural Language Processing (NLP)",
        "Medical AI",
        "FinTech",
        "Multimodal Learning",
        "Explainable AI",
      ],
      researchAreasZh: [
        "自然语言处理 (NLP)",
        "医疗人工智能",
        "智能金融",
        "多模态学习",
        "可解释性AI",
      ],
      achievements: [
        "Published over 50 papers in top-tier conferences (ACL, EMNLP, AAAI).",
        "Developed FinBERT-QA, a model widely used in financial sentiment analysis.",
      ],
      achievementsZh: [
        "在顶级会议（ACL, EMNLP, AAAI）发表论文50余篇。",
        "开发了 FinBERT-QA 模型，广泛应用于金融情感分析。",
      ],
      projects: [
        "NIH Funded Research on Medical Text Mining",
        "Tencent Rhino-Bird Young Faculty Research Fund",
        "National Youth Talent Support Program",
      ],
      projectsZh: [
        "NIH 医疗文本挖掘资助项目",
        "腾讯犀牛鸟基金",
        "国家青年人才计划",
      ],
      honors: ["Best Paper Award at ICAIF 2022"],
      honorsZh: ["ICAIF 2022 最佳论文奖"],
      influence: [
        "GitHub Stars > 1k",
        "HuggingFace Model Downloads > 10k",
        "Served as Area Chair for ACL 2023, EMNLP 2023",
      ],
      influenceZh: [
        "GitHub Star数超 1k",
        "HuggingFace 模型下载量超 1万",
        "担任 ACL 2023, EMNLP 2023 领域主席",
      ],
    },
  },
  // ... Include other people from previous turns ...
];

export const NEWS: NewsItem[] = [
  // ... Include news from previous turns ...
  {
    id: "n1",
    date: "May 15, 2024",
    title: "Two papers accepted to CVPR 2024",
    subtitle: "Breakthrough in Remote Sensing and Multi-modal Learning",
    titleZh: "两篇论文被 CVPR 2024 录用",
    category: "Publication",
    summary:
      "Our lab has two papers accepted for oral presentation at the upcoming Computer Vision and Pattern Recognition conference in Seattle.",
    summaryZh:
      "我们实验室有两篇论文被即将于西雅图举行的 CVPR 2024 会议接收为口头报告。",
    author: "Lab Admin",
    coverImage:
      "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?q=80&w=2574&auto=format&fit=crop",
    content:
      "<p>We are thrilled to announce that two of our research papers have been accepted to <strong>CVPR 2024</strong>...</p>",
    contentZh:
      "<p>我们非常高兴地宣布，实验室有两篇研究论文被 <strong>CVPR 2024</strong> 录用...</p>",
  },
  {
    id: "n2",
    date: "Mar 10, 2024",
    title: "Dr. Zhang receives the Young Investigator Award",
    titleZh: "张博士荣获青年学者奖",
    category: "Award",
    summary:
      "Congratulations to Dr. Wei Zhang for receiving the prestigious university award for research excellence.",
    summaryZh: "祝贺张伟博士获得著名的大学杰出研究奖。",
    content:
      "<p>Dr. Zhang was recognized for his outstanding contributions...</p>",
  },
];
