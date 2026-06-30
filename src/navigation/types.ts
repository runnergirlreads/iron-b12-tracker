import { NavigatorScreenParams } from '@react-navigation/native';

export type SymptomsStackParamList = {
  SymptomsMain: undefined;
  SymptomTrends: undefined;
};

export type MoreStackParamList = {
  MoreMenu: undefined;
  Reports: undefined;
  PeriodTracker: undefined;
  FoodJournal: undefined;
  Notes: undefined;
  Profile: undefined;
  Settings: undefined;
};

export type RootTabParamList = {
  Dashboard: undefined;
  Symptoms: NavigatorScreenParams<SymptomsStackParamList>;
  Medications: undefined;
  Labs: undefined;
  More: NavigatorScreenParams<MoreStackParamList>;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootTabParamList {}
  }
}
