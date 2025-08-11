'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'fr';

export interface Translations {
  // Header
  sell: string;
  login: string;
  logout: string;
  visitBuycycle: string;
  
  // Top Banner
  topBanner1: string;
  topBanner2: string;
  topBanner3: string;
  
  // Migration Form
  migrateTitle: string;
  migrateSubtitle: string;
  firstName: string;
  lastName: string;
  emailLabel: string;
  mobileLabel: string;
  passwordLabel: string;
  notesLabel: string;
  notesPlaceholder: string;
  migrateButton: string;
  
  // Marketplace
  marketplaceTitle: string;
  trustedBrands: string;
  partsTitle: string;
  
  // Product Categories
  fork: string;
  rearSuspension: string;
  drivetrain: string;
  groupset: string;
  brakes: string;
  tires: string;
  wheels: string;
  cockpit: string;
  saddle: string;
  accessories: string;
  
  // App Download
  downloadTitle: string;
  downloadSubtitle: string;
  
  // How It Works
  howToBuyTitle: string;
  howToSellTitle: string;
  step1: string;
  step2: string;
  step3: string;
  step4: string;
  step1Desc: string;
  step2Desc: string;
  step3Desc: string;
  step4Desc: string;
  
  // How to sell steps
  sellStep1Desc: string;
  sellStep2Desc: string;
  sellStep3Desc: string;
  
  // Bottom banner
  startListingTitle: string;
  startListingDesc: string;
  listGearButton: string;
  
  // Login Modal
  loginTitle: string;
  signupTitle: string;
  loginSubtitle: string;
  googleButton: string;
  orContinueWith: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  password: string;
  loginButton: string;
  signupButton: string;
  loginLoading: string;
  signupLoading: string;
  switchToSignup: string;
  switchToLogin: string;
  fillAllFields: string;
  registrationSuccess: string;
  loginSuccess: string;
  accountCreated: string;
  nowLoggedIn: string;
}

