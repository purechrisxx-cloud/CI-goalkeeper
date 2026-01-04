
import React from 'react';
import { BrandCI } from './types';

export const DEFAULT_CI: BrandCI = {
  id: 'footer-001',
  name: 'FOOTER',
  brandStory: 'FOOTER 誕生於對極致舒適的追求。我們相信每一雙襪子、每一件貼身衣物都是生活的基石。透過不斷研發除臭科技與機能纖維，我們重新定義了「機能與美學」的界線。',
  mission: '致力於成為亞洲機能穿著的領導品牌，提供不僅解決生活痛點，更展現自信態度的產品。',
  primaryColor: '#000000',
  secondaryColor: '#ffffff',
  fontStyle: 'Inter / 現代無襯線體',
  styleGuidelines: '極簡主義、高對比度、留白美學。攝影風格強調光影質感與微距細節，避免過度飽和的色彩。',
  tone: '機能、自信、生活化、高品質',
  persona: '一位專業的機能穿著專家，強調舒適與科技的結合，口吻簡潔有力且具說服力。',
  targetAudience: '追求生活品質、注重機能性穿著、且對品牌質感有一定要求的現代消費者。',
  logoDescription: 'FOOTER 標準字體 Logo。必須保持水平，四周留白需大於標準字高度의 0.5 倍。',
  additionalRules: '優先使用真實生活場景攝影。視覺構圖需乾淨簡約。避免過度誇張的裝飾元素。',
  ctaStrategy: 'CTA 必須清晰且具有行動導向，設計上需與背景形成高對比，圓角與陰影需細緻。'
};

export const Icons = {
  Check: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>,
  Alert: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>,
  Zap: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>,
  Upload: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>,
  Shield: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>,
  Compass: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"></polyline></svg>,
  Plus: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>,
  Download: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>,
  Import: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 16 12 21 7 16"></polyline><line x1="12" y1="21" x2="12" y2="9"></line></svg>,
  Trash: () => <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
};
