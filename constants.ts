

import { Publication, Person, NewsItem, ContactInfo, EventItem } from './types';

export const LAB_NAME = "CLAIN";
export const LAB_FULL_NAME = "Center for Language and Information Research";
export const UNIVERSITY_NAME = "Wuhan University";

export const PUBLICATIONS: Publication[] = [
  {
    id: 'p1',
    title: "Deep Learning for Satellite Image Analysis in Urban Planning",
    authors: ["Zhang, W.", "Li, J.", "Chen, Y."],
    // Fix: changed 'conference' to 'venue' and added missing 'type' to satisfy the Publication interface
    venue: "CVPR 2024",
    type: 'Conference',
    year: 2024,
    tags: ["Computer Vision", "Remote Sensing"],
    link: "https://arxiv.org"
  }
];

export const CONTACT_DEFAULTS: ContactInfo = {
  addressEn: "Center for Language and Information Research\nComputer Science Building, Room 502\nWuhan University\nWuhan, Hubei, 430072\nP.R. China",
  addressZh: "语言与信息研究中心\n计算机学院 502 室\n武汉大学\n湖北省武汉市 430072\n中国",
  emailGeneral: "contact@whu-clain.edu.cn",
  emailAdmissions: "admissions@whu-clain.edu.cn",
  introEn: "We are located at the heart of the Wuhan University campus. We welcome visits from prospective students and collaborators.",
  introZh: "我们位于武汉大学校园中心。欢迎未来的学生和合作伙伴来访。",
  hiringTextEn: "We are actively looking for PhD students and Postdocs.",
  hiringTextZh: "我们正在积极招募博士生和博士后研究员。",
  hiringLink: "#",
  mapEmbedUrl: "https://maps.google.com/maps?width=100%&height=600&hl=en&q=Wuhan%20University&ie=UTF8&t=m&z=14&iwloc=B&output=embed",
  welcomeTitleEn: "Welcome to the Center for Language and Information Research (CLAIN)! 👋",
  welcomeTitleZh: "欢迎来到语言与信息研究中心 (CLAIN)! 👋",
  welcomeTextEn: "The Center for Language and Information Research is an innovative Artificial Intelligence (AI) research center at the School of Artificial Intelligence, Wuhan University.",
  welcomeTextZh: "语言与信息研究中心是武汉大学人工智能学院下设的一个创新型人工智能 (AI) 研究中心。",
  researchAreasTextEn: "Reasoning & Explainability: Improving reasoning, explainability, and controllability of LLMs.\n\nMedical & Financial NLP: Combining domain knowledge to enhance robustness, factual accuracy, and decision reasoning in high-risk scenarios.\n\nAI + Mental Health: Using LLMs and multimodal data for emotion recognition, early risk prediction, and personalized counseling.\n\nAI + Literature: Exploring new paradigms in literary creation, cross-language translation, and cultural dissemination, focusing on low-resource languages.",
  researchAreasTextZh: "推理与可解释性：研究提升大语言模型的推理能力、可解释性和可控性。\n\n医学与金融自然语言处理：研究如何结合领域知识提高生成式 AI 在高风险场景下的稳健性、事实准确性、决策推理能力与可解释性。\n\nAI+心理健康：利用大语言模型与多模态数据等，开发情绪识别、早期心理风险预测与个性化对话式辅导系统等，促进心理健康服务普惠。\n\nAI+文学：研究大语言模型在文学创作、跨语言翻译和文化传播中的新范式。重点关注网络文学出海、东南亚等低资源语言翻译与本地化。",
  partners: []
};

export const EVENTS: EventItem[] = [];

export const PEOPLE: Person[] = [];

export const NEWS: NewsItem[] = [];