const translations: Record<Language, Translations> = {
  en: {
    // Header
    sell: 'Sell',
    login: 'Login',
    logout: 'Logout',
    visitBuycycle: 'Visit buycycle',
    
    // Top Banner
    topBanner1: 'Over 100,000 bikes, bike parts and accessories',
    topBanner2: 'Only certified sellers',
    topBanner3: '€79 shipping on all bikes',
    
    // Migration Form
    migrateTitle: 'Migrate your everide account to buycycle',
    migrateSubtitle: 'Join the largest marketplace for pre-owned bikes and sports equipment.',
    firstName: 'First name',
    lastName: 'Last name',
    emailLabel: 'Email',
    mobileLabel: 'Mobile',
    passwordLabel: 'Password',
    notesLabel: 'Notes (Optional)',
    notesPlaceholder: 'Any additional information or special requests...',
    migrateButton: 'Migrate Account',
    
    // Marketplace
    marketplaceTitle: 'buycycle - the marketplace for pre-owned sports gear.',
    trustedBrands: 'Trusted by top cycling brands',
    partsTitle: 'Buy parts and accessories. Upgrade your bike',
    
    // Product Categories
    fork: 'Fork',
    rearSuspension: 'Rear Suspension',
    drivetrain: 'Drivetrain & Pedals',
    groupset: 'Groupset',
    brakes: 'Brakes',
    tires: 'Tires',
    wheels: 'Wheels',
    cockpit: 'Cockpit',
    saddle: 'Saddle',
    accessories: 'Accessories',
    
    // App Download
    downloadTitle: 'Download the buycycle app!',
    downloadSubtitle: 'Buying & selling sports gear has never been easier.',
    
    // How It Works
    howToBuyTitle: 'How to buy',
    howToSellTitle: 'How to sell',
    step1: 'Find',
    step2: 'Buy',
    step3: 'Receive',
    step4: 'Enjoy',
    step1Desc: 'Search through thousands of pre-owned bikes',
    step2Desc: 'Secure payment with buyer protection',
    step3Desc: 'Fast and insured delivery to your door',
    step4Desc: 'Get riding with your new bike!',
    
    // How to sell steps
    sellStep1Desc: 'Create your ad with just a few clicks.',
    sellStep2Desc: 'Get offers and answer questions. Sales take an average of 7 days. Your payment is always secure.',
    sellStep3Desc: 'We provide everything you need to pack and ship your item. You\'ll receive the payment once the item has arrived and the buyer confirms delivery within 48 hours.',
    
    // Bottom banner
    startListingTitle: 'Start listing and sell your sports gear now!',
    startListingDesc: 'No sketchy meetups, no ghosting, no "last prices". With buycycle, you get seamless sales, insured shipping, sturdy packaging material and secure payments.',
    listGearButton: 'List your sports gear in 2 minutes',
    
    // Login Modal
    loginTitle: 'Log in to buycycle',
    signupTitle: 'Create account',
    loginSubtitle: 'The global marketplace for used bikes',
    googleButton: 'Google',
    orContinueWith: 'Or continue with email',
    firstName: 'First name',
    lastName: 'Last name',
    phoneNumber: 'Phone number',
    email: 'Email',
    password: 'Password',
    loginButton: 'Log in',
    signupButton: 'Create account',
    loginLoading: 'Logging in...',
    signupLoading: 'Creating account...',
    switchToSignup: 'Create account',
    switchToLogin: 'Log in',
    fillAllFields: 'Please fill in all fields',
    registrationSuccess: 'Registration successful',
    loginSuccess: 'Login successful',
    accountCreated: 'Your account has been successfully created!',
    nowLoggedIn: 'You are now logged in'
  },
  fr: {
    // Header
    sell: 'Vendre',
    login: 'Connexion',
    logout: 'Déconnexion',
    visitBuycycle: 'Visiter buycycle',
    
    // Top Banner
    topBanner1: 'Plus de 100 000 vélos, pièces et accessoires',
    topBanner2: 'Seulement des vendeurs certifiés',
    topBanner3: 'Livraison 79€ sur tous les vélos',
    
    // Migration Form
    migrateTitle: 'Migrez votre compte everide vers buycycle',
    migrateSubtitle: 'Rejoignez le plus grand marché d\'équipements sportifs d\'occasion.',
    firstName: 'Prénom',
    lastName: 'Nom',
    emailLabel: 'Email',
    mobileLabel: 'Mobile',
    passwordLabel: 'Mot de passe',
    notesLabel: 'Notes (Optionnel)',
    notesPlaceholder: 'Informations supplémentaires ou demandes spéciales...',
    migrateButton: 'Migrer le compte',
    
    // Marketplace
    marketplaceTitle: 'buycycle - le marché des équipements sportifs d\'occasion.',
    trustedBrands: 'Approuvé par les meilleures marques cyclistes',
    partsTitle: 'Achetez des pièces et accessoires. Améliorez votre vélo',
    
    // Product Categories
    fork: 'Fourche',
    rearSuspension: 'Suspension arrière',
    drivetrain: 'Transmission et pédales',
    groupset: 'Groupe',
    brakes: 'Freins',
    tires: 'Pneus',
    wheels: 'Roues',
    cockpit: 'Cockpit',
    saddle: 'Selle',
    accessories: 'Accessoires',
    
    // App Download
    downloadTitle: 'Téléchargez l\'app buycycle !',
    downloadSubtitle: 'Acheter et vendre des équipements sportifs n\'a jamais été aussi facile.',
    
    // How It Works
    howToBuyTitle: 'Comment acheter',
    howToSellTitle: 'Comment vendre',
    step1: 'Trouver',
    step2: 'Acheter',
    step3: 'Recevoir',
    step4: 'Profiter',
    step1Desc: 'Parcourez des milliers de vélos d\'occasion',
    step2Desc: 'Paiement sécurisé avec protection acheteur',
    step3Desc: 'Livraison rapide et assurée à votre porte',
    step4Desc: 'Roulez avec votre nouveau vélo !',
    
    // How to sell steps
    sellStep1Desc: 'Créez votre annonce en quelques clics.',
    sellStep2Desc: 'Recevez des offres et répondez aux questions. Les ventes prennent en moyenne 7 jours. Votre paiement est toujours sécurisé.',
    sellStep3Desc: 'Nous fournissons tout ce dont vous avez besoin pour emballer et expédier votre article. Vous recevrez le paiement une fois que l\'article est arrivé et que l\'acheteur confirme la livraison dans les 48 heures.',
    
    // Bottom banner
    startListingTitle: 'Commencez à lister et vendez vos équipements sportifs maintenant !',
    startListingDesc: 'Pas de rendez-vous douteux, pas de ghosting, pas de "derniers prix". Avec buycycle, vous obtenez des ventes transparentes, livraison assurée, matériel d\'emballage solide et paiements sécurisés.',
    listGearButton: 'Listez vos équipements sportifs en 2 minutes',
    
    // Login Modal
    loginTitle: 'Se connecter à buycycle',
    signupTitle: 'Créer un compte',
    loginSubtitle: 'Le marché mondial des vélos d\'occasion',
    googleButton: 'Google',
    orContinueWith: 'Ou continuez avec email',
    firstName: 'Prénom',
    lastName: 'Nom',
    phoneNumber: 'Numéro de téléphone',
    email: 'Email',
    password: 'Mot de passe',
    loginButton: 'Se connecter',
    signupButton: 'Créer un compte',
    loginLoading: 'Connexion en cours...',
    signupLoading: 'Création du compte...',
    switchToSignup: 'Créer un compte',
    switchToLogin: 'Se connecter',
    fillAllFields: 'Veuillez remplir tous les champs',
    registrationSuccess: 'Inscription réussie',
    loginSuccess: 'Connexion réussie',
    accountCreated: 'Votre compte a été créé avec succès !',
    nowLoggedIn: 'Vous êtes maintenant connecté'
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>('en');

  // Load language from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedLanguage = localStorage.getItem('preferred-language') as Language;
      if (savedLanguage && translations[savedLanguage]) {
        setLanguage(savedLanguage);
      } else {
        // Detect browser language
        const browserLang = navigator.language?.split('-')[0];
        if (browserLang === 'fr') {
          setLanguage('fr');
        } else {
          setLanguage('en'); // Default to English for all other languages
        }
      }
    }
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('preferred-language', language);
    }
  }, [language]);

  const value = {
    language,
    setLanguage,
    t: translations[language] || translations.en
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
