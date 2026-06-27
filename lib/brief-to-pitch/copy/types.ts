export type DemoLocale = "en" | "cn";

export interface SampleBriefSpec {
  label: string;
  text: string;
  context: Record<string, string>;
  disabled?: boolean;
  disabledLabel?: string;
}

export interface BriefToPitchCopy {
  locale: DemoLocale;
  routes: {
    en: string;
    cn: string;
  };
  nav: {
    brand: string;
    productLabel: string;
    requestDemo: string;
    languageToggleLabel: string;
    cn: string;
    en: string;
  };
  hero: {
    badge: string;
    heading: string;
    headingAccent: string;
    headingSuffix: string;
    subheading: string;
    primaryCta: string;
    secondaryCta: string;
    tagsLabel: string;
    tags: string[];
    previewTitle: string;
    previewSubtitle: string;
    previewReady: string;
    previewIntro: string;
    previewSampleBrief: string;
    previewDirectionLabel: string;
    previewDirectionName: string;
    previewWhyItFitsLabel: string;
    previewWhyItFitsText: string;
    previewButtons: string[];
  };
  input: {
    heading: string;
    intro: string;
    privacyNotice: string;
    placeholder: string;
    sampleLabel: string;
    generateCta: string;
    samples: SampleBriefSpec[];
  };
  processing: {
    heading: string;
    intro: string;
    steps: string[];
    finalMessage: string;
    errorPrefix: string;
    fallbackCta: string;
  };
  output: {
    heading: string;
    startOver: string;
    disclaimerLabel: string;
    disclaimerText: string;
    sections: {
      interpretation: string;
      targetAudience: string;
      emotionalKeywords: string;
      constraints: string;
      hiddenRequirements: string;
      marketSignals: string;
      trendSignals: string;
      cuisineInspiration: string;
      operationalStrategy: string;
      playbook: string;
      keyConstraints: string;
      conceptStrategy: string;
      allowedFormats: string;
      riskyFormats: string;
      rejectedIdeas: string;
      directions: string;
      recipes: string;
      pitchPackage: string;
      imagePrompts: string;
    };
    direction: {
      risk: string;
      confidence: string;
      mostImportantConstraintResponse: string;
      shelfLifeStrategy: string;
      whyItIsNotGeneric: string;
      flavor: string;
      feasibility: string;
      storeExecution: string;
      heatingHolding: string;
      packaging: string;
      customerFit: string;
      unresolvedRisks: string;
    };
    recipe: {
      ingredients: string;
      chefNotes: string;
      manufacturingNotes: string;
      makeAheadPrefix: string;
      moistureControlPrefix: string;
      textureProtectionPrefix: string;
      service: string;
      shelfLifeAssumption: string;
      constraintChecklist: string;
      validationPlan: string;
      chefValidationPrefix: string;
      opsValidationPrefix: string;
      sensoryValidationPrefix: string;
      regulatoryValidationPrefix: string;
    };
    pitch: {
      copyGammaPrompt: string;
      copySuccessAlert: string;
    };
    leadCapture: {
      heading: string;
      description: string;
      sendToEmail: string;
      requestEnterpriseDemo: string;
    };
  };
  modal: {
    emailTitle: string;
    demoTitle: string;
    emailDescription: string;
    demoDescription: string;
    emailPlaceholder: string;
    submit: string;
    successTitle: string;
    successDescription: string;
  };
  errors: {
    genericGenerationFailed: string;
  };
}
