export type RiskRating = "Low" | "Medium" | "High";
export type ConfidenceRating = "Low" | "Medium" | "High";
export type ConstraintStatus = "Handled" | "Partially handled" | "Unresolved";

export interface DirectionConstraintResponse {
  keyConstraints: string[];
  howDirectionHandlesConstraints: string[];
  unresolvedRisks: string[];
}

export interface DirectionOperationalFit {
  productionModel: string;
  storeExecution: string;
  heatingOrHoldingMethod: string;
  shelfLifeStrategy: string;
  packagingConsiderations: string;
}

export interface DirectionDifferentiation {
  whyThisIsNotGeneric: string;
  customerSpecificFit: string;
  regionalOrChannelFit: string;
}

export interface OperationalStrategyRejectedIdea {
  idea: string;
  reason: string;
}

export interface BriefToPitchOperationalStrategy {
  selectedPlaybook: string;
  keyConstraints: string[];
  allowedFormats: string[];
  riskyFormats: string[];
  rejectedIdeas: OperationalStrategyRejectedIdea[];
  conceptStrategy: string;
}

export interface RecipeManufacturingNotes {
  makeAheadComponents: string[];
  moistureMigrationControls: string[];
  textureProtection: string[];
  reheatingOrServingInstructions: string;
  estimatedShelfLifeAssumption: string;
}

export interface RecipeValidationPlan {
  chefValidation: string[];
  opsValidation: string[];
  sensoryValidation: string[];
  regulatoryOrClaimsValidation: string[];
}

export interface RecipeConstraintChecklistItem {
  name: string;
  status: ConstraintStatus;
  explanation: string;
}

export interface BriefToPitchDirection {
  id: string;
  name: string;
  conceptLogic: string;
  flavorProfile: string;
  textureProfile: string;
  factoryFeasibility: string;
  whyItFits: string;
  constraintResponse: DirectionConstraintResponse;
  operationalFit: DirectionOperationalFit;
  differentiation: DirectionDifferentiation;
  riskRating: RiskRating;
  confidence: ConfidenceRating;
}

export interface BriefToPitchRecipe {
  id: string;
  directionId: string;
  name: string;
  description: string;
  targetOccasion: string;
  ingredients: string[];
  prepMethod: string;
  chefNotes: string;
  watchouts: string;
  manufacturingNotes: RecipeManufacturingNotes;
  validationPlan: RecipeValidationPlan;
  constraintChecklist: RecipeConstraintChecklistItem[];
}

export interface BriefToPitchOutput {
  brief?: {
    text: string;
    context: unknown;
  };
  operationalStrategy: BriefToPitchOperationalStrategy;
  interpretation: {
    targetAudience: string;
    emotionalKeywords: string[];
    hiddenRequirements: string[];
    constraints: string[];
  };
  marketSignals: {
    cuisineInspiration: string[];
    trendSignals: string[];
    seasonalIngredients: string[];
  };
  directions: BriefToPitchDirection[];
  recipes: BriefToPitchRecipe[];
  pitchPackage: {
    executiveSummary: string;
    gammaPrompt: string;
  };
  imagePrompts: string[];
}
