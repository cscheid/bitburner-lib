import { getSharedState } from "/lib/shared-state.js";

export function getBitNodeMultipliers(ns) {
  let state = getSharedState(ns, "bb");
  if (state.BitNodeMultipliers === undefined) {
    // deep copy the initial value
    state.BitNodeMultipliers = JSON.parse(JSON.stringify(BitNodeMultipliers));
  }
  return state.BitNodeMultipliers;
}

export const BitNodeMultipliers = {
  HackingLevelMultiplier: 1,
  StrengthLevelMultiplier: 1,
  DefenseLevelMultiplier: 1,
  DexterityLevelMultiplier: 1,
  AgilityLevelMultiplier: 1,
  CharismaLevelMultiplier: 1,

  ServerGrowthRate: 1,
  ServerMaxMoney: 1,
  ServerStartingMoney: 1,
  ServerStartingSecurity: 1,
  ServerWeakenRate: 1,

  HomeComputerRamCost: 1,

  PurchasedServerCost: 1,
  PurchasedServerSoftcap: 1,
  PurchasedServerLimit: 1,
  PurchasedServerMaxRam: 1,

  CompanyWorkMoney: 1,
  CrimeMoney: 1,
  HacknetNodeMoney: 1,
  ManualHackMoney: 1,
  ScriptHackMoney: 1,
  ScriptHackMoneyGain: 1,
  CodingContractMoney: 1,

  ClassGymExpGain: 1,
  CompanyWorkExpGain: 1,
  CrimeExpGain: 1,
  FactionWorkExpGain: 1,
  HackExpGain: 1,

  FactionPassiveRepGain: 1,
  FactionWorkRepGain: 1,
  RepToDonateToFaction: 1,

  AugmentationMoneyCost: 1,
  AugmentationRepCost: 1,

  InfiltrationMoney: 1,
  InfiltrationRep: 1,

  FourSigmaMarketDataCost: 1,
  FourSigmaMarketDataApiCost: 1,

  CorporationValuation: 1,
  CorporationSoftCap: 1,

  BladeburnerRank: 1,
  BladeburnerSkillCost: 1,

  GangSoftcap: 1,

  DaedalusAugsRequirement: 1,

  StaneksGiftPowerMultiplier: 1,
  StaneksGiftExtraSize: 0,

  WorldDaemonDifficulty: 1,
};

// fake bitnode 2 while we we're there.
BitNodeMultipliers.HackingLevelMultiplier = 0.8;
BitNodeMultipliers.ServerGrowthRate = 0.8;
BitNodeMultipliers.ServerMaxMoney = 0.2;
BitNodeMultipliers.ServerStartingMoney = 0.4;
BitNodeMultipliers.CrimeMoney = 3;
BitNodeMultipliers.InfiltrationMoney = 3;
BitNodeMultipliers.FactionWorkRepGain = 0.5;
BitNodeMultipliers.FactionPassiveRepGain = 0;
BitNodeMultipliers.StaneksGiftPowerMultiplier = 2;
BitNodeMultipliers.StaneksGiftExtraSize = -6;
BitNodeMultipliers.PurchasedServerSoftcap = 1.3;
BitNodeMultipliers.CorporationSoftCap = 0.9;
BitNodeMultipliers.WorldDaemonDifficulty = 5;
