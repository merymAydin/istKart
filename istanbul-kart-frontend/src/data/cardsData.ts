import redCard from '../assets/redcard.webp';
import plusCard from '../assets/plus.png';
import greenCard from '../assets/greencard.webp';
import blueCard from '../assets/blue.webp';
import yellowCard from '../assets/yellow.webp';
import cityCard from '../assets/tourist.webp';
import type { CardData } from '../components/CardDetailModal';

export const cardsData: CardData[] = [
  {
    id: 'regular',
    title: 'Istanbulkart',
    themeColor: '#ef4444',
    lightBg: '#fee2e2',
    features: ['Istanbulkart'],
    img: redCard,
    description: 'Standard anonymous Istanbulkart for daily transit use.',
    requirements: ['None'],
    fee: 'Standard tariff'
  },
  {
    id: 'plus',
    title: 'Istanbulkart Plus',
    themeColor: '#f59e0b',
    lightBg: '#fef3c7',
    features: ['Virtual Istanbulkart Plus', 'Istanbulkart Plus (Standard)', 'Istanbulkart Plus (Student)'],
    img: plusCard,
    description: 'Advanced features with digital account balance management.',
    requirements: ['Mobile verification'],
    fee: 'Plus tariff'
  },
  {
    id: 'discounted',
    title: 'Discounted Card',
    themeColor: '#10b981',
    lightBg: '#d1fae5',
    features: ['Student', 'Teacher', '60 Years Old'],
    img: greenCard,
    description: 'Special discounted travel rights for eligible citizens.',
    requirements: ['Official status proof'],
    fee: 'Discounted tariff'
  },
  {
    id: 'blue',
    title: 'Blue Istanbulkart',
    themeColor: '#3b82f6',
    lightBg: '#dbeafe',
    features: ['Blue Card', 'Island Resident'],
    img: blueCard,
    description: 'Monthly subscription pass for frequent commuters.',
    requirements: ['ID card verification'],
    fee: 'Monthly fixed fee'
  },
  {
    id: 'free',
    title: 'Free Istanbulkart',
    themeColor: '#f59e0b',
    lightBg: '#fef3c7',
    features: ['65+ Years Old', 'Press Member', 'Veteran / Disabled', 'Police / Military'],
    img: yellowCard,
    description: 'Free public transit privileges for entitled groups.',
    requirements: ['Government issued ID / Document'],
    fee: 'Free'
  },
  {
    id: 'city',
    title: 'Istanbul City Card',
    themeColor: '#06b6d4',
    lightBg: '#cffafe',
    features: ['Istanbul City Card'],
    img: cityCard,
    description: 'Tourist-friendly limited duration unlimited travel passes.',
    requirements: ['None'],
    fee: 'Package based'
  }
];